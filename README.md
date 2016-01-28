# ARGEL
ARGEL Marketing Solutions

##Setup
Before cloning the repo, make sure you install Node.js along with MongoDB. Both can be found here by following the link.
1. [Node.js Download](https://nodejs.org/en/download/) - Download the appropriate windows/mac installer for your system (32/64 bit)
2. [MongoDB Download](https://www.mongodb.org/downloads#production) - Select the appropriate version from the drop down and download

After installing both Node.js and MongoDB, clone this ARGEL repository from github ([download github](https://desktop.github.com/) client for windows and login)

##Getting Started with ARGEL Development
1. **Installing Packages-** Navigate to the directory where you cloned the project and open the command line and run
```
        npm install
```
This will install all the required dependancies from the package.jpon file required to get the webapp running. 
If you install any more modules make sure to include the ```-save``` option to update the package.json file. 

2. **Start MongoDB Server** - *For testing purposes will change later*. Create a folder where you want to store your database
info. Then navigate to where you installed MongoDB and go to the /bin folder. Open up the cmd and run
```        
        mongod -dbpath "C:\Path\To\Database\folder"
```
This will setup and run an instance of a database locally on port 27017 so our test wepapp can connect to it locally.

3. **Run the ARGEL webapp** - Navigate to the cloned project directory and run the following command to get the webapp running
```
        npm start
```
This will run the webapp locally on your machine with a HTTP server on ```localhost:3000```, which you can access using a web
browser.