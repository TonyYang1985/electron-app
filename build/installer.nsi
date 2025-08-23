!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"

; Define languages
!ifndef MUI_LANG_ENGLISH
  !insertmacro MUI_LANGUAGE "English"
!endif
!ifndef MUI_LANG_SIMPCHINESE
  !insertmacro MUI_LANGUAGE "SimpChinese"
!endif
!ifndef MUI_LANG_TRADCHINESE
  !insertmacro MUI_LANGUAGE "TradChinese"
!endif

; Language strings for custom dialogs
LangString AppRunning 1033 "${PRODUCT_NAME} is currently running. Please close it before continuing."
LangString AppRunning 2052 "${PRODUCT_NAME} 正在运行。请在继续前关闭它。"
LangString AppRunning 1028 "${PRODUCT_NAME} 正在運行。請在繼續前關閉它。"

LangString ConfirmDelete 1033 "Do you want to remove all application data?"
LangString ConfirmDelete 2052 "您要删除所有应用程序数据吗？"
LangString ConfirmDelete 1028 "您要刪除所有應用程式資料嗎？"

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

; Custom license page macro
!macro customHeader
  ${If} $LANGUAGE == 2052 ; Simp. Chinese
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-CN.md"
  ${ElseIf} $LANGUAGE == 1028 ; Trad. Chinese
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-TW.md"
  ${Else} ; Default to English
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_en-US.md"
  ${EndIf}
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