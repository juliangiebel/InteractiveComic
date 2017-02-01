@echo off
start browser-sync start -s -f css/
start sass  --watch sass:css
start grunt watch
