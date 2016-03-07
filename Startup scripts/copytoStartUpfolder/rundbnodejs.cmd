REM This file needs to go in "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp on the server"

ECHO mongod
cd "C:\Users\Administrator\Documents\GitHub\ARGEL\Startup scripts"
START runmongodb.cmd

REM the below is to delay the command for 5 seconds
ping 127.0.0.1 -n 6 > nul

ECHO nodejs
cd "C:\Users\Administrator\Documents\GitHub\ARGEL\Startup scripts"
START runnodemon.cmd