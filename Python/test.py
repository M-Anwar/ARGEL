import sys
import requests
import json

#Gets a sessionID in arguments, and prints it
def main():
    session = sys.argv[1]
    print "SessionID: " + session    

    #Get all the ads in the data base
    url = "http://localhost:3000/api/getads/"+session
    myResponse = requests.get(url)
    recAdID = []
    if(myResponse.ok):   #Print the first add details
        jData = json.loads(myResponse.content)
        for ad in jData:
            print "Name: " + ad["adname"]
            print "Description: " + ad["description"]
            
            print "Tags: "
            for element in ad["tags"]:
                print "\t" +element
            
            recAdID.append(ad["_id"] )#Recommend all the ads to test array submission
            print "AD ID: " +ad["_id"]
            print "\n"
    else:
        print "ERROR: "
        print myResponse.content
        
    #Post the recommended ad to the session
    url = "http://localhost:3000/api/postrecommendation"

    postData = {'sessionID':session, 'adID':recAdID}; #Submit an array of ads
    myResponse = requests.post(url, data = postData);
    print ("Response: {0}".format(myResponse.status_code))
    print myResponse.text

def authenticationTest(username, password):    
    # Create a session for our python program. This manages our cookies
    # and keeps us logged in throughout our API usage. Only need a session if you
    # wish to access API endpoints that require authentication. For this test we use 
    # we simply login and check our authentication status.
    s = requests.session() 

    #Login to argel front end
    url = "http://localhost:3000/api/login"
    postData = {'username':username, 'password':password}
    myResponse = s.post(url, data = postData)
    print myResponse.content   

    url = "http://localhost:3000/api/authenticated"
    myResponse = s.get(url)
    print myResponse.content

    url = "http://localhost:3000/api/logout"
    myResponse = s.get(url)
    print myResponse.content
    
if __name__ == "__main__":
    main()
