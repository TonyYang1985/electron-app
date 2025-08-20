# 构建资源说明

## 📁 构建资源目录结构

### build/ 目录
```
build/
├── entitlements.mac.plist          # macOS 应用权限配置
├── entitlements.mas.plist          # Mac App Store 权限配置
├── entitlements.mas.inherit.plist  # Mac App Store 继承权限
├── embedded.provisionprofile       # iOS/macOS 开发者配置文件
├── embedded.mas.provisionprofile   # Mac App Store 配置文件
├── installer.nsh                   # NSIS 自定义安装脚本
└── installer.nsi                   # NSIS 安装器脚本
```

### assets/ 目录
```
assets/
├── mol.ico                         # Windows 图标 (生产环境)
├── mol.icns                        # macOS 图标 (生产环境)
├── mol.png                         # Linux 图标 (生产环境)
├── mol-DEMO.ico                    # Windows 图标 (DEMO环境)
├── mol-DEMO.icns                   # macOS 图标 (DEMO环境)
├── mol-DEV.ico                     # Windows 图标 (开发环境)
├── mol-DEV.icns                    # macOS 图标 (开发环境)
├── mol-SIT.ico                     # Windows 图标 (SIT环境)
├── mol-SIT.icns                    # macOS 图标 (SIT环境)
├── mol-UAT.ico                     # Windows 图标 (UAT环境)
├── mol-UAT.icns                    # macOS 图标 (UAT环境)
├── loading.gif                     # Windows 加载动画（缺少）
└── splash.png                      # 便携版启动画面
```

### scripts/ 目录
```
scripts/
├── notarize.js                     # macOS 应用公证脚本
├── after-pack.js                   # 打包后处理脚本
├── before-build.js                 # 构建前处理脚本
└── after-all-artifact-build.js     # 全部构建完成后处理脚本
```

## 🔧 各类资源文件说明

### macOS 权限文件

#### entitlements.mac.plist
- **用途**: 定义 macOS 应用的系统权限
- **包含权限**: 网络访问、文件系统访问、硬件加速等
- **必需性**: macOS 代码签名必需

#### entitlements.mas.plist
- **用途**: Mac App Store 应用权限配置
- **特点**: 更严格的沙箱限制
- **必需性**: 仅在发布到 Mac App Store 时需要

### Windows 安装脚本

#### installer.nsh
- **用途**: NSIS 安装器自定义脚本
- **功能**: 自定义安装界面、注册表操作、文件关联
- **语言**: NSIS 脚本语言

#### installer.nsi
- **用途**: NSIS 安装器主配置文件
- **功能**: 定义安装流程、界面样式、卸载逻辑

### 开发者配置文件

#### embedded.provisionprofile
- **用途**: iOS/macOS 开发者身份验证
- **来源**: Apple Developer Portal
- **有效期**: 通常1年，需定期更新

### 构建脚本

#### notarize.js
- **用途**: macOS 应用公证自动化
- **功能**: 上传应用到 Apple 进行安全检查
- **必需性**: macOS 10.15+ 分发必需

#### after-pack.js
- **用途**: 打包完成后的自动化处理
- **功能**: 文件重命名、权限设置、资源复制

## 🚀 使用说明

### 开发环境
```bash
# 大部分构建资源在开发时不需要
# 仅需要图标文件用于应用标识
```

### 生产构建
```bash
# Windows 构建需要:
- assets/ 中的对应环境图标
- installer.nsh/nsi (如果自定义安装器)

# macOS 构建需要:
- assets/ 中的对应环境图标
- entitlements.mac.plist (如果代码签名)
- embedded.provisionprofile (如果代码签名)
- notarize.js (如果需要公证)

# Linux 构建需要:
- assets/ 中的 PNG 图标
```

### 自动化构建 (CI/CD)
```bash
# GitHub Actions 会自动使用这些资源:
- 根据环境选择对应图标
- 应用权限配置文件
- 执行构建脚本
```

## ⚙️ 配置自定义

### 修改应用权限 (macOS)
```xml
<!-- entitlements.mac.plist 示例 -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### 自定义安装器界面 (Windows)
```nsis
; installer.nsh 示例
!define MUI_WELCOMEPAGE_TITLE "欢迎安装 BMO Middle Office"
!define MUI_WELCOMEPAGE_TEXT "这将在您的计算机上安装 BMO Middle Office 应用程序。"
```

## 📋 维护检查清单

### 定期检查项目
- [ ] 开发者证书有效期 (Apple Developer)
- [ ] 配置文件有效期 (Provisioning Profile)
- [ ] 图标文件完整性 (各环境)
- [ ] 构建脚本功能正常

### 版本更新时
- [ ] 更新版本号相关配置
- [ ] 检查新权限需求
- [ ] 测试各平台构建
- [ ] 验证安装器功能

## 🔗 相关文档

- [图标文件说明](./assets-icons.md)
- [发布流程指南](./release_process_guide.md)
- [GitHub Secrets 设置](./github_secrets_guide.md)
