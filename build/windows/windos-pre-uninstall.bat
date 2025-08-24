@echo off
REM My Awesome App - Windows 卸载前脚本
REM 在卸载前执行清理工作

echo 正在准备卸载...

REM 停止所有相关进程
echo 正在停止应用程序进程...
taskkill /F /IM "My Awesome App.exe" >nul 2>&1
taskkill /F /IM "myawesomeapp.exe" >nul 2>&1

REM 等待进程完全结束
timeout /t 3 /nobreak >nul

REM 清理临时文件
echo 正在清理临时文件...
if exist "%TEMP%\My Awesome App" rmdir /s /q "%TEMP%\My Awesome App" >nul 2>&1
if exist "%TEMP%\myawesomeapp*" del /f /q "%TEMP%\myawesomeapp*" >nul 2>&1

REM 清理注册表缓存
echo 正在清理系统缓存...
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.myawesomeapp" /f >nul 2>&1

REM 移除防火墙规则
echo 正在移除防火墙规则...
netsh advfirewall firewall delete rule name="My Awesome App" >nul 2>&1

REM 清理开始菜单缓存
echo 正在清理开始菜单缓存...
del /f /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\My Awesome App\*" >nul 2>&1

echo ✅ 卸载准备完成