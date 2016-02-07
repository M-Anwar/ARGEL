__author__ = 'Shaham'
import time
import sys
import requests
import json
import urllib

def get_ads():
    url = "http://localhost:3000/api/getads/"
    myResponse = requests.get(url)

    if(myResponse.ok):
        print myResponse.content
        jData = json.loads(myResponse.content)
        recAdID= jData[0]["_id"] #Print the ID of the Ad
        print recAdID
