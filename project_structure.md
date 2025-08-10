# 项目文件结构

```
my-electron-app/
├── .github/
│   └── workflows/
│       └── build.yml                 # GitHub Actions工作流
├── src/
│   ├── main.js                       # 主进程代码
│   ├── index.html                    # 渲染进程页面
│   └── renderer.js                   # 渲染进程脚本(可选)
├── resources/                        # 应用资源
│   ├── icon.png                      # Linux图标 (256x256)
│   ├── icon.ico                      # Windows图标
│   ├── icon.icns                     # macOS图标
│   ├── installer-icon.ico            # Windows安装程序图标
│   ├── uninstaller-icon.ico          # Windows卸载程序图标
│   ├── installer-header-icon.ico     # Windows安装程序头部图标
│   └── dmg-background.png            # macOS DMG背景图
├── build/                            # 构建脚本(可选)
│   ├── installer.nsh                 # NSIS安装脚本
│   └── entitlements.mac.plist        # macOS权限配置
├── dist/                             # 构建输出目录(自动生成)
├── node_modules/                     # 依赖包(自动生成)
├── package.json                      # 项目配置
├── package-lock.json                 # 依赖锁定(自动生成)
├── README.md                         # 项目说明
├── LICENSE                           # 开源许可证
└── .gitignore                        # Git忽略文件
```

## 必需的资源文件

### 1. 创建图标文件
```bash
# 创建resources目录
mkdir resources

# 准备不同格式的图标
# icon.png - 256x256像素，用于Linux
# icon.ico - 包含多尺寸，用于Windows  
# icon.icns - 包含多尺寸，用于macOS
```

### 2. .gitignore文件
```gitignore
# 依赖
node_modules/
npm-debug.log*

# 构建输出
dist/
build/

# 系统文件
.DS_Store
Thumbs.db

# 环境变量
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 日志
logs/
*.log

# 临时文件
tmp/
temp/
```

### 3. README.md示例
```markdown
# My Electron App

一个基于Electron构建的跨平台桌面应用。

## 📦 下载安装

访问 [Releases页面](https://github.com/your-username/my-electron-app/releases) 下载最新版本:

### Windows
- 下载 `My-Electron-App-Setup-x.x.x.exe` 安装程序版本
- 或下载便携版本直接运行

### macOS  
- 下载 `My-Electron-App-x.x.x.dmg` 文件
- 双击安装到应用程序文件夹

### Linux
- 下载 `My-Electron-App-x.x.x.AppImage` 文件
- 添加执行权限: `chmod +x My-Electron-App-x.x.x.AppImage`
- 直接运行

## ✨ 特性

- 🚀 快速启动和响应
- 🔄 自动更新功能
- 🌍 跨平台支持
- 🎨 现代化界面设计

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/your-username/my-electron-app.git

# 安装依赖
npm install

# 开发模式
npm start

# 构建应用
npm run build
```

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
```