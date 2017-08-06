# Cloud9Lite

A Tornado based controller for baby night light and sound machine. Using a Raspberry Pi Zero W, Neopixels, and the Adafruit Speaker Bonnet.


Setup instructions based on a basically configured Raspbian Jessie Lite:

  - Install pip
  ```
  sudo apt-get install python-pip
  ```

  - Install Tornado
  ```
  sudo pip install Tornado
  ```
  
  - Install git
  ```
  sudo apt-get install git
  ```
  
  - Install Neopixel library
  ```
  sudo apt-get install build-essential python-dev git scons swig
  git clone https://github.com/jgarff/rpi_ws281x.git
  cd rpi_ws281x
  scons
  cd python
  sudo python setup.py install
  ```
  
  - Configure Neopixel test
  ```
  cd examples
  sudo nano strandtest.py
  ```
  
  -Edit any details like number of LEDs or pin number. Save. Run.
  ```
  sudo python strandtest.py
  ```
