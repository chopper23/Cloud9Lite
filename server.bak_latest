#!/usr/bin/env python
#
# Copyright 2009 Facebook
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
"""Simplified chat demo for websockets.

Authentication, error handling, etc are left as an exercise for the reader :)
"""

import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
from tornado import gen
import os.path
import uuid
import sys
import pygame as pg
import os
import time
import random
from tornado.process import Subprocess
import signal
import json
#from subprocess import PIPE

from neopixel import *
from tornado.options import define, options

define("port", default=80, help="run on the given port", type=int)

light = "lightoff"
sound = "soundoff"
color = "#000000"
brightness = 50
old_brightness = 50
volume = 0
scene = "sceneoff"
extProc = 0
music_file = ""
PlayProcess = 0

__UPLOADS__ = "static/audio/"

# LED strip configuration:
LED_COUNT      = 120      # Number of LED pixels.
LED_PIN        = 13      # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10       # DMA channel to use for generating signal (try 5)
#LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 1       # set to '1' for GPIOs 13, 19, 41, 45 or 53
LED_STRIP      = ws.WS2811_STRIP_GRB   # Strip type and colour ordering

freq = 44100    # audio CD quality
bitsize = -16   # unsigned 16 bit
channels = 2    # 1 is mono, 2 is stereo
buffer = 8192   # number of samples (experiment to get right sound)
pg.init()
pg.mixer.init(freq, bitsize, channels, buffer)
pg.mixer.music.set_volume(0.0)

is_closing = False

def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...')
    is_closing = True

def try_exit(): 
    global is_closing
    if is_closing:
        # clean up here
        tornado.ioloop.IOLoop.instance().stop()
        logging.info('exit success')

class Application(tornado.web.Application):
    def __init__(self):
        settings = dict(
            cookie_secret="ohitsmine",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
            debug=True,
        )
        handlers = [
            (r"/", MainHandler),
            (r"/socket/", CloudSH),
            (r"/upload", Upload),
            (r"/(style\.css)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(script\.js)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(favicon\.ico)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(cloudguy\.jpg)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(shade\.gif)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
        ]
        super(Application, self).__init__(handlers, **settings)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        with open('static/audio.json') as f:
            data = json.load(f)
        self.render("index.html", audio_list = data)
        
class CloudSH(tornado.websocket.WebSocketHandler):
    clients = []

    def check_origin(self, origin):
        return True
        
    def open(self):
        CloudSH.clients.append(self)
        print("Connection Opened")

    def on_message(self, message):
        global light
        global sound
        global color
        global brightness
        global volume
        global scene
        global old_brightness
        old_brightness = brightness
        status = ''
        print message
        
        msg = json.loads(message)
        
        
        if message[0] == "#":
            #light = "rgb"
            color = message
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message[0] == "!":
            brightness = int(message[1:])
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message[0] == "^":
            volume = message[1:]
            setVol(volume)
        elif message == "lamp":
            light = message
            brightness = 255
            color = "#FFFFFF"
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message == "glow":
            light = message
            brightness = 50
            color = "#FFFFFF"
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message == "night":
            light = message
            brightness = 50
            color = "#FFFF33"
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message == "storm":
            light = "glow"
            sound = message
            color = "#FFFFFF"
            scene = message
            brightness = 50
            volume = 150
            #play_sound("storm", volume)
            #play_sound("/home/pi/Cloud9Lite/static/0003.mp3", volume)
            #result, error = yield play_sound("/home/pi/Cloud9Lite/static/0003.mp3", volume)
            tornado.ioloop.IOLoop.current().spawn_callback(play_sound("/home/pi/Cloud9Lite/static/0003.mp3", volume))
            #randLightning()
            tornado.ioloop.IOLoop.current().spawn_callback(randLightning)
        elif message == "sceneoff":
            light = "lightoff"
            sound = "soundoff"
            scene = message
            brightness = 0
            volume = 0
            color = "#FFFFFF"
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message == "lightoff":
            light = message
            brightness = 0
            color = "#FFFFFF"
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        elif message == "white":
            sound = message
            volume = 150
            play_sound("/home/pi/Cloud9Lite/static/0001.mp3", volume)
            #play_sound("white", volume)
        elif message == "brook":
            sound = message
            volume = 150
            play_sound("/home/pi/Cloud9Lite/static/0002.mp3", volume)
            #play_sound("brook", volume)
        elif message == "soundoff":
            sound = message
            volume = 0
            #pg.mixer.music.stop()
            global PlayProcess
            #PlayProcess.kill()
            os.killpg(os.getpgid(PlayProcess.pid), signal.SIGTERM)
            PlayProcess = 0

        if msg['cmd'] == "light":
            if msg['val'] == "lamp":
                light = msg['val']
                brightness = 255
                color = "#FFFFFF"
                colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
            elif msg['val'] == "glow":
                light = msg['val']
                brightness = 50
                if color == "#000000":
                    color = "#FFFFFF"
                colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
            elif msg['val'] == "night":
                light = msg['val']
                brightness = 50
                color = "#FFFF33"
                colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
            elif msg['val'] == "lightoff":
                light = msg['val']
                brightness = 0
                color = "#FFFFFF"
                colorWipe(strip, Color(*hex_to_rgb(color)), brightness)

        if msg['cmd'] == "rgb":
            #light = "rgb"
            color =  msg['val']
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)

        if msg['cmd'] == "brightness":
            brightness = int(msg['val'])
            colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        
        if msg['cmd'] == "volume":
            volume = msg['val']
            setVol(volume)
            
        if msg['cmd'] == "audio":
            global PlayProcess
            print "PlayProcess: ", PlayProcess
            if msg['val'] == 'soundoff':
                os.killpg(os.getpgid(PlayProcess), signal.SIGTERM)
                PlayProcess = 0
                sound = 'soundoff'
            else:
                if PlayProcess > 0:
                    os.killpg(os.getpgid(PlayProcess), signal.SIGTERM)
                    PlayProcess = 0
                    sound = 'soundoff'
                if volume == 0:
                    volume = 150
                with open('static/audio.json') as f:
                    data = json.load(f)
                sound = msg['val']
                #tornado.ioloop.IOLoop.current().spawn_callback(play_sound("/home/pi/Cloud9Lite/" + data[msg['val']][0], volume))
                play_music("/home/pi/Cloud9Lite/" + data[msg['val']][0])
        
        if msg['cmd'] == "removeAudio":
            if PlayProcess > 0:
                os.killpg(os.getpgid(PlayProcess), signal.SIGTERM)
                PlayProcess = 0
                sound = 'soundoff'
            with open('static/audio.json') as f:
                data = json.load(f)
            os.remove("/home/pi/Cloud9Lite/" + data[msg['val']][0])        
            del data[msg['val']]
            with open('static/audio.json', 'w') as f:
                json.dump(data, f) 
            status = "refresh"
            
        
        if msg['cmd'] == "scene":
            global PlayProcess
            print "PlayProcess: ", PlayProcess
            if msg['val'] == 'storm':
                if PlayProcess > 0:
                    os.killpg(os.getpgid(PlayProcess), signal.SIGTERM)
                    PlayProcess = 0
                    sound = 'soundoff'
                light = "glow"
                sound = 'storm'
                color = "#FFFFFF"
                brightness = 50
                volume = 150
                scene = 'storm'
                #tornado.ioloop.IOLoop.current().spawn_callback(play_sound("/home/pi/Cloud9Lite/static/0003.mp3", volume))
                tornado.ioloop.IOLoop.current().spawn_callback(play_music("/home/pi/Cloud9Lite/static/0003.mp3"))
                tornado.ioloop.IOLoop.current().spawn_callback(randLightning)            
            
            
        
        for client in CloudSH.clients:
            client.write_message({'status': status, 'light': light, 'sound': sound, 'color': color, "brightness": brightness, "volume": volume, "scene": scene})
        

    def on_close(self):
        CloudSH.clients.remove(self)
        print("Connection Closed")

