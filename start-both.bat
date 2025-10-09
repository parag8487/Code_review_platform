@echo off
echo Starting both applications...

REM Start the Code Review application on port 9002
start "Code Review" cmd /k "cd "%~dp0Code review" && npm run dev"

REM Start the Live Classroom application on port 5000
start "Live Classroom" cmd /k "cd "%~dp0live classroom" && npm run dev"

echo Both applications started.
echo Code Review is running on http://localhost:9002
echo Live Classroom is running on http://localhost:5000
pause