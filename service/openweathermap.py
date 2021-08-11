### service/openweathermap: retrieve weather information from OpenWeatherMap
## HOW IT WORKS: 
## DEPENDENCIES:
# OS: 
# Python: 
## CONFIGURATION:
# required: api_key
# optional: 
## COMMUNICATION:
# INBOUND: 
# - IN: 
#   required: request (temperature|pressure|humidity|wind|wind_dir|condition|description|visibility|rain_1h|rain_3h|snow_1h|snow_3h|clouds|uv|forecast_*), latitude, longitude
#   optional: 
# OUTBOUND: 

import json
import datetime
import time
 
from sdk.python.module.service import Service
from sdk.python.utils.datetimeutils import DateTimeUtils

import sdk.python.utils.web
import sdk.python.utils.numbers
import sdk.python.utils.exceptions as exception

class Openweathermap(Service):
   # What to do when initializing
    def on_init(self):
        # constants
        self.url = 'http://api.openweathermap.org/data/2.5/'
        # configuration file
        self.config = {}
        # helpers
        self.units = None
        self.language = None
        # require configuration before starting up
        self.config_schema = 1
        self.add_configuration_listener("house", 1, True)
        self.add_configuration_listener(self.fullname, "+", True)

    # map between user requests and openweathermap requests
    def get_request(self, request):
        if request.startswith("forecast_"): return "forecast"
        elif request == "uv": return "uvi"
        else: return "weather"
        
    # set the value and timestamp to the message
    def set_measure(self, message, value, timestamp):
        message.set("value", value)
        message.set("timestamp", int(timestamp))
    
    # What to do when running    
    def on_start(self):
        pass
    
    # What to do when shutting down
    def on_stop(self):
        pass

    # What to do when receiving a request for this module
    def on_message(self, message):
        if message.command == "IN":
            if not self.is_valid_configuration(["request", "latitude", "longitude"], message.get_data()): return
            sensor_id = message.args
            request = message.get("request")
            location = "lat="+str(message.get("latitude"))+"&lon="+str(message.get("longitude"))
            if self.get_request(request) is None:
                self.log_error("invalid request "+request)
                return
            # if the raw data is cached, take it from there, otherwise request the data and cache it
            cache_key = "/".join([location, self.get_request(request)])
            if self.cache.find(cache_key): 
                data = self.cache.get(cache_key)
            else:
                url = self.url+"/"+self.get_request(request)+"?APPID="+self.config["api_key"]+"&units="+self.units+"&lang="+self.language+"&"+location
                try:
                    data = sdk.python.utils.web.get(url)
                except Exception,e: 
                    self.log_error("unable to connect to "+url+": "+exception.get(e))
                    return
                self.cache.add(cache_key,data)
            # parse the raw data
            try: 
                parsed_json = json.loads(data)
            except Exception,e: 
                self.log_error("invalid JSON returned")
                return
            if not "cod" in parsed_json:
                self.log_error("JSON missing 'cod': "+str(parsed_json))
                return
            if int(parsed_json["cod"]) != 200:
                self.log_error("Invalid response: "+str(parsed_json["message"]))
                return
            # reply to the requesting module 
            message.reply()
            entries = []
            # if a forecast request, multiple entries are returned
            if request.startswith("forecast_"):
                request = request.replace("forecast_", "")
                entries = parsed_json["list"]
            # if a request for current condition, a single request is returned
            else:
                entries = [parsed_json]
            # for each entry
            for entry in entries:
                if request == "temperature":
                    self.set_measure(message, entry["main"]["temp"], entry["dt"])
                elif request == "humidity":
                    self.set_measure(message, entry["main"]["humidity"], entry["dt"])
                elif request == "wind":
                    self.set_measure(message, entry["wind"]["speed"], entry["dt"])
                elif request == "wind_dir":
                    if "deg" not in entry["wind"]: return
                    degrees = entry["wind"]["deg"]
                    direction = "question"
                    if degrees >= 315 or degrees <= 45: direction = "arrow-down"
                    elif degrees > 45 and degrees <= 135: direction = "arrow-left"
                    elif degrees > 135 and degrees <= 225: direction = "arrow-up"
                    elif degrees > 225 and degrees <= 315: direction = "arrow-right"
                    self.set_measure(message, direction, entry["dt"])
                elif request == "pressure":
                    self.set_measure(message, entry["main"]["pressure"], entry["dt"])
                elif request == "visibility":
                    self.set_measure(message, entry["visibility"], entry["dt"])
                elif request == "rain_1h":
                    value = entry["rain"]["1h"] if "rain" in entry and "1h" in entry["rain"] else 0
                    self.set_measure(message, value, entry["dt"])
                elif request == "rain_3h":
                    value = entry["rain"]["3h"] if "rain" in entry and "3h" in entry["rain"] else 0
                    self.set_measure(message, value, entry["dt"])
                elif request == "snow_1h":
                    value = entry["snow"]["1h"] if "snow" in entry and "1h" in entry["snow"]  else 0
                    self.set_measure(message, value, entry["dt"])
                elif request == "snow_3h":
                    value = entry["snow"]["3h"] if "snow" in entry and "3h" in entry["snow"]  else 0
                    self.set_measure(message, value, entry["dt"])
                elif request == "clouds":
                    self.set_measure(message, entry["clouds"]["all"], entry["dt"])
                elif request == "uv":
                    self.set_measure(message, entry["value"], entry["date"])
                elif request == "condition":
                    code = entry["weather"][0]["main"]
                    value = "question"
                    if code in ["Thunderstorm"]: value = "cloud-showers-heavy"
                    elif code in ["Drizzle", "Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Ash", "Squall", "Tornado"]: value = "smog"
                    elif code in ["Rain"]: value = "cloud-rain"
                    elif code in ["Snow"]: value = "snowflake"
                    elif code in ["Clear"]: value = "sun"
                    elif code in ["Clouds"]: value = "cloud"
                    self.set_measure(message, value, entry["dt"])
                elif request == "description":
                    self.set_measure(message,  entry["weather"][0]["description"], entry["dt"])
                    message.set("value", entry["weather"][0]["description"])
                else: 
                    self.log_error("invalid request for "+sensor_id+": "+str(message.get("request")))
                    return
                # send the response back
                self.send(message)

    # What to do when receiving a new/updated configuration for this module
    def on_configuration(self,message):
        # we need house settings
        if message.args == "house" and not message.is_null:
            if not self.is_valid_configuration(["units", "language"], message.get_data()): return False
            self.units = message.get("units")
            self.language = message.get("language")
        # module's configuration
        if message.args == self.fullname and not message.is_null:
            if message.config_schema != self.config_schema: 
                return False
            if not self.is_valid_configuration(["api_key"], message.get_data()): return False
            self.config = message.get_data()
        # register/unregister the sensor
        if message.args.startswith("sensors/"):
            if message.is_null: 
                sensor_id = self.unregister_sensor(message)
            else: 
                sensor_id = self.register_sensor(message)