def soundCtl():
    pass
        
def colorWipe(strip, color, brightness, wait_ms=0):
    """Wipe color across display a pixel at a time."""
    global volume
    print "Color: ", str(color), "; Brightness: ", brightness, "; Volume: ", volume, ";"
    if old_brightness <> brightness:
        strip.setBrightness(brightness)
        
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
        time.sleep(wait_ms/1000.0)
        strip.show()
        
def hex_to_rgb(value):
    """Return (red, green, blue) for the color given as #rrggbb."""
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

@gen.coroutine  
def play_sound(music_file, volume):
    print "Playing..."+music_file
    global PlayProcess
    #PlayProcess = Subprocess(["python sounder.py " + str(volume) + " " + music_file], stdout=Subprocess.STREAM, stderr=Subprocess.STREAM, shell=True,  preexec_fn=os.setsid)
    PlayProcessObj = Subprocess(["mpg123 '" + music_file + "'"], stdout=Subprocess.STREAM, stderr=Subprocess.STREAM, shell=True,  preexec_fn=os.setsid)
    #PlayProcess = Subprocess(["mpg123 " + music_file], shell=True,  preexec_fn=os.setsid)
    #print process
    #out, err = yield [process.stdout.read_until_close(), process.stderr.read_until_close()]
    #print out, err
    print PlayProcessObj.pid
    PlayProcess = PlayProcessObj.pid
    try:
        ret = yield PlayProcessObj.wait_for_exit()
        print "Ret: ", ret
        PlayProcess = 0
    except Exception as e:
        print("Error {}, PlayProcess not found: {}".format(e, PlayProcess))
    
    
