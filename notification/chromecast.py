### Play a notification out loud through a Chromecast device like Google Home Mini
## HOW IT WORKS: the chromecast_play.py script uses gTTS to make a mp3 out of the notification message and request the chromecast 
##               device to play it. The file is exposed through a nginx webserver
## DEPENDENCIES:
# OS: python3 nginx
# Python: pychromecast gtts
## CONFIGURATION:
# required: hostname
# optional: 
## COMMUNICATION:
# INBOUND: 
# - NOTIFY: receive a notification request
# OUTBOUND: 

from sdk.python.module.notification import Notification

import sdk.python.utils.command
import sdk.python.utils.exceptions as exception

class Chromecast(Notification):
    # What to do when initializing
    def on_init(self):
        # configuration settings
        self.house = {}
        # require configuration before starting up
        self.config_schema = 1
        self.add_configuration_listener("house", 1, True)
        self.add_configuration_listener(self.fullname, "+", True)

    # What to do when running
    def on_start(self):
        self.log_info("Starting webserver...")
        self.log_debug(sdk.python.utils.command.run("mkdir -p /var/run/nginx"))
        self.log_debug(sdk.python.utils.command.run("mkdir -p /var/www/html"))
        self.log_debug(sdk.python.utils.command.run("cp -f setup/nginx.conf /etc/nginx/conf.d/default.conf"))
        self.log_debug(sdk.python.utils.command.run("killall nginx; sleep 3; nginx"))
            
    # What to do when shutting down
    def on_stop(self):
        pass
        
   # What to do when ask to notify
    def on_notify(self, severity, text):
        self.log_debug("Saying: "+text)
        self.log_debug(sdk.python.utils.command.run(["python3", "setup/chromecast_play.py", self.config["local_ip"], self.config["device_ip"], self.house["language"], text], shell=False))

     # What to do when receiving a new/updated configuration for this module    
    def on_configuration(self, message):
        if message.args == "house" and not message.is_null:
            if not self.is_valid_configuration(["language"], message.get_data()): return False
            self.house = message.get_data()
        # module's configuration
        if message.args == self.fullname and not message.is_null:
            if message.config_schema != self.config_schema: 
                return False
            if not self.is_valid_configuration(["device_ip", "local_ip"], message.get_data()): return False
            self.config = message.get_data()