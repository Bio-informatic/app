@echo off
python launcher.py
if %errorlevel% neq 0 (
    echo Launcher failed to start.
    pause
)
exit
