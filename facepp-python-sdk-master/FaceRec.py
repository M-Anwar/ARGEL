#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: hello.py
import cv2
import numpy as np
import matplotlib.image as img
from DecTree import *
import urllib
from sklearn.feature_extraction import DictVectorizer
from HelperFxn import *
from facepp import *
from ApiCalls import *

def FaceRecog(session):
    # You need to register your App first, and enter you API key/secret.
    API_KEY = '28fbdbef3093f25ff6771286febc5e81'
    API_SECRET = 'mHX0i1CGvQRGI6Cd6D_SYiuw2g6ZIKSe'

    api = API(API_KEY, API_SECRET)

    url = session+'.jpg'
    #urllib.urlretrieve("http://192.168.1.115:8080/photo.jpg", "test_im.jpg")
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

        '''
        test_x shape = (amount of people, geatures)
        ex.
        gender, age, range
        [ 1 10 4
         -1 19 10]
        '''

        for i in range(0,amount_of_people):
            if (genders[i]['value'] == 'Male'):
                test_x[i,0] = 1*genders[i]['confidence']/100
            elif (genders[i]['value'] == 'Female'):
                test_x[i,0] += -1*genders[i]['confidence']/100
            test_x[i,1] = ages[i]['value']
            test_x[i,2] = ages[i]['range']

        print str(test_x)


        # file = 'train_data.csv'
        # with open(file, 'rb') as f:
        #         reader = csv.reader(f)
        #         X = list(reader)

        ids, X = get_ads()
        #pred = learn_tree_and_predict(X, test_x)
        pred = K_near_age(X, test_x, 1)
        feature_names = ['Gender','0-5','6-12','13-19','20-27','28-35','36-50','55+']

        image = cv2.imread(new_im)
        #image = cv2.putText(image, str(X[0]),(10, int(0.1*image.shape[0])),font,3,(0,255,0),2,cv2.LINE_AA)
        image = cv2.putText(image, 'Ad Selected = Ad#' + str(pred) + ' with data as: ' + str(X[int(pred)-1]),(10, int(0.1*image.shape[0]+100)),font,2,(0,255,0),2,cv2.LINE_AA)
        #image = cv2.putText(image, 'Gender = ' + str(test_x[0,0]) + ' ' + 'Age = ' + str(test_x[0,1]),(10, int(0.5*image.shape[0])),font,3,(0,0,255),2,cv2.LINE_AA)
        #image = cv2.putText(image, 'Ad Selected = Ad#' + str(prediction[0]) + ' with data as: ' + str(X[prediction[0]-1]),(10, int(0.5*image.shape[0]+50)),font,2,(0,0,255),2,cv2.LINE_AA)

        cv2.imwrite(new_im,image)
        print pred
        print "ID Predicted:" + str(ids[int(pred[0])-1])
        return ids[int(pred[0])-1]
    else:
        print 'No one detected!'
        ids, X = get_ads()
        return ids[0]

