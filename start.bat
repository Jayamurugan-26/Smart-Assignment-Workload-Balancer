@echo off
echo =======================================================
echo   Starting Smart Assignment Workload Balancer
echo =======================================================

echo Starting Backend Server on http://localhost:5000...
start cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend Client on http://localhost:5173...
start cmd /k "cd /d %~dp0client && npm run dev"

echo Done! Both servers are starting up.
pause