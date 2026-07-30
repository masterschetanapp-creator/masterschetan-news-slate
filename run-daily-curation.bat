@echo off
title masterschetan Financial News Slate - 24H Auto Loop
echo ============================================================
echo   masterschetan Financial News Slate - AI Curation Daemon
echo ============================================================
echo.
echo   This script will fetch fresh news NOW and repeat AUTOMATICALLY 
echo   every 24 hours in the background.
echo.
echo   Keep this window open or minimized to maintain 24H automation.
echo ============================================================
echo.
cd /d "C:\Users\HP\Desktop\MF Analyiser\financial-news-slate"
node scripts\auto-loop-24h.cjs
pause
