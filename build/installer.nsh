!include "LogicLib.nsh"


!macro customHeader
  ${If} $LANGUAGE == 2052 ; Simp. Chinese
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-CN.md"
  ${ElseIf} $LANGUAGE == 1028 ; Trad. Chinese
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_zh-TW.md"
  ${Else} ; Default to English
    !insertmacro MUI_PAGE_LICENSE "${PROJECT_DIR}\build\LICENSE_en-US.md"
  ${EndIf}
!macroend
