### forward notifications to a list of configured devices running the eGeoffrey mobile app
## HOW IT WORKS: the notification is sent to eGeoffrey's API server which redirects it to the device. The eGeoffrey mobile app has
##               to be installed first on the mobile device and the device token (get it from  the 'About' menu) used to configured this module
## DEPENDENCIES:
# OS:
# Python: 
## CONFIGURATION:
# required: "devices"
# optional: 
## COMMUNICATION:
# INBOUND: 
# - NOTIFY: receive a notification request
# OUTBOUND: 

import json
import requests

from sdk.python.module.notification import Notification

import sdk.python.utils.web
import sdk.python.utils.exceptions as exception

class Mobile(Notification):
    # What to do when initializing
    def on_init(self):
        # constants
        self.api_server = "https://api.egeoffrey.com/api/v1/notify"
        # configuration settings
        self.house = {}
        # require configuration before starting up
        self.config_schema = 1
        self.add_configuration_listener("house", 1, True)
        self.add_configuration_listener(self.fullname, "+", True)

    # What to do when running
    def on_start(self):
        pass
        
    # What to do when shutting down
    def on_stop(self):
        pass

    # What to do when ask to notify
    def on_notify(self, severity, text):
        # build the data payload to send to the api server
        data = {}
        devices = self.config["devices"].replace(" ","").split(",")
        data["gateway_hostname"] = self.gateway_hostname
        data["house_id"] = self.house_id
        data["house_name"] = self.house["name"]
        data["severity"] = severity
        data["message"] = text
        data["devices"] = devices
        self.log_debug("Payload: "+str(data))
        # send the notification to the api server
        try:
            response = requests.post(url = self.api_server, data = json.dumps(data))
            response.raise_for_status()
        except Exception,e: 
            self.log_warning("unable to notify: "+exception.get(e))
            return
        # parse the response
        try:
            response_json = json.loads(response.text)
        except Exception,e: 
            self.log_warning("unable to parse response "+response.text+": "+exception.get(e))   
            return
        if "success" not in response_json:
            self.log_warning("invalid response: "+response.text)
            return
        if response_json["success"] != len(devices):
            self.log_warning("unable to notify all the devices ("+str(response_json["success"])+"/"+str(len(devices))+")")
            return

     # What to do when receiving a new/updated configuration for this module    
    def on_configuration(self, message):
        if message.args == "house" and not message.is_null:
            if not self.is_valid_configuration(["name"], message.get_data()): return False
            self.house = message.get_data()
        # module's configuration
        if message.args == self.fullname and not message.is_null:
            if message.config_schema != self.config_schema: 
                return False
            if not self.is_valid_configuration(["devices"], message.get_data()): return False
            self.config = message.get_data()