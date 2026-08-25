@echo off
cd /d "%~dp0backend"
echo Starting backend server with ts-node transpile-only...
"C:\Users\jhess\Downloads\JSFinanceApp 2.0\backend\node_modules\.bin\ts-node.cmd" --transpile-only --project tsconfig.json -r tsconfig-paths/register src/server.ts
pause