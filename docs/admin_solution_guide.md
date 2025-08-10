# 🔧 管理员权限解决方案

## 方法1：以管理员身份运行PowerShell

1. **关闭当前的PowerShell窗口**
2. **右键点击PowerShell图标**
3. **选择"以管理员身份运行"**
4. **导航到项目目录**：
   ```powershell
   cd C:\Users\yangx\code\electron\my-awesome-app
   ```
5. **重新运行构建命令**：
   ```powershell
   npm run build:win
   ```

## 方法2：通过开始菜单启动管理员PowerShell

1. **按Win键，搜索"PowerShell"**
2. **右键点击"Windows PowerShell"**
3. **选择"以管理员身份运行"**
4. **执行构建命令**：
   ```powershell
   cd C:\Users\yangx\code\electron\my-awesome-app
   npm run build:win
   ```

## 方法3：使用CMD以管理员身份运行

1. **按Win+R，输入cmd**
2. **按Ctrl+Shift+Enter（以管理员身份运行）**
3. **导航并构建**：
   ```cmd
   cd C:\Users\yangx\code\electron\my-awesome-app
   npm run build:win
   ```