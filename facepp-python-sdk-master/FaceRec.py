#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: hello.py
import cv2
import numpy as np
import matplotlib.image as img
from DecTree import *

# Camera 0 is the integrated web cam on my netbook
camera_port = 0

#Number of frames to throw away while the camera adjusts to light levels
ramp_frames = 30

# Now we can initialize the camera capture object with the cv2.VideoCapture class.
# All it needs is the index to a camera port.
camera = cv2.VideoCapture(camera_port)

# Captures a single image from the camera and returns it in PIL format
def get_image():
    # read is the easiest way to get a full image out of a VideoCapture object.
    retval, im = camera.read()
    return im

# Ramp the camera - these frames will be discarded and are only used to allow v4l2
# to adjust light levels, if necessary
for i in xrange(ramp_frames):
 temp = get_image()
print("Taking image...")
cv2.namedWindow("preview")

if camera.isOpened(): # try to get the first frame
    rval, frame = camera.read()
else:
    rval = False

while rval:
    cv2.imshow("preview", frame)
    rval, frame = camera.read()
    key = cv2.waitKey(20)
    if key == 27: # exit on ESC
        camera_capture = get_image()
        file = "C:/Users/Shaham/Documents/MyProjects/capstone/facepp-python-sdk-master/test_image.png"
        # A nice feature of the imwrite method is that it will automatically choose the
        # correct format based on the file extension you provide. Convenient!
        cv2.imwrite(file, camera_capture)
        break
cv2.destroyWindow("preview")
# Take the actual image we want to keep

# You'll want to release the camera, otherwise you won't be able to create a new
# capture object until your script exits
del(camera)


# In this tutorial, you will learn how to call Face ++ APIs and implement a
# simple App which could recognize a face image in 3 candidates.
# You need to register your App first, and enter you API key/secret.
API_KEY = '28fbdbef3093f25ff6771286febc5e81'
API_SECRET = 'mHX0i1CGvQRGI6Cd6D_SYiuw2g6ZIKSe'

# Import system libraries and define helper functions
import time
from pprint import pformat
def print_result(hint, result):
    def encode(obj):
        if type(obj) is unicode:
            return obj.encode('utf-8')
        if type(obj) is dict:
            return {encode(k): encode(v) for (k, v) in obj.iteritems()}
        if type(obj) is list:
            return [encode(i) for i in obj]
        return obj
    print hint
    result = encode(result)
    print '\n'.join(['  ' + i for i in pformat(result, width = 75).split('\n')])

# First import the API class from the SDK
from facepp import *

api = API(API_KEY, API_SECRET)

url = 'test_image.png'
FACES = {'Shaham': api.detection.detect(img = File(url), attribute = ('glass','pose','gender','age','race','smiling'))}

#url = 'http://whoisintoday.pilots.bbcconnectedstudio.co.uk/wp-content/uploads/2015/05/brandon-flowers-1920x1080.jpg'
#url = 'http://www.askdrmanny.com/wp-content/uploads/2014/12/people-eating-restaurant-2.jpg'
#FACES = {'Shaham': api.detection.detect(url = url, attribute = ('glass','pose','gender','age','race','smiling'))}

genders = []
ages = []
glasses = []
smilings = []
for name, face in FACES.iteritems():
    print_result(name, face)
    width = face['img_width']
    height = face['img_height']
    print len(face['face'])
    if len(face['face']) > 0:
        for each_face in face['face']:

            attribute = each_face['attribute']
            genders.append(attribute['gender'])
            ages.append(attribute['age'])
            glasses.append(attribute['glass'])
            smilings.append(attribute['smiling'])

            image = cv2.imread(url)
            #print image
            pt1 = (int(each_face['position']['center']['x']*width/100-each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100+each_face['position']['height']*height/100/2))
            pt2 = (int(each_face['position']['center']['x']*width/100+each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100-each_face['position']['height']*height/100/2))
            image = cv2.rectangle(image,pt1,pt2,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['eye_left']['x']*width/100),int(each_face['position']['eye_left']['y']*height/100)),3,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['eye_right']['x']*width/100),int(each_face['position']['eye_right']['y']*height/100)),3,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['nose']['x']*width/100),int(each_face['position']['nose']['y']*height/100)),3,(0,255,0),-1)
            image = cv2.circle(image,(int(each_face['position']['mouth_left']['x']*width/100),int(each_face['position']['mouth_left']['y']*height/100)),3,(0,255,0),-1)
            image = cv2.circle(image,(int(each_face['position']['mouth_right']['x']*width/100),int(each_face['position']['mouth_right']['y']*height/100)),3,(0,255,0),-1)
            cv2.imshow('preview',image)
            cv2.waitKey(0)
            cv2.imwrite('test_image.png',image)

"""            ages.append(age['value'])
            glasses.append(glass['value'])
            smilings.append(smiling['value'])
            for attribute, face_id, position, tag in detail:
                 for age, gender, glass, pose, race, smiling in attribute:
                     genders.append(gender['value'])
                     ages.append(age['value'])
                     glasses.append(glass['value'])
                     smilings.append(smiling['value'])
"""
test_x = np.zeros((1,2))

print 'Genders:' + str(genders)
print 'Ages:' + str(ages)
print 'Glasses?:' + str(glasses)
print 'Smiling?' + str(smilings)


for i in genders:
    if (i['value'] == 'Male'):
        test_x[0,0] += 1*i['confidence']/100
    elif (i['value'] == 'Female'):
        test_x[0,0] += -1*i['confidence']/100

for i in ages:
    test_x[0, 1] += i['value']

test_x[0, 1] = test_x[0,1]/len(ages)
test_x[0, 0] = test_x[0,0]/len(genders)
print str(test_x)

X = [[1, 10], [1, 20], [-1, 10], [0, 30], [-1, 30], [0, 5], [1, 55]]
Y = [1,2,3,4,5,6,7]
clf = create_tree(X,Y)
prediction = predict(clf, test_x)
print prediction