@gen.coroutine    
def play_music(music_file):
    '''
    stream music with mixer.music module in blocking manner
    this will stream the sound from disk while playing
    '''
    global volume  
    #clock = pg.time.Clock()
    try:
        pg.mixer.music.load(music_file)
        print("Music file {} loaded!".format(music_file))
    except pygame.error:
        print("File {} not found! {}".format(music_file, pg.get_error()))
        return
    set_volume = float(volume)/float(255)
    set_volume = "{0:.1f}".format(set_volume)
    pg.mixer.music.set_volume(float(set_volume))
    pg.mixer.music.play()
    
    # If you want to fade in the audio...
    #for x in range(0,volume_set):
    #    pg.mixer.music.set_volume(float(x)/volume_set)
    #    time.sleep(.0075)
    # # check if playback has finished
    #while pg.mixer.music.get_busy():
    #   clock.tick(30)    

@gen.coroutine  
def randLightning():
    global sound
    temp_total_time = 0
    while sound == "storm":
        #temp_bright = random.randint(1,255)
        temp_bright = int(255-(255-random.randint(0,255)**(1.5/2.0)))
        temp_start = random.randint(0,110)
        temp_type = random.randint(0,1)
        temp_dirlog = random.choice((True, False))
        temp_dir = 1
        if temp_dirlog:
            temp_dir = -1
        temp_stop = random.randint(10,120-temp_start)+temp_start
        #yield colorWipe(strip, Color(*hex_to_rgb(color)), temp_bright) 
        colorWipe(strip, Color(0, 0, 0), temp_bright) 
        colorSet(strip, Color(*hex_to_rgb(color)), temp_bright, temp_start, temp_stop, temp_type, temp_dir) 
        
        temp_time = random.randint(0,1000)
        #time.sleep((1000-(1000-temp_time**(1/2.0)))/1000)
        yield gen.sleep((1000-(1000-temp_time**(1/2.0)))/1000)
        
        # print("Rand: ", temp_bright, temp_start, temp_stop, temp_time)
        # temp_total_time += temp_time
        # if temp_total_time >= 180000:
            # print temp_total_time
            # break
        
        #if not pg.mixer.music.get_busy():
        #    sound == "soundoff"
        #colorWipe(strip, Color(*hex_to_rgb(color)), temp_bright) 
        #yield time.sleep(random.randint(1,1000)/1000)

def colorSet(strip, color, brightness, start, stop, wipe_type=0, wipe_dir=1, wait_ms=0):
    """Wipe color across display a pixel at a time."""
    global volume
    print "ColorSet: ", str(color), "; Brightness: ", brightness, "; Volume: ", volume, ";", "; Start: ", start, "; Stop: ", stop, "; Type: ", wipe_type, "; Dir: ", wipe_dir
    #global old_brightness
    if old_brightness <> brightness:
        strip.setBrightness(brightness)
        
    # for i in range(strip.numPixels()):
        # if i >= start and i <= stop:
            # strip.setPixelColor(i, color)
        # else:
            # strip.setPixelColor(i, Color(0, 0, 0))
        # strip.show()
        # time.sleep(wait_ms/1000.0)      
    if wipe_dir == -1:
        stoph = stop
        stop = start
        start = stoph
    for i in range(start, stop, wipe_dir):
        print("set ", i)
        strip.setPixelColor(i, color)
        if wipe_type == 0:
            strip.show()    
            time.sleep(wait_ms/1000.0)
    if wipe_type == 1:
        time.sleep(wait_ms/1000.0)
        strip.show()
    for i in range(start, stop, wipe_dir):
        print("clear ", i)
        strip.setPixelColor(i, Color(0, 0, 0))
        if wipe_type == 0:
            strip.show()    
            time.sleep(wait_ms/1000.0)
    if wipe_type == 1:
        time.sleep(wait_ms/1000.0)
        strip.show()
        
def setVol(volume):
    set_volume = float(volume)/float(255)
    #set_volume = "{0:.1f}".format(set_volume)
    #pg.mixer.music.set_volume(float(set_volume))
    set_volume = int(set_volume*100)
    print "Volume..."+str(int(set_volume))
    process = Subprocess(["amixer -q sset 'PCM' " + str(int(set_volume)) + "%"], stdout=Subprocess.STREAM, stderr=Subprocess.STREAM, shell=True)

class Upload(tornado.web.RequestHandler):
    def post(self):
        fileinfo = self.request.files['filearg'][0]
        fname = __UPLOADS__ + fileinfo['filename']
        gname = self.get_body_argument("name")
        cname = str(uuid.uuid4())
        fh = open(fname, 'w')
        fh.write(fileinfo['body'])
        a_dict = {cname: [fname, gname]}
        with open('static/audio.json') as f:
            data = json.load(f)
        data.update(a_dict)
        with open('static/audio.json', 'w') as f:
            json.dump(data, f)
        self.redirect("/")    
    
def main():
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, signal_handler)
    app = Application()
    app.listen(options.port)
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()     
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, brightness, LED_CHANNEL, LED_STRIP)
    strip.begin()
    main()
