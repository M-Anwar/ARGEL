__author__ = 'Shaham'
import time
import sys
import requests
import json
import urllib
import numpy as np
import re

def get_ads():
    url = "http://localhost:3000/api/getads/"
    myResponse = requests.get(url)

    if(myResponse.ok):
        #print myResponse.content
        jData = json.loads(myResponse.content)

    ids = []
    tags = np.zeros((len(jData),4))
    for i in range(0,len(jData)):
        ids.append(jData[i]["_id"])
        # tag_input = re.search('(-*\d+)\s*,\s*(\d+)\s*,\s*(\d+).*', jData[i]["tags"][0])
        t = jData[i]["tags"][0].split(",")
<<<<<<< HEAD
        #print t
        tags[i,:3] = [int(t[p]) for p in range(0,3)]
=======
        # tags[i,:] = [int(t[j]) for j in range(0,3)] #Get this error with this line: ValueError: cannot copy sequence with size 3 to array axis with dimension 4
        #Did it manually...
        tags[i,0] = int(t[0]);
        tags[i,1] = int(t[1]);
        tags[i,2] = int(t[2]);
>>>>>>> origin/master
        # tags[i,0] = int(tag_input.group(1))
        # tags[i,1] = int(tag_input.group(2))
        # tags[i,2] = int(tag_input.group(3))
        tags[i,3] = i+1

    return ids, tags