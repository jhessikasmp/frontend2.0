@echo off
cd /d "%~dp0backend"
echo Starting backend server with ts-node transpile-only...
REM Use --transpile-only to skip type checking (much faster)
REM --project points to tsconfig.json but skips type checks
"C:\Users\jhess\Downloads\JSFinanceApp 2.0\backend\node_modules\.bin\ts-node.cmd" --transpile-only --project tsconfig.json -r tsconfig-paths/register src/server.ts
pause