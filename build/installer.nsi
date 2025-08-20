!include "MUI2.nsh"
!include "LogicLib.nsh"

; Language strings for custom dialogs
LangString AppRunning ${LANG_ENGLISH} "${PRODUCT_NAME} is currently running. Please close it before continuing."
LangString AppRunning ${LANG_SIMPCHINESE} "${PRODUCT_NAME} 正在运行。请在继续前关闭它。"
LangString AppRunning ${LANG_TRADCHINESE} "${PRODUCT_NAME} 正在運行。請在繼續前關閉它。"

LangString ConfirmDelete ${LANG_ENGLISH} "Do you want to remove all application data?"
LangString ConfirmDelete ${LANG_SIMPCHINESE} "您要删除所有应用程序数据吗？"
LangString ConfirmDelete ${LANG_TRADCHINESE} "您要刪除所有應用程式資料嗎？"

!macro customInit
  !insertmacro MUI_LANGDLL_DISPLAY
!macroend

!macro customInstall
  ; Check if the application is running by finding its main window.
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "$(AppRunning)"
    Abort
  ${EndIf}
  ; Custom installation tasks completed
!macroend

!macro customUnInstall
  ; Check if the application is running by finding its main window.
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "$(AppRunning)"
    Abort
  ${EndIf}

  ; Ask the user if they want to delete their data
  MessageBox MB_YESNO|MB_ICONQUESTION "$(ConfirmDelete)" /SD IDYES IDYES deleteData
  goto skipDeleteData

  deleteData:
    RMDir /r "$APPDATA\${PRODUCT_NAME}"
    
  skipDeleteData:
  ; Custom uninstallation tasks completed
!macroend

; REQUIRED: Main installation section
Section "MainSection" SEC01
  ; This section will be populated by electron-builder
  ; The customInstall macro will be called automatically
SectionEnd

; REQUIRED: Uninstaller section
Section "Uninstall"
  ; This section will be populated by electron-builder
  ; The customUnInstall macro will be called automatically
SectionEnd