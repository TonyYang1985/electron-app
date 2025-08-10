# 🛠️ Windows开发者模式解决方案

## Windows 11开发者模式启用：

1. **打开设置**（Win + I）
2. **点击"隐私和安全性"**
3. **点击"开发者选项"**
4. **开启"开发人员模式"**
5. **在确认对话框中点击"是"**

## Windows 10开发者模式启用：

1. **打开设置**（Win + I）
2. **点击"更新和安全"**
3. **点击左侧"开发者选项"**
4. **选择"开发人员模式"**
5. **在确认对话框中点击"是"**

## 命令行方式（需要管理员权限）：

```cmd
# 以管理员身份打开CMD，运行以下命令
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"

# 重启计算机使设置生效
```

## 验证是否生效：

启用开发者模式后：
1. **重启命令行**
2. **重新运行构建**：
   ```bash
   npm run build:win
   ```

开发者模式的好处：
- ✅ 允许创建符号链接
- ✅ 允许安装未签名的应用
- ✅ 解决electron-builder权限问题