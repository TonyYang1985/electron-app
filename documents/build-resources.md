# 构建资源说明

## 📁 构建资源目录结构

### build/ 目录

```
build/
├── icon.ico                        # Windows 构建图标 
├── installer.nsh                   # NSIS 自定义安装脚本 
├── installer.nsi                   # NSIS 安装器主脚本 
├── entitlements.mac.plist          # macOS 权限配置文件 
├── entitlements.mas.plist          # Mac App Store 权限配置 
├── entitlements.mas.inherit.plist  # Mac App Store 继承权限 
├── embedded.provisionprofile       # iOS/macOS 开发者配置文件 
├── embedded.mas.provisionprofile   # Mac App Store 配置文件 
└── CHANGELOG.md                   # 更新日志模板 
```

### assets/ 目录

```
assets/
├── icon.ico                        # Windows 通用图标 
├── icon.icns                       # macOS 通用图标 
├── icon.png                        # Linux 通用图标 
├── mol.ico                         # Windows 生产环境图标 
├── mol.icns                        # macOS 生产环境图标 
├── mol.png                         # Linux 生产环境图标 
├── mol-DEV.ico                     # Windows 开发环境图标 
├── mol-DEV.icns                    # macOS 开发环境图标 
├── mol-SIT.ico                     # Windows 测试环境图标 
├── mol-SIT.icns                    # macOS 测试环境图标 
├── mol-UAT.ico                     # Windows UAT环境图标 
├── mol-UAT.icns                    # macOS UAT环境图标 
├── mol-DEMO.ico                    # Windows 演示环境图标 
├── mol-DEMO.icns                   # macOS 演示环境图标 
├── Removable.icns                  # macOS 可移动设备图标 
├── splash.png                      # 应用启动画面 
└── loading.gif                     # Windows 加载动画 
```

### scripts/ 目录

```
scripts/
├── before-build.js                 # 构建前处理脚本 
├── after-pack.js                   # 打包后处理脚本 
├── after-all-artifact-build.js    # 全部构建完成后处理脚本 
└── notarize.js                     # macOS 应用公证脚本 
```

## 🔧 各类资源文件说明

### 构建配置文件

#### `build/icon.ico` 

- **用途**: Windows 平台构建时使用的默认图标
- **格式**: ICO 格式，包含多种尺寸
- **必需性**: Windows 构建必需

#### `build/entitlements.mac.plist` 

- **用途**: macOS 应用权限配置文件
- **包含权限**: 网络访问、文件系统访问、硬件加速等
- **必需性**: macOS 代码签名时必需

#### `build/entitlements.mas.plist` 

- **用途**: Mac App Store 应用权限配置
- **特点**: 更严格的沙箱限制
- **必需性**: 仅在发布到 Mac App Store 时需要

### Windows 安装器脚本

#### `build/installer.nsh` 

- **用途**: NSIS 安装器自定义功能脚本
- **功能**: 自定义安装界面、注册表操作、文件关联
- **语言**: NSIS 脚本语言

#### `build/installer.nsi` 

- **用途**: NSIS 安装器主配置文件
- **功能**: 定义安装流程、界面样式、卸载逻辑

### 开发者配置文件

#### `build/embedded.provisionprofile` 

- **用途**: iOS/macOS 开发者身份验证
- **来源**: Apple Developer Portal
- **有效期**: 通常1年，需定期更新

#### `build/embedded.mas.provisionprofile` 

- **用途**: Mac App Store 开发者身份验证
- **来源**: Apple Developer Portal

### 应用图标资源

#### 环境特定图标

项目支持多环境图标配置，根据构建环境自动选择对应图标：

| 环境 | Windows 图标 | macOS 图标 | 状态 |
|------|-------------|------------|------|
| PROD | `mol.ico` | `mol.icns` |  |
| DEV | `mol-DEV.ico` | `mol-DEV.icns` |  |
| SIT | `mol-SIT.ico` | `mol-SIT.icns` |  |
| UAT | `mol-UAT.ico` | `mol-UAT.icns` |  |
| DEMO | `mol-DEMO.ico` | `mol-DEMO.icns` |  |

#### 通用图标

- `icon.ico/icns/png` - 默认通用图标，用于未指定环境的构建 

#### 启动相关资源

- `splash.png` - 应用启动画面 
- `loading.gif` - Windows 加载动画 

### 构建钩子脚本

#### `scripts/before-build.js` 

- **执行时机**: electron-builder 开始构建前
- **用途**: 准备构建环境、清理临时文件、环境变量设置
- **返回值**: 必须返回 Promise 或同步完成

#### `scripts/after-pack.js` 

- **执行时机**: 应用打包完成后，创建安装包前
- **用途**: 文件重命名、权限设置、资源复制、签名准备
- **参数**: 接收构建上下文对象

#### `scripts/after-all-artifact-build.js` 

- **执行时机**: 所有平台构建产物生成完成后
- **用途**: 统一后处理、文件整理、通知发送
- **适用场景**: 多平台构建的最终处理步骤

#### `scripts/notarize.js` 

