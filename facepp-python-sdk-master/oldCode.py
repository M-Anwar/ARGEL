#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: hello.py
import cv2
import numpy as np
import matplotlib.image as img
from DecTree import *
import urllib
from sklearn.feature_extraction import DictVectorizer

'''
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
'''




# You need to register your App first, and enter you API key/secret.
API_KEY = '28fbdbef3093f25ff6771286febc5e81'
API_SECRET = 'mHX0i1CGvQRGI6Cd6D_SYiuw2g6ZIKSe'

# Import system libraries and define helper functions

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

def mode(list):
    d = {}
    for i in list:
        try:
            d[i] += 1
        except(KeyError):
            d[i] = 1

    max = d.keys()[0]
    for key in d.keys()[1:]:
        if d[key] > max:
            max = key

    return max

# First import the API class from the SDK
from facepp import *

api = API(API_KEY, API_SECRET)

#urllib.urlretrieve("http://192.168.1.115:8080/photo.jpg", "test_im.jpg")

url = 'test_im.jpg'
#url = 'test_image.png'
FACES = {'Shaham': api.detection.detect(img = File(url), attribute = ('glass','pose','gender','age','race','smiling'))}

new_im = 'test_image_new.jpg'
cv2.imwrite(new_im, cv2.imread(url))

font = cv2.FONT_HERSHEY_SIMPLEX
#url = 'http://whoisintoday.pilots.bbcconnectedstudio.co.uk/wp-content/uploads/2015/05/brandon-flowers-1920x1080.jpg'
#url = 'http://100.64.181.109:8080/photo.jpg'
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

            image = cv2.imread(new_im)
            #print image
            pt1 = (int(each_face['position']['center']['x']*width/100-each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100+each_face['position']['height']*height/100/2))
            pt2 = (int(each_face['position']['center']['x']*width/100+each_face['position']['width']*width/100/2),int(each_face['position']['center']['y']*height/100-each_face['position']['height']*height/100/2))
            image = cv2.rectangle(image,pt1,pt2,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['eye_left']['x']*width/100),int(each_face['position']['eye_left']['y']*height/100)),10,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['eye_right']['x']*width/100),int(each_face['position']['eye_right']['y']*height/100)),10,(0,255,0))
            image = cv2.circle(image,(int(each_face['position']['nose']['x']*width/100),int(each_face['position']['nose']['y']*height/100)),10,(0,255,0),-1)
            image = cv2.circle(image,(int(each_face['position']['mouth_left']['x']*width/100),int(each_face['position']['mouth_left']['y']*height/100)),10,(0,255,0),-1)
            image = cv2.circle(image,(int(each_face['position']['mouth_right']['x']*width/100),int(each_face['position']['mouth_right']['y']*height/100)),10,(0,255,0),-1)
            image = cv2.putText(image, str(attribute['gender']['value']) + ' ' + str(attribute['gender']['confidence']),(int(pt1[0]+(pt2[0]-pt1[0])/2),int(pt2[1]*0.95)),font,1, (0,255,0),2,cv2.LINE_AA)
            image = cv2.putText(image, 'Age: ' + str(attribute['age']['value']) + ' Range: ' + str(attribute['age']['range']),(int(pt1[0]+(pt2[0]-pt1[0])/2),int(pt1[1]*1.05)),font,1,(0,255,0),2,cv2.LINE_AA)
            #cv2.imshow('preview',image)
            #cv2.waitKey(0)
            cv2.imwrite(new_im,image)

if len(genders) > 0:
    amount_of_people = len(genders)
    test_x = np.zeros((amount_of_people,3))

    print 'Genders:' + str(genders)
    print 'Ages:' + str(ages)
    print 'Glasses?:' + str(glasses)
    print 'Smiling?' + str(smilings)

    for i in range(0,amount_of_people):
        if (genders[i]['value'] == 'Male'):
            test_x[i,0] = 1*genders[i]['confidence']/100
        elif (genders[i]['value'] == 'Female'):
            test_x[i,0] += -1*genders[i]['confidence']/100
        test_x[i,1] = ages[i]['value']
        test_x[i,2] = ages[i]['range']

    print str(test_x)
    file = 'train_data.csv'
    clf = learn_tree(file)

    prediction = predict(clf, test_x)
    print prediction
    pred = mode(prediction)
    feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']
    with open(file, 'rb') as f:
            reader = csv.reader(f)
            X = list(reader)

    image = cv2.imread(new_im)
    image = cv2.putText(image, str(X[0]),(10, int(0.1*image.shape[0])),font,3,(0,255,0),2,cv2.LINE_AA)
    image = cv2.putText(image, 'Ad Selected = Ad#' + str(pred) + ' with data as: ' + str(X[int(pred)]),(10, int(0.1*image.shape[0]+100)),font,2,(0,255,0),2,cv2.LINE_AA)
    #image = cv2.putText(image, 'Gender = ' + str(test_x[0,0]) + ' ' + 'Age = ' + str(test_x[0,1]),(10, int(0.5*image.shape[0])),font,3,(0,0,255),2,cv2.LINE_AA)
    #image = cv2.putText(image, 'Ad Selected = Ad#' + str(prediction[0]) + ' with data as: ' + str(X[prediction[0]-1]),(10, int(0.5*image.shape[0]+50)),font,2,(0,0,255),2,cv2.LINE_AA)

    cv2.imwrite(new_im,image)

