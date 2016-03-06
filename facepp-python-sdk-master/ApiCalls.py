__author__ = 'Shaham'
import time
import sys
import requests
import json
import urllib
import numpy as np
import re
import random
import datetime

def get_weather(w):
    wfactor = 10.
    wdict = {'sunny': 2,'cloudy': 1, 'rainy': -1, 'snow':-2}
    if w in wdict:

        weather_int = wdict[w]
    else:
        weather_int = 0
    return weather_int/wfactor

def get_temp(t):
    tfactor = 100

    t_match = re.match('(-*\d+)(\w)', t)
    if t_match:
        if t_match.group(2) == 'C':
            temp_int = float(t_match.group(1))
        elif t_match.group(2) == 'F':
            temp_int = (float(t_match.group(1))-32)*(5/9)
        else:
            temp_int = 23

    return (temp_int-10)/tfactor




def get_time(curr, times=0):
    tfactor = 1.0
    now = datetime.datetime.strptime(curr, "%H:%M")
    if times==0:
        return float((now.hour/24.0/tfactor)+(now.minute/1440./tfactor))
    else:
        closest = float(min(times, key=lambda t: abs(now - datetime.datetime.strptime(t, "%H"))))/24.0
        return closest/tfactor

def get_ads(curr_time):
    url = "http://localhost:3000/api/getads/"
    myResponse = requests.get(url)

    if(myResponse.ok):
        #print myResponse.content
        jData = json.loads(myResponse.content)

    ids = []
    numfeatures = 6
    tags = np.zeros((len(jData),numfeatures+1))
    #print jData
    for i in range(0,len(jData)):
        ids.append(jData[i]["_id"])
        # tag_input = re.search('(-*\d+)\s*,\s*(\d+)\s*,\s*(\d+).*', jData[i]["tags"][0])
        t = jData[i]["tags"][0].split(",")
        times = ['19', '05', '20', '09', '15']

        #print len(t)
        #print t
        if len(t)>3:
            tags[i,:3] = [int(t[p]) for p in range(0,3)]
            tags[i,3] = get_weather(t[3])
            tags[i,4] = get_temp(t[4])
        else:
            tags[i,:3] = [int(t[p]) for p in range(0,3)]
            weather = ['sunny', 'snow', 'rainy','cloudy','dontcare']
            tags[i,3] = get_weather(random.choice(weather))
            temp = ['-20C','-5C','50F','20C','29C', '35C']
            tags[i,4] = get_temp(random.choice(temp))

        tags[i,5] = get_time(curr_time, times)
        # tags[i,0] = int(tag_input.group(1))
        # tags[i,1] = int(tag_input.group(2))
        # tags[i,2] = int(tag_input.group(3))
        tags[i,-1] = i+1

    return ids, tags