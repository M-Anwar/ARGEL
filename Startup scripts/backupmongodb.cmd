REM This batch creates an archive of the current mongodb database 'test'
REM the command to restore the db is: mongorestore --archive=ARCHIVE_NAME --db test

@echo off
For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)

cd "C:\Program Files\MongoDB\Server\3.2\bin"
START mongodump --archive=ARGELdb_archive-%mydate%_%mytime% --db test
echo Created Archive  "C:\Program Files\MongoDB\Server\3.2\bin\ARGELdb_archive-%mydate%_%mytime%"
pause