@echo off
echo ========================================
echo TourChain Frontend Installation
echo ========================================
echo.

cd apps\web

echo Installing dependencies...
echo This may take 2-5 minutes...
echo.

npm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up Supabase: supabase start
echo 2. Run frontend: npm run dev
echo.
pause
