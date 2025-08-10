; installer.nsh - 自定义 NSIS 安装脚本
; 用于 My Awesome App 的 Windows 安装程序

; 定义常量
!define PRODUCT_NAME "My Awesome App"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "TonyYang1985"
!define PRODUCT_WEB_SITE "https://github.com/TonyYang1985"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\${PRODUCT_NAME}.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

; 安装时执行的宏
!macro customInstall
  ; 创建注册表项
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\${PRODUCT_NAME}.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "Path" "$INSTDIR"
  
  ; 添加到程序列表
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_NAME}.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall ${PRODUCT_NAME}.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKLM "${PRODUCT_UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${PRODUCT_UNINST_KEY}" "NoRepair" 1
  
  ; 获取安装大小
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKLM "${PRODUCT_UNINST_KEY}" "EstimatedSize" "$0"
  
  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe" "" "$INSTDIR\${PRODUCT_NAME}.exe" 0
  
  ; 创建开始菜单快捷方式
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe" "" "$INSTDIR\${PRODUCT_NAME}.exe" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\卸载 ${PRODUCT_NAME}.lnk" "$INSTDIR\Uninstall ${PRODUCT_NAME}.exe"
  
  ; 文件关联（如果需要）
  ; WriteRegStr HKCR ".myext" "" "MyAwesomeApp.Document"
  ; WriteRegStr HKCR "MyAwesomeApp.Document" "" "${PRODUCT_NAME} Document"
  ; WriteRegStr HKCR "MyAwesomeApp.Document\DefaultIcon" "" "$INSTDIR\${PRODUCT_NAME}.exe,0"
  ; WriteRegStr HKCR "MyAwesomeApp.Document\shell\open\command" "" '"$INSTDIR\${PRODUCT_NAME}.exe" "%1"'
  
  ; 添加到 Windows 防火墙例外（如果应用需要网络访问）
  ; ExecWait 'netsh advfirewall firewall add rule name="${PRODUCT_NAME}" dir=in action=allow program="$INSTDIR\${PRODUCT_NAME}.exe"'
  
  ; 设置自动启动（可选）
  ; WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" "$INSTDIR\${PRODUCT_NAME}.exe"
!macroend

; 卸载时执行的宏
!macro customUnInstall
  ; 删除注册表项
  DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  
  ; 删除快捷方式
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\卸载 ${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; 删除文件关联
  ; DeleteRegKey HKCR ".myext"
  ; DeleteRegKey HKCR "MyAwesomeApp.Document"
  
  ; 从防火墙例外中移除
  ; ExecWait 'netsh advfirewall firewall delete rule name="${PRODUCT_NAME}"'
  
  ; 删除自动启动项
  ; DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
  
  ; 清理用户数据（可选，谨慎使用）
  ; RMDir /r "$APPDATA\${PRODUCT_NAME}"
  ; RMDir /r "$LOCALAPPDATA\${PRODUCT_NAME}"
!macroend

; 安装前检查
!macro preInit
  ; 检查是否已安装
  ReadRegStr $R0 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
  StrCmp $R0 "" done
  
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
  "${PRODUCT_NAME} 已经安装。$\n$\n点击 '确定' 移除之前的版本或点击 '取消' 取消此次升级。" \
  IDOK uninst
  Abort
  
  uninst:
    ClearErrors
    ExecWait '$R0 _?=$INSTDIR'
    
    IfErrors no_remove_uninstaller done
    no_remove_uninstaller:
  
  done:
!macroend

; 自定义页面
!macro customHeader
  ; 可以在这里添加自定义的安装页面
!macroend

; 安装完成后的操作
!macro customFinish
  ; 询问是否立即运行应用程序
  MessageBox MB_YESNO "安装完成！是否立即运行 ${PRODUCT_NAME}？" IDNO NoRun
    Exec "$INSTDIR\${PRODUCT_NAME}.exe"
  NoRun:
!macroend