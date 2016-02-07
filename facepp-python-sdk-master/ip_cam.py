import cv2
import urllib
import numpy as np
import os
 
# Stream the video link
stream=urllib.urlopen('http://100.64.181.109:8080/video?.mjpeg')
bytes=''
while True:
    bytes += stream.read(1024)
    # 0xff 0xd8 is the starting of the jpeg frame
    a = bytes.find('\xff\xd8')
    # 0xff 0xd9 is the end of the jpeg frame
    b = bytes.find('\xff\xd9')
    # Taking the jpeg image as byte stream
    if a!=-1 and b!=-1:
        os.system ( 'clear' )
        jpg = bytes[a:b+2]
        bytes= bytes[b+2:]
        # Decoding the byte stream to cv2 readable matrix format
        i = cv2.imdecode(np.fromstring(jpg, dtype=np.uint8),cv2.CV_LOAD_IMAGE_COLOR)
        # Display
        cv2.imshow('Mobile IP Camera',i)
        print "Press 'q' to exit"
        # Exit key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            exit(0)