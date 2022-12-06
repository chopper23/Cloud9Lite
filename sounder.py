#!/usr/bin/python
import time
import sys, getopt
import pygame as pg
import os


freq = 44100    # audio CD quality
bitsize = -16   # unsigned 16 bit
channels = 2    # 1 is mono, 2 is stereo
buffer = 2048   # number of samples (experiment to get right sound)
pg.mixer.init(freq, bitsize, channels, buffer)
# optional volume 0 to 1.0
pg.mixer.music.set_volume(1.0)

def play_music(music_file):
    '''
    stream music with mixer.music module in blocking manner
    this will stream the sound from disk while playing
    '''
    clock = pg.time.Clock()
    try:
        pg.mixer.music.load(music_file)
        print("Music file {} loaded!".format(music_file))
    except pg.error:
        print("File {} not found! {}".format(music_file, pg.get_error()))
        return

    pg.mixer.music.play()
    
    # for x in range(0,100):
    #     pg.mixer.music.set_volume(float(x)/100.0)
    #     time.sleep(.0075)
    # # check if playback has finished
    while pg.mixer.music.get_busy():
        clock.tick(30)

def main(argv):      
    try: 
        volume = int(argv[0])/255.0
    except ValueError:
        print "Volume argument invalid. Please use a float (0.0 - 1.0)"
        pg.mixer.music.fadeout(1000)
        pg.mixer.music.stop()
        raise SystemExit
    try: 
        track = argv[1]
    except ValueError:
        print "Song argument invalid. Name that tune"
        pg.mixer.music.fadeout(1000)
        pg.mixer.music.stop()
        raise SystemExit

    print("Playing at volume: " + str(volume)+ "\n")
    pg.mixer.music.set_volume(volume)

    if track == "white":
        song = "0001.mp3"
    elif track == "brook":
        song = "0002.mp3"
    elif track == "storm":
        song = "0003.mp3"
        
    try:
        play_music("/home/pi/Cloud9Lite/static/"+song)
        time.sleep(.25)
    except KeyboardInterrupt:
        # if user hits Ctrl/C then exit
        # (works only in console mode)
        pg.mixer.music.fadeout(1000)
        pg.mixer.music.stop()
        raise SystemExit
    sys.exit()

# Main program logic follows:
if __name__ == '__main__':
    main(sys.argv[1:])