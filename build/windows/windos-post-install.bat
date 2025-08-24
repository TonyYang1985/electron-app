@echo off
REM My Awesome App - Windows 安装后脚本
REM 可选的额外配置脚本

echo 正在进行安装后配置...

REM 设置环境变量（如果需要）
setx MYAWESOMEAPP_HOME "%PROGRAMFILES%\My Awesome App" /M >nul 2>&1

REM 注册自定义 URI scheme
reg add "HKEY_CLASSES_ROOT\myawesomeapp" /ve /d "URL:My Awesome App Protocol" /f >nul 2>&1
reg add "HKEY_CLASSES_ROOT\myawesomeapp" /v "URL Protocol" /d "" /f >nul 2>&1
reg add "HKEY_CLASSES_ROOT\myawesomeapp\shell\open\command" /ve /d "\"%PROGRAMFILES%\My Awesome App\My Awesome App.exe\" \"%%1\"" /f >nul 2>&1

REM 创建用户配置目录
if not exist "%APPDATA%\My Awesome App" mkdir "%APPDATA%\My Awesome App" >nul 2>&1

REM 复制默认配置文件（如果存在）
if exist "%PROGRAMFILES%\My Awesome App\resources\defaults\config.json" (
    if not exist "%APPDATA%\My Awesome App\config.json" (
        copy "%PROGRAMFILES%\My Awesome App\resources\defaults\config.json" "%APPDATA%\My Awesome App\config.json" >nul 2>&1
    )
)

REM 设置文件关联
assoc .myawesomeapp=MyAwesomeAppFile >nul 2>&1
ftype MyAwesomeAppFile="%PROGRAMFILES%\My Awesome App\My Awesome App.exe" "%%1" >nul 2>&1

REM 添加到 Windows 防火墙例外
netsh advfirewall firewall add rule name="My Awesome App" dir=in action=allow program="%PROGRAMFILES%\My Awesome App\My Awesome App.exe" >nul 2>&1

REM 刷新系统图标缓存
ie4uinit.exe -ClearIconCache >nul 2>&1

REM 通知系统文件关联已更改
call :RefreshShell

echo ✅ 安装后配置完成
goto :eof

:RefreshShell
REM 刷新 Shell 以应用更改
powershell -Command "& {[System.Environment]::SetEnvironmentVariable('PROCESSOR_ARCHITECTURE', $env:PROCESSOR_ARCHITECTURE, 'User')}" >nul 2>&1
goto :eof