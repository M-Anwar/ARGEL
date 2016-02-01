import requests;
import json;

print("hello world gonna make a REST call\n");

# Replace with the correct URL
url = "http://localhost:3000/api/helloworld"

myResponse = requests.get(url)
print ("Response: {0}".format(myResponse.status_code))

# For successful API call, response code will be 200 (OK)
if(myResponse.ok):
    # Loading the response data into a dict variable
    # json.loads takes in only binary or string variables so using content to fetch binary content
    # Loads (Load String) takes a Json file and converts into python data structure (dict or list, depending on JSON)
    jData = json.loads(myResponse.content)

    print("The response contains {0} properties:".format(len(jData)))    
    for key in jData:
        print key + " : " + jData[key]
else:
  # If response code is not ok (200), print the resulting http error code with description
    myResponse.raise_for_status()



# Replace with the correct URL
url = "http://localhost:3000/api/add"

postData = {'arg1':'5', 'arg2':'10'};
myResponse = requests.post(url, data = postData);
print ("Response: {0}".format(myResponse.status_code))
print myResponse.text