else:
    print 'No one detected!'


import numpy as np
import matplotlib.pyplot as plt
from sklearn.externals.six import StringIO
from sklearn import tree
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction import DictVectorizer
import csv

def overlap(a,b):
    return a[0] <= b[0] <= a[1] or b[0] <= a[0] <= b[1]

def convert_age_to_bin_array(age, range_of_age):
    bins = [(0,5),(6,12),(13,19),(20,27),(28,35),(36,50), (50,150)]
    bin_count = np.zeros((1,len(bins)))
    min = age-range_of_age
    max = age+range_of_age
    total_range = (min,max)

    for i in range(0,len(bins)):
        if overlap(total_range,bins[i]):
            bin_count[0,i] = 1



    return bin_count

def create_tree(X, Y):
    clf = tree.DecisionTreeClassifier(criterion='entropy')
    clf = clf.fit(X, Y)

    from IPython.display import Image
    import pydotplus
    dot_data = StringIO()
    #tree.export_graphviz(clf, out_file=dot_data)
    #feature_names = ['Gender', 'Age']
    feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']
    target_names = []

    for i in range(1,len(Y)+1):
        target_names.append('Ad #' + str(i))


    tree.export_graphviz(clf, out_file=dot_data,
                         feature_names=feature_names,
                         class_names=target_names,
                         filled=True, rounded=True,
                         special_characters=True)

    graph = pydotplus.graph_from_dot_data(dot_data.getvalue())
    graph.write_pdf("Tree.pdf")

    return clf

def predict(clf, test_data):
    features = 8
    X_test = np.zeros((np.shape(test_data)[0],features))
    for i in range(0,np.shape(test_data)[0]):
        person = test_data[i,:]
        gender_ar = np.zeros((1,1)) + person[0]
        age_ar = convert_age_to_bin_array(person[1],person[2])
        X_test[i,:] = np.concatenate((gender_ar,age_ar),axis=1)


    print X_test.shape
    prediction = clf.predict(X_test)
    return prediction

def learn_tree(file):
    '''
    X_dict = [{'0-5': 'yes',
               '6-12': 'yes',
               '13-19': 'yes',
               '20-27': 'yes',
               '28-35': 'yes',
               '36-50': 'yes',
               '55+': 'yes'}]

    vect = DictVectorizer(sparse=False)
    X_vector = vect.fit_transform(X_dict)
    '''
    features = 8
    feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']
    with open(file, 'rb') as f:
            reader = csv.reader(f)
            train_data = list(reader)

    train_data = train_data[1:]
    X= np.zeros((len(train_data),features))
    Y= np.zeros((len(train_data),1))

    for i in range(0,len(train_data)):
        row = train_data[i]

        gender = float(row[0])
        age = int(row[1])
        range_of_age = int(row[2])

        gender_ar = np.zeros((1,1)) + gender
        age_ar = convert_age_to_bin_array(age,range_of_age)
        X[i,:] = np.concatenate((gender_ar,age_ar),axis=1)
        Y[i,0] = int(row[3])

    clf = create_tree(X,Y)
    return clf


'''

    test_x = np.zeros((len(genders),3))

    print 'Genders:' + str(genders)
    print 'Ages:' + str(ages)
    print 'Glasses?:' + str(glasses)
    print 'Smiling?' + str(smilings)

    for i in genders:
        if (i['value'] == 'Male'):
            test_x[0] += 1*i['confidence']/100
        elif (i['value'] == 'Female'):
            test_x[0] += -1*i['confidence']/100

    for i in ages:
        test_x[1] += i['value']
        test_x[2] += i['range']

    test_x[1] = test_x[1]/len(ages)
    test_x[0] = test_x[0]/len(genders)
    print str(test_x)

'''