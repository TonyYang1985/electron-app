; installer.nsh for electron-builder 26.x
; 专为 26.0.0 版本优化，解决语言冲突

!include "LogicLib.nsh"

; 26.x 版本的语言处理更严格，避免重复定义
; 不要包含 MUI2.nsh - electron-builder 26.x 会自动处理

; ========================================
; 语言字符串定义 - 使用条件编译避免重复
; ========================================

!ifndef CUSTOM_LANG_STRINGS_DEFINED
!define CUSTOM_LANG_STRINGS_DEFINED

; 应用程序运行检查消息
LangString AppRunning 1033 "${PRODUCT_NAME} is currently running. Please close it before continuing."
LangString AppRunning 2052 "${PRODUCT_NAME} 正在运行。请在继续前关闭它。"
LangString AppRunning 1028 "${PRODUCT_NAME} 正在運行。請在繼續前關閉它。"

; 数据删除确认消息
LangString ConfirmDelete 1033 "Do you want to remove all application data?"
LangString ConfirmDelete 2052 "您要删除所有应用程序数据吗？"
LangString ConfirmDelete 1028 "您要刪除所有應用程式資料嗎？"

; 卸载成功消息
LangString UninstallSuccess 1033 "${PRODUCT_NAME} has been successfully uninstalled."
LangString UninstallSuccess 2052 "${PRODUCT_NAME} 已成功卸载。"
LangString UninstallSuccess 1028 "${PRODUCT_NAME} 已成功卸載。"

!endif

; ========================================
; 自定义初始化 - 26.x 版本兼容
; ========================================
!macro customInit
  ; electron-builder 26.x 自动处理语言选择
  ; 设置安装器上下文
  SetShellVarContext all
  
  ; 可选：检查管理员权限
  ; UserInfo::GetAccountType
  ; Pop $R0
  ; ${If} $R0 != "admin"
  ;   MessageBox MB_OK "Administrator privileges required."
  ;   SetErrorLevel 740 ; ERROR_ELEVATION_REQUIRED
  ;   Quit
  ; ${EndIf}
!macroend

; ========================================
; 自定义安装逻辑 - 26.x 优化
; ========================================
!macro customInstall
  ; 应用程序运行检查 - 使用更可靠的方法
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    ; 26.x 版本的语言字符串处理
    Push $R1
    Push $R2
    
    ; 获取语言字符串
    !insertmacro MUI_LANGDLL_SAVELANGUAGE
    StrCpy $R1 "$(AppRunning)"
    
    ; 检查字符串是否正确加载
    StrLen $R2 $R1
    ${If} $R2 > 10  ; 合理的字符串长度
      MessageBox MB_OK|MB_ICONEXCLAMATION "$R1"
    ${Else}
      ; 后备英文消息
      MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME} is currently running. Please close it before continuing."
    ${EndIf}
    
    Pop $R2
    Pop $R1
    Abort
  ${EndIf}
  
  ; 写入安装信息到注册表
  WriteRegStr HKLM "SOFTWARE\${COMPANY_NAME}\${PRODUCT_NAME}" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "SOFTWARE\${COMPANY_NAME}\${PRODUCT_NAME}" "Version" "${VERSION}"
  WriteRegStr HKLM "SOFTWARE\${COMPANY_NAME}\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
!macroend

; ========================================
; 自定义卸载逻辑 - 26.x 优化
; ========================================
!macro customUnInstall
  ; 应用程序运行检查
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    Push $R1
    Push $R2
    
    StrCpy $R1 "$(AppRunning)"
    StrLen $R2 $R1
    ${If} $R2 > 10
      MessageBox MB_OK|MB_ICONEXCLAMATION "$R1"
    ${Else}
      MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME} is currently running. Please close it before continuing."
    ${EndIf}
    
    Pop $R2
    Pop $R1
    Abort
  ${EndIf}

  ; 询问删除用户数据 - 26.x 版本优化
  Push $R1
  Push $R2
  
  StrCpy $R1 "$(ConfirmDelete)"
  StrLen $R2 $R1
  ${If} $R2 > 10
    MessageBox MB_YESNO|MB_ICONQUESTION "$R1" /SD IDNO IDYES deleteUserData
  ${Else}
    MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove all application data?$\r$\n$\r$\nThis includes settings, cache, and user preferences." /SD IDNO IDYES deleteUserData
  ${EndIf}
  
  Pop $R2
  Pop $R1
  Goto skipDataDeletion

  deleteUserData:
    DetailPrint "Removing user data..."
    
    ; 删除应用数据目录
    RMDir /r "$APPDATA\${PRODUCT_NAME}"
    RMDir /r "$LOCALAPPDATA\${PRODUCT_NAME}"
    
    ; 删除临时文件
    RMDir /r "$TEMP\${PRODUCT_NAME}"
    
    ; 清理注册表用户设置
    DeleteRegKey HKCU "SOFTWARE\${COMPANY_NAME}\${PRODUCT_NAME}"
    
    DetailPrint "User data removed."
    
  skipDataDeletion:
  
  ; 基础清理（始终执行）
  DeleteRegKey HKLM "SOFTWARE\${COMPANY_NAME}\${PRODUCT_NAME}"
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  
  ; 清理快捷方式
  Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"
  Delete "$QUICKLAUNCH\${SHORTCUT_NAME}.lnk"
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; 显示完成消息
  Push $R1
  Push $R2
  
  StrCpy $R1 "$(UninstallSuccess)"
  StrLen $R2 $R1
  ${If} $R2 > 10
    MessageBox MB_OK|MB_ICONINFORMATION "$R1"
  ${Else}
    MessageBox MB_OK|MB_ICONINFORMATION "${PRODUCT_NAME} has been successfully uninstalled."
  ${EndIf}
  
  Pop $R2
  Pop $R1
!macroend

; ========================================
; 自定义许可证页面 - 26.x 兼容
; ========================================
!macro customHeader
  ; electron-builder 26.x 对文件路径检查更严格
  !ifdef PROJECT_DIR
    ; 按优先级检查许可证文件
    ${If} $LANGUAGE == 2052
      ${AndIf} ${FileExists} "${PROJECT_DIR}\build\LICENSE_zh-CN.md"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-CN.md"
    ${ElseIf} $LANGUAGE == 1028
      ${AndIf} ${FileExists} "${PROJECT_DIR}\build\LICENSE_zh-TW.md"  
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-TW.md"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\build\LICENSE_en-US.md"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_en-US.md"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\build\LICENSE.txt"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE.txt"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\LICENSE.md"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\LICENSE.md"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\LICENSE"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\LICENSE"
    ${EndIf}
  !endif
!macroend

; ========================================
; 26.x 版本的增强功能
; ========================================

; 自定义页面回调（可选）
!macro customInstallModePageCallback
  ; 可以在这里自定义安装模式页面的行为
!macroend

; 自定义目录页面回调（可选）
!macro customDirectoryPageCallback
  ; 可以在这里自定义安装目录页面的行为
!macroend

; 自定义完成页面回调（可选）
!macro customFinishPageCallback
  ; 可以在这里自定义完成页面的行为
  ; 例如：添加启动应用程序的选项
!macroend

; 错误处理宏
!macro HandleInstallError errorCode
  ${If} ${errorCode} != 0
    MessageBox MB_OK|MB_ICONSTOP "Installation failed with error code: ${errorCode}"
    SetErrorLevel ${errorCode}
    Quit
  ${EndIf}
!macroend