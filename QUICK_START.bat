@echo off
echo ========================================
echo TourChain - Quick Start Menu
echo ========================================
echo.
echo Current Status:
echo   [X] Programs deployed to devnet
echo   [X] Frontend dependencies installed
echo   [X] SOL balance: 2.68 SOL
echo   [ ] Supabase setup
echo   [ ] Merkle tree initialized
echo   [ ] Frontend running
echo.
echo ========================================
echo Choose an option:
echo ========================================
echo.
echo 1. Check SOL balance
echo 2. Initialize merkle tree (requires Supabase setup first)
echo 3. Run frontend dev server
echo 4. Open Supabase Cloud dashboard
echo 5. View deployment status
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto check_balance
if "%choice%"=="2" goto init_tree
if "%choice%"=="3" goto run_frontend
if "%choice%"=="4" goto open_supabase
if "%choice%"=="5" goto view_status
if "%choice%"=="6" goto end

:check_balance
echo.
echo Checking SOL balance...
wsl bash -c "$HOME/.local/share/solana/install/active_release/bin/solana balance --url devnet"
echo.
pause
goto end

:init_tree
echo.
echo Initializing Bubblegum merkle tree...
echo This will cost approximately 2 SOL
echo.
wsl bash ./init-tree.sh
echo.
pause
goto end

:run_frontend
echo.
echo Starting frontend development server...
echo Visit http://localhost:3000 when ready
echo Press Ctrl+C to stop the server
echo.
cd apps\web
npm run dev
goto end

:open_supabase
echo.
echo Opening Supabase Cloud dashboard...
start https://supabase.com/dashboard
echo.
echo After creating your project:
echo 1. Go to Settings -^> API
echo 2. Copy Project URL, anon key, and service_role key
echo 3. Update apps\web\.env.local with these values
echo 4. Go to SQL Editor and run the 4 migration files
echo.
pause
goto end

:view_status
echo.
type DEPLOYMENT_STATUS.md
echo.
pause
goto end

:end
echo.
echo Goodbye!
