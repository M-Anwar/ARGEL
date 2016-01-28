#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: hello.py
import cv2
import matplotlib.image as img

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
# 在本教程中，您将了解到Face ++ API的基本调用方法，并实现一个简单的App，用以在3
# 张备选人脸图片中识别一个新的人脸图片。

# You need to register your App first, and enter you API key/secret.
# 您需要先注册一个App，并将得到的API key和API secret写在这里。
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
#FACES = {'Shaham': api.detection.detect(img = File(url), attribute = ('glass','pose','gender','age','race','smiling'))}

# genders = []
# ages = []
# glasses = []
# smilings = []
# for name, face in FACES.iteritems():
#     print_result(name, face)
#     width = face['img_width']
#     height = face['img_height']
#     print len(face['face'])
#     if len(face['face']) > 0:
#         for each_face in face['face']:
#
#             attribute = each_face['attribute']
#             genders.append(attribute['gender'])
#             ages.append(attribute['age'])
#             glasses.append(attribute['glass'])
#             smilings.append(attribute['smiling'])
#
#
#             image = cv2.imread(url)
#             #print image
#             pt1 = (int(each_face['position']['center']['x']*width/100-each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100+each_face['position']['height']*height/100/2))
#             pt2 = (int(each_face['position']['center']['x']*width/100+each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100-each_face['position']['height']*height/100/2))
#             image = cv2.rectangle(image,pt1,pt2,(0,255,0))
#             image = cv2.circle(image,(int(each_face['position']['eye_left']['x']*width/100),int(each_face['position']['eye_left']['y']*height/100)),3,(0,255,0))
#             image = cv2.circle(image,(int(each_face['position']['eye_right']['x']*width/100),int(each_face['position']['eye_right']['y']*height/100)),3,(0,255,0))
#             image = cv2.circle(image,(int(each_face['position']['nose']['x']*width/100),int(each_face['position']['nose']['y']*height/100)),3,(0,255,0),-1)
#             image = cv2.circle(image,(int(each_face['position']['mouth_left']['x']*width/100),int(each_face['position']['mouth_left']['y']*height/100)),3,(0,255,0),-1)
#             image = cv2.circle(image,(int(each_face['position']['mouth_right']['x']*width/100),int(each_face['position']['mouth_right']['y']*height/100)),3,(0,255,0),-1)
#             cv2.imshow('preview',image)
#             cv2.waitKey(0)
#             cv2.imwrite('test_image.png',image)
#
#             # ages.append(age['value'])
#             # glasses.append(glass['value'])
#             # smilings.append(smiling['value'])
#             # for attribute, face_id, position, tag in detail:
#             #     for age, gender, glass, pose, race, smiling in attribute:
#             #         genders.append(gender['value'])
#             #         ages.append(age['value'])
#             #         glasses.append(glass['value'])
#             #         smilings.append(smiling['value'])
#
# print 'Genders:' + str(genders)
# print 'Ages:' + str(ages)
# print 'Glasses?:' + str(glasses)
# print 'Smiling?' + str(smilings)
#

# Here are the person names and their face images
# 人名及其脸部图片
IMAGE_DIR = 'http://cn.faceplusplus.com/static/resources/python_demo/'
PERSONS = [
     ('Jim Parsons', IMAGE_DIR + '1.jpg')
     #('Leonardo DiCaprio', IMAGE_DIR + '2.jpg'),
    # ('Andy Liu', IMAGE_DIR + '3.jpg')
 ]
TARGET_IMAGE = IMAGE_DIR + '4.jpg'

# # Step 1: Detect faces in the 3 pictures and find out their positions and
# # attributes
# # 步骤1：检测出三张输入图片中的Face，找出图片中Face的位置及属性
#
FACES = {name: api.detection.detect(url = url)
         for name, url in PERSONS}

for name, face in FACES.iteritems():
     print_result(name, face)


# # Step 2: create persons using the face_id
# # 步骤2：引用face_id，创建新的person
# for name, face in FACES.iteritems():
#     rst = api.person.create(
#             person_name = name, face_id = face['face'][0]['face_id'])
#     print_result('create person {}'.format(name), rst)
#
# # Step 3: create a new group and add those persons in it
# # 步骤3：.创建Group，将之前创建的Person加入这个Group
# rst = api.group.create(group_name = 'test')
# print_result('create group', rst)
# rst = api.group.add_person(group_name = 'test', person_name = FACES.iterkeys())
# print_result('add these persons to group', rst)
#
# # Step 4: train the model
# # 步骤4：训练模型
# rst = api.train.identify(group_name = 'test')
# print_result('train', rst)
# # wait for training to complete
# # 等待训练完成
# rst = api.wait_async(rst['session_id'])
# print_result('wait async', rst)
#
# # Step 5: recognize face in a new image
# # 步骤5：识别新图中的Face
# rst = api.recognition.identify(group_name = 'test', url = TARGET_IMAGE)
# print_result('recognition result', rst)
# print '=' * 60
# print 'The person with highest confidence:', \
#         rst['face'][0]['candidate'][0]['person_name']
#
# # Finally, delete the persons and group because they are no longer needed
# # 最终，删除无用的person和group
# api.group.delete(group_name = 'test')
# api.person.delete(person_name = FACES.iterkeys())
#
# # Congratulations! You have finished this tutorial, and you can continue
# # reading our API document and start writing your own App using Face++ API!
# # Enjoy :)
# # 恭喜！您已经完成了本教程，可以继续阅读我们的API文档并利用Face++ API开始写您自
# # 己的App了！
# # 旅途愉快 :)
