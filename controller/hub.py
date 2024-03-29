### controller/hub: request module executions and receive measures from sensors
## HOW IT WORKS: 
## DEPENDENCIES:
# OS: 
# Python: 
## CONFIGURATION:
# required: calculate, retain
# optional: 
## COMMUNICATION:
# INBOUND: 
# - IN: new value coming from a sensor (soliceted or unsolicited)
# - POLL: requested to invoke the service associated to the sensor
# - SET: asked to set a new value to a sensor
# OUTBOUND: 
# - service/* IN: invoke the service associated to the sensor
# - service/* OUT: trigger an action to an actuator
# - controller/db CALC_HOUR_STATS/CALC_DAY_STATS: periodically calculate aggregates
# - controller/db PURGE_SENSOR: periodically purge old data
# - controller/db SAVE: save new measures

from sdk.python.module.controller import Controller
from sdk.python.module.helpers.scheduler import Scheduler
from sdk.python.module.helpers.message import Message
from sdk.python.utils.datetimeutils import DateTimeUtils

import sdk.python.utils.command
import sdk.python.utils.numbers
import sdk.python.utils.strings
import sdk.python.utils.exceptions as exception

class Hub(Controller):
    # What to do when initializing    
    def on_init(self):
        # module's configuration
        self.config = {}
        # map sensor_id with its configuration, latest value and timestamp of the latest value
        self.sensors = {}
        # scheduler is needed for polling sensors
        self.scheduler = Scheduler(self)
        # date/time helper
        self.date = None
        # request required configuration files
        self.config_schema = 4
        self.sensors_config_schema = 1
        self.add_configuration_listener(self.fullname, "+", True)
        self.add_configuration_listener("house", 1, True)
        # subscribe for acknowledgments from the database for saved values
        self.add_inspection_listener("controller/db", "*/*", "SAVED", "#")

   
    # what to do during execution of the sensor's schedule
    def run_sensor(self, sensor_id):
        # prepare and send a message to the requested module
        sensor = self.sensors[sensor_id]["config"]
        if "service" in sensor and sensor["service"]["mode"] == "pull":
            message = Message(self)
            message.recipient = "service/"+sensor["service"]["name"]
            message.command = "IN"
            message.args = sensor_id
            message.set_data(sensor["service"]["configuration"])
            self.log_debug("["+sensor_id+"] requesting "+message.recipient+" for "+str(message.get_data()))
            self.send(message)
     
    # calculate hourly/daily aggregated statistics for all the sensors
    def calculate_stats(self, group_by):
        self.log_debug("Requesting database to calculate "+group_by+" statistics")
        for sensor_id in self.sensors:
            sensor = self.sensors[sensor_id]["config"]
            # if we need to calculate aggregated statistics for this sensor
            if "calculate" in sensor and sensor["calculate"] in self.config["calculate"]:
                # ask the database module to calculate the aggregated statistics
                message = Message(self)
                message.recipient = "controller/db"
                message.command = "CALC_"+group_by.upper()+"_STATS"
                message.args = sensor_id
                message.set_data(self.config["calculate"][sensor["calculate"]]["operations"])
                self.send(message)

    # apply configured retention policies for all the sensors
    def retention_policies(self):
        for sensor_id in self.sensors:
            sensor = self.sensors[sensor_id]["config"]
            # if we need to apply retention policies for this sensor
            if "retain" in sensor and sensor["retain"] in self.config["retain"]:
                # ask the database module to purge the data
                message = Message(self)
                message.recipient = "controller/db"
                message.command = "PURGE_SENSOR"
                message.args = sensor_id
                message.set_data(self.config["retain"][sensor["retain"]]["policies"])
                self.send(message)

    # schedule a given sensor for execution
    def add_sensor(self, sensor_id, sensor):
        self.log_debug("Received configuration for sensor "+sensor_id)
        # clean it up first
        self.remove_sensor(sensor_id)
        self.sensors[sensor_id] = {}
        self.sensors[sensor_id]["config"] = sensor
                
    # delete a sensor
    def remove_sensor(self, sensor_id):
        if sensor_id in self.sensors: 
            self.log_debug("Removing sensor "+sensor_id)
            del self.sensors[sensor_id]
        # unpin the latest value of the sensor
        if "pin_last_values" in self.config and self.config["pin_last_values"]:
            message = Message(self)
            message.recipient = "*/*"
            message.command = "LAST_VALUE"
            message.args = sensor_id
            message.retain = True
            message.set_null()
            self.send(message)     
        
    # What to do when running
    def on_start(self):
        # 1) ask for all sensor's configuration
        self.add_configuration_listener("sensors/#", "+")
        # 2) schedule statistics calculation
        # every hour (just after the top of the hour) calculate for each sensor statistics of the previous hour
        job = {"func": self.calculate_stats, "trigger": "cron", "minute": 0, "second": sdk.python.utils.numbers.randint(1,59), "args": ["hour"]}
        self.scheduler.add_job(job)
        # every day (just after midnight) calculate for each sensor statistics of the previous day (using hourly averages)
        job = {"func": self.calculate_stats, "trigger": "cron", "hour": 0, "minute": 0, "second": sdk.python.utils.numbers.randint(1,59), "args": ["day"]}
        self.scheduler.add_job(job)
        # 3) schedule to apply configured retention policies (every day just after 1am)
        job = {"func": self.retention_policies, "trigger":"cron", "hour": 1, "minute": 0, "second": sdk.python.utils.numbers.randint(1,59)}
        self.scheduler.add_job(job)
        # 4) start the scheduler 
        self.scheduler.start()
        
    # What to do when shutting down
    def on_stop(self):
        # stop the scheduler
        self.scheduler.stop()

    # save the value assigned to sensor_id in the database
    def save_value(self, sensor_id, message):
        # 1) normalize the data structure and add current timestamp if not provided by the sensor
        if not message.has("value"):
            # value is missing, assume the value is in the data
            value = message.get_data()
            message.set("value", value)
        # if a timestamp is provided, assume it is in UTC format, apply the local timezone
        if message.has("timestamp"):
            message.set("timestamp", self.date.timezone(message.get("timestamp")))
        # if no timestamp is provided, add the current timestamp (in the local timezone)
        else:
            message.set("timestamp", self.date.now())
        # 2) post-process the value if requested
        sensor = self.sensors[sensor_id]["config"]
        if "post_processor" in sensor and sensor["post_processor"] in self.config["processors"]:
            try:
                orig_value = message.get("value")
                command = self.config["processors"][sensor["post_processor"]].replace("%value%",str(orig_value))
                message.set("value", sdk.python.utils.command.run(command))
                self.log_debug("["+sensor_id+"] post-processing "+str(orig_value)+" into "+str(message.get("value")))
            except Exception,e: 
                self.log_error("["+sensor_id+"] Unable to post-process "+str(orig_value)+" by running "+str(command)+": "+exception.get(e))
                return None
        # 3) normalize the value according to its format
        try:
            message.set("value", sdk.python.utils.numbers.normalize(message.get("value"), sensor["format"]))
        except Exception,e: 
            self.log_error("["+sensor_id+"] Unable to normalize "+str(message.get("value"))+": "+exception.get(e))
            return None
        # 4) if we are requested to save the same value of the latest in a very short time, ignore it
        if "duplicates_tolerance" in self.config and "value" in self.sensors[sensor_id]:
            if self.sensors[sensor_id]["value"] == sdk.python.utils.strings.truncate(str(message.get("value")), 50) and abs(message.get("timestamp") - self.sensors[sensor_id]["timestamp"]) <= self.config["duplicates_tolerance"]:
                self.log_debug("["+sensor_id+"] ignoring duplicated value "+self.sensors[sensor_id]["value"])
                return None
        # 5) check if it is an acceptable value
        if "min_value" in sensor and sdk.python.utils.numbers.is_number(message.get("value")) and message.get("value") < sensor["min_value"]:
            self.log_debug("["+sensor_id+"] ignoring value "+str(message.get("value"))+" since less then min_value "+str(sensor["min_value"]))
            return None
        if "max_value" in sensor and sdk.python.utils.numbers.is_number(message.get("value")) and message.get("value") > sensor["max_value"]:
            self.log_debug("["+sensor_id+"] ignoring value "+str(message.get("value"))+" since more then max_value "+str(sensor["max_value"]))
            return None
        if "allowed_values" in sensor and str(message.get("value")) not in sensor["allowed_values"].split(","):
            self.log_debug("["+sensor_id+"] ignoring value "+str(message.get("value"))+" since not an allowed value "+str(sensor["allowed_values"]))
            return None
        # 6) attach retention policies to be applied straight away
        if "retain" in sensor and sensor["retain"] in self.config["retain"]:
            message.set("retain", self.config["retain"][sensor["retain"]]["policies"])
        # 7) ask the db to store the value
        message.forward("controller/db")
        message.command = "SAVE"
        message.args = sensor_id
        # 8) request to update hourly/daily stats
        if "calculate" in sensor and sensor["calculate"] in self.config["calculate"]:
            message.set("calculate", self.config["calculate"][sensor["calculate"]]["operations"])
        self.log_debug("["+sensor_id+"] requesting database to store: "+str(message.get_data()))
        self.send(message)
        # 9) cache latest value and timestamp so to prevent saving multiple times the same value
        if "duplicates_tolerance" in self.config and sensor["format"] not in ["calendar", "image", "tasks"]:
            self.sensors[sensor_id]["value"] = sdk.python.utils.strings.truncate(str(message.get("value")), 50)
            self.sensors[sensor_id]["timestamp"] = message.get("timestamp")
        return message.get("value")

    # What to do when receiving a request for this module    
    def on_message(self, message):
        sensor_id = message.args
        if sensor_id not in self.sensors:
            self.log_warning("unable to match service request with registered sensor: "+message.dump())
            return
        # new value coming from a sensor (solicited or unsolicited), save it
        if message.command == "IN":
            # retrieve the sensor_id for which this message is directed to
            sensor = self.sensors[sensor_id]["config"]
            # ignore incoming messages for sensors registered as actuators
            if sensor["service"]["mode"] == "actuator": return
            # save the value in the db
            self.save_value(sensor_id, message)
        # requested to invoke the service associated to the sensor
        elif message.command == "POLL":
            self.run_sensor(sensor_id)
        # asked to set a new value to a sensor, save it and if the sensor has a service associated, send an OUT message
        elif message.command == "SET":
            sensor = self.sensors[sensor_id]["config"]
            # save the value in the db
            value = self.save_value(sensor_id, message)
            # if there is a service associated, forward the message to do the actual action
            if value is not None and "service" in sensor and sensor["service"]["mode"] == "actuator":
                # if the value has to be pre-processed before sending it out to the actuator
                if "pre_processor" in sensor and sensor["pre_processor"] in self.config["processors"]:
                    try:
                        orig_value = message.get("value")
                        command = self.config["processors"][sensor["pre_processor"]].replace("%value%",str(orig_value))
                        message.set("value", sdk.python.utils.command.run(command))
                        self.log_debug("["+sensor_id+"] pre-processing "+str(orig_value)+" into "+str(message.get("value")))
                    except Exception,e: 
                        self.log_error("["+sensor_id+"] Unable to pre-process "+str(orig_value)+" by running "+str(command)+": "+exception.get(e))
                        return None
                # forward the message to the service
                message.forward("service/"+sensor["service"]["name"])
                message.command = "OUT"
                # merge the request with the service's configuration
                data = message.get_data()
                data.update(sensor["service"]["configuration"])
                message.set_data(data)
                self.send(message)
        # the database just stored a new value, print it out since we have the sensor's context
        elif message.sender == "controller/db" and message.command == "SAVED":
            # catch only new values saved, not aggregations run
            if message.has("from_save") and message.get("from_save"):
                sensor = self.sensors[sensor_id]["config"]
                # log new value
                description = sensor["description"] if "description" in sensor else ""
                unit = sensor["unit"] if "unit" in sensor else ""
                orig_value = message.get("value")
                value = sdk.python.utils.strings.truncate(message.get("value"), 50)+unit
                if sensor["format"] == "calendar": value = "<calendar>"
                elif sensor["format"] == "image": value = "<image>"
                elif sensor["format"] == "position": value = "<position>"
                elif sensor["format"] == "tasks": value = "<tasks>"
                self.log_info("["+self.date.timestamp2date(message.get("timestamp"))+"] ["+sensor_id+"] \""+description+"\": "+str(value))
                # new values are handled like notifications with a "value" severity
                alert_text = sensor["description"]+": "+str(value) if "description" in sensor else sensor_id+": "+str(value)
                message = Message(self)
                message.recipient = "*/*"
                message.command = "NOTIFY"
                message.args = "value/"+sensor_id
                message.set_data(alert_text)
                self.send(message)
                # pin the latest value to the broker
                if "pin_last_values" in self.config and self.config["pin_last_values"]:
                    message = Message(self)
                    message.recipient = "*/*"
                    message.command = "LAST_VALUE"
                    message.args = sensor_id
                    message.retain = True
                    message.set("value", orig_value if sdk.python.utils.numbers.is_number(orig_value) else value)
                    message.set("timestamp", self.date.timestamp2date(self.date.now()))
                    self.send(message)                
                # save the notification in the db
                message = Message(self)
                message.recipient = "controller/db"
                message.command = "SAVE_ALERT"
                message.args = "value"
                message.set_data(alert_text)
                self.send(message)

     # What to do when receiving a new/updated configuration for this module
    def on_configuration(self, message):
        # ignore deleted configuration files while service is restarting
        if message.is_null and not message.args.startswith("sensors/"): return
        # module's configuration
        if message.args == self.fullname and not message.is_null:
            # upgrade the config schema
            if message.config_schema == 1:
                config = message.get_data()
                config["duplicates_tolerance"] = 3
                self.upgrade_config(message.args, message.config_schema, 2, config)
                return False
            elif message.config_schema == 2:
                config = message.get_data()
                config["processors"] = config["post_processors"]
                del config["post_processors"]
                self.upgrade_config(message.args, message.config_schema, 3, config)
                return False
            elif message.config_schema == 3:
                config = message.get_data()
                config["pin_last_values"] = False
                self.upgrade_config(message.args, message.config_schema, 4, config)
                return False
            if message.config_schema != self.config_schema: 
                return False
            if not self.is_valid_configuration(["calculate", "retain", "processors"], message.get_data()): return False
            self.config = message.get_data()
        # we need the house timezone to set the timestamp when not provided by the sensor
        elif message.args == "house" and not message.is_null:
            if not self.is_valid_configuration(["timezone"], message.get_data()): return False
            self.date = DateTimeUtils(message.get("timezone"))
        # add/remove sensor
        elif message.args.startswith("sensors/"):
            if not self.configured: 
                return
            if message.config_schema != self.sensors_config_schema: 
                return
            sensor_id = message.args.replace("sensors/","")
            if message.is_null: 
                self.remove_sensor(sensor_id)
            else: 
                sensor = message.get_data()
                if not self.is_valid_configuration(["format"], sensor): return
                if "disabled" in sensor and sensor["disabled"]: self.remove_sensor(sensor_id)
                else: self.add_sensor(sensor_id, sensor)
