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
import os.path
import uuid
import time

from neopixel import *
from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

light = "lightoff"
sound = "soundoff"
color = "#000000"
brightness = 50
old_brightness = 50
volume = 0
scene = "sceneoff"


# LED strip configuration:
LED_COUNT      = 119      # Number of LED pixels.
LED_PIN        = 10      # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 5       # DMA channel to use for generating signal (try 5)
#LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53
LED_STRIP      = ws.WS2811_STRIP_GRB   # Strip type and colour ordering

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
            (r"/(style\.css)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(script\.js)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(favicon\.ico)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(cloudguy\.jpg)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
            (r"/(shade\.gif)", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
        ]
        super(Application, self).__init__(handlers, **settings)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")
        
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
        
        print message
        if message[0] == "#":
            #light = "rgb"
            color = message
        elif message[0] == "!":
            brightness = int(message[1:])
        elif message[0] == "^":
            volume = message[1:]
        elif message == "lamp":
            light = message
            brightness = 255
            color = "#FFFFFF"
        elif message == "glow":
            light = message
            brightness = 50
            color = "#FFFFFF"
        elif message == "night":
            light = message
            brightness = 50
            color = "#FFFF33"
        elif message == "storm":
            light = "lightoff"
            sound = message
            color = "#FFFFFF"
            scene = message
            brightness = 50
            volume = 50
        elif message == "sceneoff":
            light = "lightoff"
            sound = "soundoff"
            scene = message
            brightness = 0
            volume = 0
            color = "#FFFFFF"
        elif message == "lightoff":
            light = message
            brightness = 0
            color = "#FFFFFF"
        elif message == "white":
            sound = message
            volume = 50
        elif message == "brook":
            sound = message
            volume = 50
        elif message == "soundoff":
            sound = message
            volume = 0
            
        colorWipe(strip, Color(*hex_to_rgb(color)), brightness)
        
        for client in CloudSH.clients:
            client.write_message({'light': light, 'sound': sound, 'color': color, "brightness": brightness, "volume": volume, "scene": scene})
        

    def on_close(self):
        CloudSH.clients.remove(self)
        print("Connection Closed")

def colorWipe(strip, color, brightness, wait_ms=50):
    """Wipe color across display a pixel at a time."""
    print color, brightness
    if old_brightness <> brightness:
        strip.setBrightness(brightness)
        
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
        strip.show()
        time.sleep(wait_ms/1000.0)
        
def hex_to_rgb(value):
    """Return (red, green, blue) for the color given as #rrggbb."""
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))
    
def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, brightness, LED_CHANNEL, LED_STRIP)
    strip.begin()
    main()