- **执行时机**: macOS 应用构建完成后
- **用途**: 自动化 Apple 公证流程
- **必需性**: macOS 10.15+ 分发必需
- **前置条件**: 需要 Apple Developer 账户和应用专用密码

## 🚀 使用场景

### 开发环境构建

```bash
# 开发时主要使用:
npm run dev

# 需要的资源:
# - assets/icon.* (应用图标) 
# - src/ 源代码
```

### 生产环境构建

#### Windows 构建

```bash
npm run build:win

# 需要的资源:
# - build/icon.ico (构建图标) 
# - assets/mol*.ico (环境特定图标) 
# - build/installer.nsh/nsi (自定义安装器) 
```

#### macOS 构建

```bash
npm run build:mac

# 需要的资源:
# - assets/mol*.icns (环境特定图标) 
# - build/entitlements.mac.plist (权限配置) 
# - scripts/notarize.js (公证脚本) 
```

#### Linux 构建

```bash
npm run build:linux

# 需要的资源:
# - assets/mol.png (Linux 图标) 
```

### CI/CD 自动化构建

GitHub Actions 工作流会自动：

1. 根据环境标签选择对应图标
2. 应用权限配置文件
3. 执行构建钩子脚本
4. 处理代码签名和公证

## ⚙️ 自定义配置

### 添加新环境图标

1. **准备图标文件**：

   ```bash
   # Windows: 创建 .ico 文件 (16x16 到 256x256 多尺寸)
   # macOS: 创建 .icns 文件 (16x16 到 1024x1024 多尺寸)
   # Linux: 创建 .png 文件 (推荐 512x512)
   ```

2. **命名规范**：

   ```
   mol-{ENV}.ico    # Windows
   mol-{ENV}.icns   # macOS
   mol-{ENV}.png    # Linux (可选)
   ```

3. **更新构建配置**：
   - 在 `env/{ENV}.json` 中指定图标路径
   - 在 `package.json` 中添加对应构建脚本

### 修改应用权限 (macOS)

编辑 `build/entitlements.mac.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <!-- 添加新权限 -->
    <key>com.apple.security.device.camera</key>
    <true/>
    <key>com.apple.security.device.microphone</key>
    <true/>
</dict>
</plist>
```

### 自定义安装器界面 (Windows)

编辑 `build/installer.nsh`：

```nsis
# 自定义安装欢迎页面
!define MUI_WELCOMEPAGE_TITLE "欢迎安装 ${PRODUCT_NAME}"
!define MUI_WELCOMEPAGE_TEXT "安装向导将引导您完成安装过程。"

# 自定义完成页面
!define MUI_FINISHPAGE_TITLE "安装完成"
!define MUI_FINISHPAGE_TEXT "${PRODUCT_NAME} 已成功安装到您的计算机。"
```

## 📋 待添加文件清单

### 高优先级 🔥

- [ ] `build/entitlements.mac.plist` - 标准 macOS 权限配置
- [ ] `build/embedded.provisionprofile` - 开发者配置文件
- [ ] `assets/loading.gif` - Windows 加载动画

### 中优先级 ⚡

- [ ] `build/entitlements.mas.plist` - Mac App Store 权限
- [ ] `build/entitlements.mas.inherit.plist` - MAS 继承权限
- [ ] `build/embedded.mas.provisionprofile` - MAS 配置文件

## 📋 维护检查清单

### 定期检查 (每月)

- [ ] 图标文件完整性检查
- [ ] 构建脚本功能测试
- [ ] 许可证文件更新检查
- [ ] 安装器脚本语法验证

### 版本发布前

- [ ] 所有环境图标文件存在
- [ ] macOS 权限配置适配新功能
- [ ] Windows 安装器界面测试
- [ ] 构建钩子脚本执行测试
- [ ] 多平台构建验证

### 证书和配置更新

- [ ] Apple Developer 证书有效期检查
- [ ] 代码签名配置更新
- [ ] 公证流程测试
- [ ] Windows 代码签名证书检查

## � 故障排除

### 常见问题

#### 1. 图标不显示

```bash
# 检查图标文件路径
ls -la assets/mol*.ico
ls -la assets/mol*.icns

# 验证图标格式
file assets/mol.ico
```

#### 2. macOS 构建失败

```bash
# 检查权限配置文件
plutil -lint build/entitlements.mac.plist

# 验证代码签名配置
security find-identity -v -p codesigning
```

#### 3. Windows 安装器错误

```bash
# 检查 NSIS 脚本语法
makensis -NOCD build/installer.nsi
```

#### 4. 构建钩子脚本失败

```bash
# 单独测试脚本
node scripts/before-build.js
node scripts/after-pack.js
```

## 🔗 相关文档

- [项目结构文档](./01.PROJECT_STRUCTURE.md)
- [GitHub Workflow 文档](./10.GITHUB_WORKFLOW_DOCUMENTATION.md)
- [Electron Builder 官方文档](https://www.electron.build/)
- [NSIS 脚本文档](https://nsis.sourceforge.io/Docs/)
