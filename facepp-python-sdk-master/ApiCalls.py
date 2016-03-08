__author__ = 'Shaham'
import time
import sys
import requests
import json
import urllib
import numpy as np
import re
import random
from datetime import datetime, timedelta

def get_weather(w):
    wfactor = 10.
    wdict = {'clear': 2,'clouds': 1, 'rain': -1, 'snow':-2}
    if w in wdict:

        weather_int = wdict[w]
    else:
        weather_int = 0
    return weather_int/wfactor

def get_temp(t):
    tfactor = 100.0

    t_match = re.match('(-*\d+)(\w)', t)
    if t_match:
        if t_match.group(2) == 'C':
            temp_int = float(t_match.group(1))
        elif t_match.group(2) == 'F':
            temp_int = (float(t_match.group(1))-32)*(5/9)
        else:
            temp_int = 23
    else:
        t_match = re.match('(-*\d+)', t)
        if t_match:
            temp_int = float(t_match.group(1))-273.13
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
        print closest
        return closest/tfactor

def get_time2(times):
    tfactor = 1.0
    curr = datetime.now()
    feat = 43200.0
    for t in times:
        #print t
        time = re.match('(\d+):(\d+)',t)
        nearest = []
        nearest.append(abs(datetime(curr.year, curr.month, curr.day, int(time.group(1)), int(time.group(2)))-curr))
        nearest.append(abs(datetime(curr.year, curr.month, curr.day-1, int(time.group(1)), int(time.group(2)))-curr))
        nearest.append(abs(datetime(curr.year, curr.month, curr.day+1, int(time.group(1)), int(time.group(2)))-curr))
        closest = min(nearest)
        if closest.seconds < feat:
            feat = closest.seconds
        #print closest.seconds
        #print feat

    return feat/43200.0/tfactor

def get_ads(session="none"):
    host = "http://localhost:3000/api/getads"
    if session != 'none':
        url = host + '/' + session
    else:
        url = host



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
        mt = jData[i]["metaData"][0].split(",")

        if len(mt) > 2:
            t = jData[i]["tags"][0].split(",")+mt
        else:
            t = jData[i]["tags"][0].split(",")


        #print t

        #print len(t)
        #print t
        if len(t)>3:
            tags[i,:3] = [float(t[p]) for p in range(0,3)]
            tags[i,3] = get_weather(t[3])
            tags[i,4] = get_temp(t[4])

            tags[i,5] = get_time2(t[5:])

        else:
            tags[i,:3] = [float(t[p]) for p in range(0,3)]
            weather = ['clear', 'snow', 'rain','clouds','all']
            tags[i,3] = get_weather(random.choice(weather))
            temp = ['-20C','-5C','50F','20C','29C', '35C']
            tags[i,4] = get_temp(random.choice(temp))
            times = ['19:00', '05:00', '20:00', '09:00', '15:00', "16:00"]
            tags[i,5] = get_time2(times)

        #tags[i,5] = get_time(curr_time, times)

        # tags[i,0] = int(tag_input.group(1))
        # tags[i,1] = int(tag_input.group(2))
        # tags[i,2] = int(tag_input.group(3))
        tags[i,-1] = i+1

    return ids, tags

if __name__ == '__main__':
    ids,tags = get_ads()
    print ids[0:2]
    #print tags
    print get_temp('-10C')