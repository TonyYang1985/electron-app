; installer.nsh with license page for electron-builder 26.x
!include "LogicLib.nsh"

; 添加许可证页面
!macro customHeader
  !ifdef PROJECT_DIR
    ${If} ${FileExists} "${PROJECT_DIR}\build\LICENSE_en-US.md"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_en-US.md"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\build\LICENSE.txt"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE.txt"
    ${ElseIf} ${FileExists} "${PROJECT_DIR}\LICENSE"
      !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\LICENSE"
    ${EndIf}
  !endif
!macroend

; 使用硬编码消息避免语言字符串冲突
!macro customInstall
  ; 检查应用程序是否运行
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME} is currently running. Please close it before continuing.$\r$\n${PRODUCT_NAME} 正在运行，请先关闭应用程序。"
    Abort
  ${EndIf}
!macroend

!macro customUnInstall
  ; 检查应用程序是否运行
  FindWindow $R0 "" "${PRODUCT_NAME}"
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME} is currently running. Please close it before continuing.$\r$\n${PRODUCT_NAME} 正在运行，请先关闭应用程序。"
    Abort
  ${EndIf}

  ; 询问删除数据（多语言硬编码消息）
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove all application data?$\r$\n您要删除所有应用程序数据吗？" /SD IDNO IDYES deleteData
  Goto skipDeleteData

  deleteData:
    RMDir /r "$APPDATA\${PRODUCT_NAME}"
    RMDir /r "$LOCALAPPDATA\${PRODUCT_NAME}"
    
  skipDeleteData:
!macroend