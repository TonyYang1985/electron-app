#!/bin/bash

# Electron应用GitHub Releases发布快速设置脚本
# 使用方法: ./setup.sh your-app-name your-github-username

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
if [ $# -lt 2 ]; then
    print_error "使用方法: $0 <app-name> <github-username>"
    print_info "例如: $0 my-electron-app octocat"
    exit 1
fi

APP_NAME=$1
GITHUB_USERNAME=$2
PROJECT_DIR=$APP_NAME

print_info "开始创建Electron应用: $APP_NAME"
print_info "GitHub用户名: $GITHUB_USERNAME"

# 检查必要工具
check_tools() {
    print_info "检查必要工具..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    print_success "所有必要工具已安装"
}

# 创建项目目录
create_project() {
    print_info "创建项目目录: $PROJECT_DIR"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "目录 $PROJECT_DIR 已存在"
        read -p "是否继续？(y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            print_info "操作已取消"
            exit 0
        fi
    else
        mkdir -p "$PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR"
    print_success "项目目录创建完成"
}

# 初始化npm项目
init_npm() {
    print_info "初始化npm项目..."
    
    cat > package.json << EOF
{
  "name": "$APP_NAME",
  "version": "1.0.0",
  "description": "基于Electron构建的桌面应用",
  "main": "src/main.js",
  "homepage": "https://github.com/$GITHUB_USERNAME/$APP_NAME",
  "author": {
    "name": "$GITHUB_USERNAME",
    "url": "https://github.com/$GITHUB_USERNAME"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/$GITHUB_USERNAME/$APP_NAME.git"
  },
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "publish": "electron-builder --publish=always",
    "publish:win": "electron-builder --win --publish=always",
    "publish:mac": "electron-builder --mac --publish=always", 
    "publish:linux": "electron-builder --linux --publish=always",
    "draft": "electron-builder --publish=onTagOrDraft",
    "release": "npm version patch && git push && git push --tags"
  },
  "build": {
    "appId": "com.${GITHUB_USERNAME,,}.$APP_NAME",
    "productName": "$APP_NAME",
    "copyright": "Copyright © 2025 $GITHUB_USERNAME",
    "directories": {
      "output": "dist",
      "resources": "resources"
    },
    "files": [
      "src/**/*",
      "resources/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "publish": [
      {
        "provider": "github",
        "owner": "$GITHUB_USERNAME",
        "repo": "$APP_NAME",
        "releaseType": "release"
      }
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "resources/icon.ico"
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "resources/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ],
      "icon": "resources/icon.png",
      "category": "Utility"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": "always"
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^26.0.12", 
    "electron-updater": "^6.3.0"
  }
}
EOF
    
    print_success "package.json创建完成"
}

# 安装依赖
install_deps() {
    print_info "安装依赖包..."
    npm install
    print_success "依赖包安装完成"
}

# 创建源码文件
create_source_files() {
    print_info "创建源码文件..."
    
    mkdir -p src
    mkdir -p resources
    mkdir -p .github/workflows
    
    # 创建主进程文件
    cat > src/main.js << 'EOF'
const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// 自动更新配置
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '发现更新',
    message: `发现新版本 ${info.version}`,
    buttons: ['立即更新', '稍后提醒']
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
EOF

    # 创建页面文件
    cat > src/index.html << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$APP_NAME</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 2rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .version-info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1.5rem;
            margin: 2rem 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 $APP_NAME</h1>
        <div class="subtitle">基于Electron构建的现代化桌面应用</div>
        
        <div class="version-info">
            <div><strong>应用版本:</strong> <span id="app-version">1.0.0</span></div>
            <div><strong>Electron版本:</strong> <span id="electron-version"></span></div>
        </div>
    </div>

    <script>
        document.getElementById('app-version').textContent = require('../package.json').version;
        document.getElementById('electron-version').textContent = process.versions.electron;
    </script>
</body>
</html>
EOF

    print_success "源码文件创建完成"
}

# 创建GitHub Actions工作流
create_github_actions() {
    print_info "创建GitHub Actions工作流..."
    
    cat > .github/workflows/build.yml << EOF
name: 构建和发布

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: \${{ matrix.os }}
    
    strategy:
      matrix:
        os: [windows-latest, macOS-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 构建和发布
        run: npm run publish
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
EOF

    print_success "GitHub Actions工作流创建完成"
}

# 创建其他必要文件
create_other_files() {
    print_info "创建其他必要文件..."
    
    # 创建.gitignore
    cat > .gitignore << 'EOF'
node_modules/
dist/
npm-debug.log*
.DS_Store
Thumbs.db
.env
.env.local
.vscode/
.idea/
*.swp
*.swo
logs/
*.log
tmp/
temp/
EOF

    # 创建README.md
    cat > README.md << EOF
# $APP_NAME

基于Electron构建的跨平台桌面应用。

## 📦 下载安装

访问 [Releases页面](https://github.com/$GITHUB_USERNAME/$APP_NAME/releases) 下载最新版本。

### Windows
- 下载 \`$APP_NAME-Setup-x.x.x.exe\` 安装程序版本
- 或下载便携版本直接运行

### macOS  
- 下载 \`$APP_NAME-x.x.x.dmg\` 文件
- 双击安装到应用程序文件夹

### Linux
- 下载 \`$APP_NAME-x.x.x.AppImage\` 文件
- 添加执行权限并运行

## ✨ 特性

- 🚀 快速启动和响应
- 🔄 自动更新功能
- 🌍 跨平台支持
- 🎨 现代化界面设计

## 🛠️ 开发

\`\`\`bash
# 克隆项目
git clone https://github.com/$GITHUB_USERNAME/$APP_NAME.git

# 安装依赖
npm install

# 开发模式
npm start

# 构建应用
npm run build

# 发布到GitHub Releases
npm run publish
\`\`\`

## 🚀 快速发布

1. 设置GitHub Token:
\`\`\`bash
export GH_TOKEN=your_github_token_here
\`\`\`

2. 构建并发布:
\`\`\`bash
npm run publish
\`\`\`

3. 或使用标签自动发布:
\`\`\`bash
git tag v1.0.1
git push origin v1.0.1
\`\`\`

## 📝 许可证

MIT License
EOF

    # 创建LICENSE文件
    cat > LICENSE << EOF
MIT License

Copyright (c) 2025 $GITHUB_USERNAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

    # 创建简单的图标占位符说明
    cat > resources/README.md << EOF
# 图标文件

请将以下图标文件放置在此目录中：

## 必需的图标文件：

1. **icon.png** - Linux图标
   - 尺寸: 256x256像素
   - 格式: PNG
   - 透明背景

2. **icon.ico** - Windows图标  
   - 包含多个尺寸: 16x16, 32x32, 48x48, 256x256
   - 格式: ICO

3. **icon.icns** - macOS图标
   - 包含多个尺寸
   - 格式: ICNS

## 可选的图标文件：

- **installer-icon.ico** - Windows安装程序图标
- **uninstaller-icon.ico** - Windows卸载程序图标
- **dmg-background.png** - macOS DMG背景图

## 图标制作工具推荐：

- 在线工具: https://www.icoconverter.com/
- macOS: Icon Composer
- Windows: IcoFX
- 跨平台: GIMP, Photoshop

注意：在没有图标文件的情况下，应用仍然可以正常构建，但会使用默认图标。
EOF

    print_success "其他必要文件创建完成"
}

# 初始化Git仓库
init_git() {
    print_info "初始化Git仓库..."
    
    git init
    git add .
    git commit -m "🎉 初始化Electron应用项目

✨ 功能特性:
- 基础Electron应用结构
- GitHub Releases自动发布配置
- 跨平台构建支持
- 自动更新功能
- GitHub Actions CI/CD

🚀 快速开始:
1. 设置GitHub Token: export GH_TOKEN=your_token
2. 运行开发模式: npm start  
3. 构建应用: npm run build
4. 发布到GitHub: npm run publish"

    print_success "Git仓库初始化完成"
}

# 提供下一步指导
show_next_steps() {
    print_success "🎉 项目创建完成！"
    echo
    print_info "📁 项目位置: $(pwd)"
    echo
    print_info "🚀 下一步操作:"
    echo
    echo "1. 进入项目目录:"
    echo "   cd $APP_NAME"
    echo
    echo "2. 创建GitHub仓库:"
    echo "   - 访问 https://github.com/new"
    echo "   - 仓库名设置为: $APP_NAME"
    echo "   - 不要初始化README (已存在)"
    echo
    echo "3. 关联远程仓库:"
    echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$APP_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo
    echo "4. 设置GitHub Token (用于发布):"
    echo "   - 访问: https://github.com/settings/tokens"
    echo "   - 创建新token，勾选 'repo' 权限"
    echo "   - 设置环境变量:"
    echo "     export GH_TOKEN=your_token_here"
    echo
    echo "5. 开始开发:"
    echo "   npm start              # 启动开发模式"
    echo "   npm run build          # 构建应用"  
    echo "   npm run publish        # 构建并发布到GitHub"
    echo
    echo "6. 自动化发布 (可选):"
    echo "   git tag v1.0.1         # 创建版本标签"
    echo "   git push origin v1.0.1 # 推送标签触发自动构建"
    echo
    print_info "📚 更多信息请查看 README.md 文件"
    echo
    print_warning "⚠️  注意事项:"
    echo "   - 请在 resources/ 目录中添加应用图标"
    echo "   - 首次发布前请测试本地构建"
    echo "   - GitHub Actions需要推送代码后才能使用"
}

# 主函数
main() {
    print_info "🚀 Electron GitHub Releases 项目快速设置工具"
    echo
    
    check_tools
    create_project
    init_npm
    install_deps
    create_source_files
    create_github_actions
    create_other_files
    init_git
    show_next_steps
}

# 运行主函数
main