@echo off
title Auto Setup GitHub Repo & Secret
echo ============================================================
echo   Automating GitHub Secrets for 24H Cloud Automation
echo ============================================================
echo.
cd /d "C:\Users\HP\Desktop\MF Analyiser\financial-news-slate"

echo Setting FIREBASE_TOKEN Repository Secret on GitHub...
"C:\Program Files\GitHub CLI\gh.exe" secret set FIREBASE_TOKEN --repo masterschetanapp-creator/masterschetan-news-slate

echo Setting GEMINI_API_KEY Repository Secret on GitHub...
"C:\Program Files\GitHub CLI\gh.exe" secret set GEMINI_API_KEY --repo masterschetanapp-creator/masterschetan-news-slate

echo.
echo Triggering Initial 24H Cloud Curation Workflow...
"C:\Program Files\GitHub CLI\gh.exe" workflow run curate.yml --repo masterschetanapp-creator/masterschetan-news-slate

echo.
echo ============================================================
echo   SUCCESS! 24H Cloud Automation Secret is Active!
echo ============================================================
pause
