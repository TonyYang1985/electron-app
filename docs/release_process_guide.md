# 🚀 完整发布流程指南

## 方式一：本地发布（推荐新手）

### 1. 准备发布
```bash
# 确保代码已提交
git add .
git commit -m "准备发布版本 1.0.0"
git push origin main

# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
# 或者手动编辑package.json中的version字段
```

### 2. 设置环境变量
```bash
# Windows (CMD)
set GITHUB_TOKEN=ghp_your_github_token_here

# Windows (PowerShell) 
$env:GITHUB_TOKEN="ghp_your_github_token_here"

# macOS/Linux
export GITHUB_TOKEN=ghp_your_github_token_here
```

### 3. 构建并发布
```bash
# 构建所有平台并自动发布到GitHub
npm run publish

# 或者分平台构建
npm run publish:win    # 仅Windows
npm run publish:mac    # 仅macOS  
npm run publish:linux  # 仅Linux
```

### 4. 验证发布
- 访问 `https://github.com/your-username/your-repo/releases`
- 检查是否有新的Release
- 下载测试安装包

## 方式二：GitHub Actions自动发布（推荐进阶）

### 1. 推送标签触发
```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0

# 或者一键创建版本和标签
npm run release
```

### 2. 手动触发构建
1. 访问GitHub仓库的Actions页面
2. 点击"构建和发布"工作流
3. 点击"Run workflow"
4. 输入版本号，点击"Run workflow"

### 3. 监控构建过程
- 在Actions页面查看构建进度
- 构建完成后自动创建Release
- 所有平台的安装包会自动上传

## 发布后的文件说明

### GitHub Releases页面会包含：

**Windows文件：**
- `My-Electron-App-Setup-1.0.0.exe` (45MB) - 标准安装程序
- `My-Electron-App-1.0.0-win-x64.exe` (44MB) - 便携版本
- `My-Electron-App-Setup-1.0.0.exe.blockmap` (1KB) - 更新映射文件

**macOS文件：**
- `My-Electron-App-1.0.0-mac-x64.dmg` (48MB) - Intel Mac安装包
- `My-Electron-App-1.0.0-mac-arm64.dmg` (48MB) - Apple Silicon Mac安装包
- `My-Electron-App-1.0.0-mac.zip` (45MB) - 自动更新包
- `My-Electron-App-1.0.0-mac.zip.blockmap` (1KB) - 更新映射文件

**Linux文件：**
- `My-Electron-App-1.0.0-x86_64.AppImage` (47MB) - 通用便携版本
- `my-electron-app_1.0.0_amd64.deb` (45MB) - Ubuntu/Debian安装包
- `my-electron-app-1.0.0.x86_64.rpm` (45MB) - CentOS/Fedora安装包

**配置文件：**
- `latest.yml` (600B) - Windows/Linux自动更新配置
- `latest-mac.yml` (600B) - macOS自动更新配置

## 版本管理策略

### 语义化版本号
```bash
# 主版本号.次版本号.修订号
1.0.0 -> 初始版本
1.0.1 -> 修复bug
1.1.0 -> 新增功能
2.0.0 -> 重大更新

# npm命令
npm version patch  # 1.0.0 -> 1.0.1 (bug修复)
npm version minor  # 1.0.1 -> 1.1.0 (新功能)
npm version major  # 1.1.0 -> 2.0.0 (重大更新)
```

### 预发布版本
```bash
# 创建预发布版本
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.1-beta.0
npm version prerelease --preid=alpha # 1.0.0 -> 1.0.1-alpha.0

# 发布预发布版本
npm run draft  # 创建草稿Release
```

## 自动更新测试

### 测试自动更新功能
1. 发布版本1.0.0
2. 安装应用
3. 修改代码，发布版本1.0.1  
4. 打开已安装的应用
5. 应用应该自动检测到更新

### 更新策略配置
```javascript
// 在main.js中配置更新策略
autoUpdater.autoDownload = false;     // 不自动下载
autoUpdater.checkForUpdatesAndNotify(); // 检查并通知

// 或者自动下载和安装
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
```

## 常见问题解决

### 1. 构建失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查electron-builder版本兼容性
npm ls electron-builder
```

### 2. 发布失败
```bash
# 检查GitHub Token权限
# 确保token有repo权限

# 检查网络连接
# 某些地区可能需要代理
```

### 3. 自动更新不工作
- 检查应用是否从GitHub Releases下载
- 确保package.json中的repository字段正确
- 检查publish配置是否正确

### 4. 文件太大
```javascript
// 在package.json中排除不必要的文件
"build": {
  "files": [
    "src/**/*",
    "!src/**/*.map",
    "!**/*.md"
  ]
}
```

## 成本分析

### 完全免费的GitHub方案
✅ **存储空间**: 无限制  
✅ **带宽流量**: 无限制  
✅ **全球CDN**: 免费  
✅ **SSL证书**: 自动  
✅ **构建时间**: 2000分钟/月(免费)  
✅ **私有仓库**: 支持  

### 与付费方案对比
| 功能 | GitHub Releases | AWS S3 | 阿里云OSS |
|------|----------------|--------|-----------|
| 存储费用 | 免费 | $0.023/GB | ¥0.12/GB |
| 流量费用 | 免费 | $0.09/GB | ¥0.50/GB |
| CDN加速 | 免费 | 额外付费 | 额外付费 |
| SSL证书 | 免费 | 额外付费 | 额外付费 |

**结论**: GitHub Releases是目前最具性价比的免费分发方案！