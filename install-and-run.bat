@echo off
echo ========================================
echo   Stocrates Next.js - Setup
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Dependencies installed!
echo.
echo [3/3] Starting development server...
echo.
echo Open http://localhost:3000 in your browser
echo.

call npm run dev

