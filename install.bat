@echo off
REM Augment Extensions CLI Installer (Windows Batch Wrapper)
REM This script runs the PowerShell installer with proper execution policy

echo ========================================
echo Augment Extensions CLI Installer
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not installed or not in PATH
    echo Please install PowerShell and try again
    pause
    exit /b 1
)

REM Run the PowerShell installer
echo Running PowerShell installer...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install-with-nodejs.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installation completed successfully!
    echo ========================================
    echo.
    echo Please restart your terminal and run: augx --version
    echo.
) else (
    echo.
    echo ========================================
    echo Installation failed!
    echo ========================================
    echo.
    echo Please check the error messages above
    echo.
)

pause

