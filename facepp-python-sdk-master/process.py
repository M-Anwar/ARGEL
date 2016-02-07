import time
import sys
import requests
import json
import urllib
from FaceRec import *

#Gets a sessionID in arguments, and prints it
session = sys.argv[1]
print "Session ID: " + session

#Get the Session image (i.e the crowd image captured)
url = "http://localhost:3000/api/getsessionimage/" + session
resource = urllib.urlopen(url)
output = open(session+".jpg","wb")
output.write(resource.read())
output.close()
   
#Get any associated meta-data with the session. Returns an array
url = "http://localhost:3000/api/getsessioninfo/" + session
myResponse = requests.get(url)
if(myResponse.ok):   
    jData = json.loads(myResponse.content)

    print("The response contains {0} properties:".format(len(jData)))    
    print jData["_id"]
    print "Meta-Data Length: {0}".format(len(jData["metaData"]))

#Get all the ads in the data base
# url = "http://localhost:3000/api/getads/"
# myResponse = requests.get(url)
# 
# if(myResponse.ok):   
#     print myResponse.content
#     jData = json.loads(myResponse.content)
#     recAdID= jData[0]["_id"] #Print the ID of the Ad
#     print recAdID

recAdID = FaceRecog(session)

#Post the recommended ad to the session
url = "http://localhost:3000/api/postrecommendation"

postData = {'sessionID':session, 'adID':recAdID}
myResponse = requests.post(url, data = postData)
print ("Response: {0}".format(myResponse.status_code))
print myResponse.text