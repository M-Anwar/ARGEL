import sys
import requests
import json

#Gets a sessionID in arguments, and prints it
session = sys.argv[1]
print "SessionID: " + session

# Create a session for our python program. This manages our cookies
# and keeps us logged in throughout our API usage. Only need a session if you
# wish to access API endpoints that require authentication. For this test we use 
# we simply login and check our authentication status.
s = requests.session() 

#Login to argel front end
url = "http://localhost:3000/api/login"

postData = {'username':'b', 'password':'a'}
myResponse = s.post(url, data = postData)
print myResponse.content

url = "http://localhost:3000/api/authenticated"
myResponse = s.get(url)
print myResponse.content

#Get all the ads in the data base
url = "http://localhost:3000/api/getads/"+session
myResponse = requests.get(url)
if(myResponse.ok):   #Print the first add details
    jData = json.loads(myResponse.content)
    for ad in jData:
        print "Name: " + ad["adname"]
        print "Description: " + ad["description"]
        
        print "Tags: "
        for element in ad["tags"]:
            print "\t" +element
        
        recAdID= ad["_id"] #Print the ID of the Ad
        print "AD ID: " +recAdID
        print "\n"
else:
    print "ERROR: "
    print myResponse.content