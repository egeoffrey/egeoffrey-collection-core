#!/usr/bin/python3
# Usage: chromecast_play.py <local_ip> <device_ip> <language> <what to say>
import sys
import pychromecast
import os
import os.path
from gtts import gTTS
import time

# file to create and play 
audio_output = "audio_output.mp3"
#web port to expose
port = "8081"
# get the local ip address
local_ip = sys.argv[1]
# get ip of the chromecast device
device_ip = sys.argv[2]
# get the language
lang = sys.argv[3]
# get what to say
say = sys.argv[4]

# connect to the chromecast device
castdevice = pychromecast.Chromecast(device_ip)
castdevice.wait()

# delete the file
if os.path.isfile("/var/www/html/"+audio_output): os.remove("/var/www/html/"+audio_output)

# create the audio file
tts = gTTS(say, lang=lang)
tts.save("/var/www/html/"+audio_output)

# ask the device to play the file
mc = castdevice.media_controller
mc.play_media("http://"+local_ip+":"+port+"/"+audio_output, "audio/mp3")
mc.block_until_active()
mc.pause()
time.sleep(1)
mc.play()
while not mc.status.player_is_idle:
   time.sleep(0.5)
mc.stop()
castdevice.quit_app()
