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
  "staticVersion": "1.0.0",
  "description": "基于Electron构建的桌面应用",
  "main": "release/main.js",
  "homepage": "https://github.com/$GITHUB_USERNAME/$APP_NAME",
  "author": {
    "name": "$GITHUB_USERNAME",
    "email": "your-email@example.com",
    "url": "https://github.com/$GITHUB_USERNAME"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/$GITHUB_USERNAME/$APP_NAME.git"
  },
  "scripts": {
    "config:ts:LOCAL": "cross-env API_ENV=LOCAL tsx src/scripts/start.ts",
    "config:ts:DEV": "cross-env API_ENV=DEV tsx src/scripts/start.ts",
    "config:ts:SIT": "cross-env API_ENV=SIT tsx src/scripts/start.ts",
    "config:ts:UAT": "cross-env API_ENV=UAT tsx src/scripts/start.ts",
    "config:ts:PROD": "cross-env API_ENV=PROD tsx src/scripts/start.ts",
    "config:ts:DEMO": "cross-env API_ENV=DEMO tsx src/scripts/start.ts",
    "start": "npm run build && electron .",
    "dev": "npm run build && electron . --dev",
    "compile": "tsc",
    "copy": "shx mkdir -p release && shx cp src/index.html release/index.html",
    "clean": "shx rm -rf release",
    "build": "npm run compile && npm run copy",
    "build:win": "npm run config:ts:PROD && npm run build && electron-builder --win",
    "build:mac": "npm run config:ts:PROD && npm run build && electron-builder --mac",
    "build:linux": "npm run config:ts:PROD && npm run build && electron-builder --linux"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.8.3",
    "@electron-forge/shared-types": "^7.8.3",
    "@electron/notarize": "^2.5.0",
    "@types/node": "^20.19.11",
    "cpy-cli": "^5.0.0",
    "cross-env": "^7.0.3",
    "electron": "^28.2.4",
    "electron-builder": "^26.0.12",
    "fs-extra": "^11.3.1",
    "shx": "^0.3.4",
    "tsx": "^4.20.4",
    "typescript": "^5.9.2"
  },
  "dependencies": {
    "app-builder-lib": "^26.0.12",
    "electron-updater": "^6.6.2"
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
    mkdir -p src/scripts
    mkdir -p assets
    mkdir -p env
    mkdir -p .github/workflows
    
    # 创建TypeScript配置文件
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./release",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "release",
    "dist"
  ]
}
EOF

    # 创建electron-builder配置文件
    cat > electron-builder.json << EOF
{
  "appId": "com.${GITHUB_USERNAME,,}.$APP_NAME",
  "productName": "$APP_NAME",
  "copyright": "Copyright 2025 $GITHUB_USERNAME",
  "directories": {
    "output": "dist"
  },
  "files": [
    "release/**/*",
    "assets/**/*",
    "env/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "env/",
      "to": "env/"
    }
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
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ],
    "icon": "assets/icon.icns",
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
    "icon": "assets/icon.png",
    "category": "Utility"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": "always"
  }
}
EOF

    # 创建TypeScript类型定义文件
    cat > src/types.ts << 'EOF'
import { MessageBoxOptions, UpdateInfo } from 'electron';

export interface AppConfig {
  isDev: boolean;
  version: string;
  name: string;
}

export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  show?: boolean;
}

export interface UpdateNotificationOptions extends MessageBoxOptions {
  version: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      API_ENV?: 'LOCAL' | 'DEV' | 'SIT' | 'UAT' | 'PROD' | 'DEMO';
    }
  }
}

export type { UpdateInfo };
EOF

    # 创建主进程TypeScript文件
    cat > src/main.ts << 'EOF'
import { app, BrowserWindow, Menu, dialog, MessageBoxOptions } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import * as path from 'path';
import { AppConfig, WindowConfig, UpdateNotificationOptions } from './types';

const isDev: boolean = process.env.NODE_ENV === 'development';
const appConfig: AppConfig = {
  isDev,
  version: app.getVersion(),
  name: app.getName()
};

let mainWindow: BrowserWindow | null = null;

// 自动更新配置
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

autoUpdater.on('update-available', (info: UpdateInfo) => {
  if (mainWindow) {
    const options: UpdateNotificationOptions = {
      type: 'info',
      title: '发现更新',
      message: `发现新版本 ${info.version}`,
      buttons: ['立即更新', '稍后提醒'],
      version: info.version
    };
    
    dialog.showMessageBox(mainWindow, options);
  }
});

function createWindow(): void {
  const windowConfig: WindowConfig = {
    width: 1200,
    height: 800,
    show: false
  };

  mainWindow = new BrowserWindow({
    ...windowConfig,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
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

    # 创建环境配置脚本
    cat > src/scripts/start.ts << 'EOF'
import * as fs from 'fs';
import * as path from 'path';

interface EnvironmentConfig {
  API_ENV: string;
  [key: string]: any;
}

const API_ENV = process.env.API_ENV || 'LOCAL';

console.log(`🚀 配置环境: ${API_ENV}`);

// 读取环境配置文件
const envConfigPath = path.join(__dirname, '../../env', `${API_ENV}.json`);

if (fs.existsSync(envConfigPath)) {
  const envConfig: EnvironmentConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
  console.log(`✅ 已加载环境配置: ${envConfigPath}`);
  console.log(`📋 配置内容:`, envConfig);
} else {
  console.log(`⚠️ 环境配置文件不存在: ${envConfigPath}`);
  console.log(`📝 请创建对应的环境配置文件`);
}
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
        .tech-stack {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 $APP_NAME</h1>
        <div class="subtitle">基于Electron + TypeScript构建的现代化桌面应用</div>
        
        <div class="version-info">
            <div><strong>应用版本:</strong> <span id="app-version">1.0.0</span></div>
            <div><strong>Electron版本:</strong> <span id="electron-version"></span></div>
            <div><strong>Node.js版本:</strong> <span id="node-version"></span></div>
            <div><strong>Chrome版本:</strong> <span id="chrome-version"></span></div>
            
            <div class="tech-stack">
                <div><strong>🔧 技术栈</strong></div>
                <div>TypeScript • Electron • Node.js</div>
                <div>自动更新 • 跨平台构建 • GitHub Actions</div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('app-version').textContent = require('../package.json').version;
        document.getElementById('electron-version').textContent = process.versions.electron;
        document.getElementById('node-version').textContent = process.versions.node;
        document.getElementById('chrome-version').textContent = process.versions.chrome;
    </script>
</body>
</html>
EOF

    # 创建环境配置文件
    cat > env/LOCAL.json << 'EOF'
{
  "API_ENV": "LOCAL",
  "API_BASE_URL": "http://localhost:3000",
  "DEBUG": true,
  "AUTO_UPDATE": false
}
EOF

    cat > env/DEV.json << 'EOF'
{
  "API_ENV": "DEV",
  "API_BASE_URL": "https://dev-api.example.com",
  "DEBUG": true,
  "AUTO_UPDATE": true
}
EOF

    cat > env/PROD.json << 'EOF'
{
  "API_ENV": "PROD",
  "API_BASE_URL": "https://api.example.com",
  "DEBUG": false,
  "AUTO_UPDATE": true
}
EOF

    print_success "源码文件创建完成"
}

# 创建GitHub Actions工作流
create_github_actions() {
    print_info "创建GitHub Actions工作流..."
    
    cat > .github/workflows/build.yml << 'EOF'
name: 构建和发布

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:
    inputs:
      version:
        description: "发布版本号 (例如: 1.0.18)"
        required: true
        default: "1.0.18"
      environment:
        description: "构建环境 (PROD, DEV, SIT, DEMO)"
        required: false
        default: "PROD"
        type: choice
        options:
          - "PROD"
          - "DEV"
          - "SIT"
          - "DEMO"

permissions:
  contents: write

jobs:
  # 构建阶段 - 完全禁用自动发布
  build:
    name: 构建 ${{ matrix.name }}
    runs-on: ${{ matrix.os }}
    timeout-minutes: 45

    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            name: Windows
            platform: win
          - os: macos-latest
            name: macOS
            platform: mac
          - os: ubuntu-latest
            name: Linux
            platform: linux

    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          # 使用特定SHA避免标签信息
          ref: ${{ github.sha }}

      - name: 解析环境信息
        id: parse_env
        shell: bash
        run: |
          # 从git tag或手动输入解析环境
          if [[ "${{ github.event_name }}" == "push" && "${{ github.ref }}" == refs/tags/* ]]; then
            # 从标签解析环境 (支持忽略大小写)
            TAG_NAME="${{ github.ref }}"
            TAG_NAME=${TAG_NAME#refs/tags/}
            echo "📋 检测到标签: $TAG_NAME"
            
            # 提取环境后缀并转换为大写
            if [[ $TAG_NAME =~ -([a-zA-Z]+)$ ]]; then
              ENV_SUFFIX="${BASH_REMATCH[1]}"
              ENV_SUFFIX=$(echo "$ENV_SUFFIX" | tr '[:lower:]' '[:upper:]')
              echo "🎯 检测到环境后缀: $ENV_SUFFIX"
              
              case $ENV_SUFFIX in
                "DEV"|"DEVELOPMENT")
                  BUILD_ENV="DEV"
                  ;;
                "SIT"|"STAGING")
                  BUILD_ENV="SIT"
                  ;;
                "DEMO"|"DEMONSTRATION")
                  BUILD_ENV="DEMO"
                  ;;
                "PROD"|"PRODUCTION")
                  BUILD_ENV="PROD"
                  ;;
                *)
                  echo "⚠️ 未识别的环境后缀: $ENV_SUFFIX，默认使用 PROD"
                  BUILD_ENV="PROD"
                  ;;
              esac
            else
              echo "📦 无环境后缀，默认使用 PROD"
              BUILD_ENV="PROD"
            fi
          else
            # 手动触发时使用输入的环境
            BUILD_ENV="${{ github.event.inputs.environment || 'PROD' }}"
          fi

          echo "🚀 构建环境: $BUILD_ENV"
          echo "BUILD_ENVIRONMENT=$BUILD_ENV" >> $GITHUB_OUTPUT
          echo "BUILD_ENVIRONMENT=$BUILD_ENV" >> $GITHUB_ENV

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: 安装依赖
        run: npm ci

      # 编译 TypeScript 代码和准备文件
      - name: 编译和准备文件
        run: npm run build

      # 验证编译结果
      - name: 验证编译结果
        shell: bash
        run: |
          echo "=== TypeScript 编译验证 ==="
          if [ -f "release/main.js" ]; then
            echo "✅ main.js 编译成功"
            ls -la release/
          else
            echo "❌ TypeScript 编译失败: main.js 不存在"
            exit 1
          fi

          if [ -f "release/index.html" ]; then
            echo "✅ index.html 复制成功"
          else
            echo "❌ 资源复制失败: index.html 不存在"
            exit 1
          fi

      # 彻底清理Git环境防止electron-builder检测标签
      - name: 清理Git标签环境
        shell: bash
        run: |
          echo "清理Git环境以防止electron-builder自动发布..."

          # 移除所有远程引用
          git remote remove origin || true

          # 删除所有标签
          git tag -l | xargs -r git tag -d

          # 重新初始化为普通仓库
          rm -rf .git/refs/remotes
          rm -rf .git/refs/tags

          # 验证清理结果
          echo "当前Git状态:"
          git status || echo "Git状态检查完成"
          git tag -l || echo "无标签"

          echo "✅ Git环境已清理，electron-builder不会检测到发布条件"

      # 构建
      - name: 构建 ${{ matrix.name }}
        run: npm run build:${{ matrix.platform }}
        env:
          CSC_IDENTITY_AUTO_DISCOVERY: false
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BUILD_ENVIRONMENT: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}

      # 验证构建结果 - 使用目标环境
      - name: 验证构建结果
        shell: bash
        run: |
          echo "=== ${{ matrix.name }} 构建验证 (环境: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}) ==="

          # 检查dist目录
          if [ -d "dist" ]; then
            echo "📁 找到构建目录: dist"
            
            # 查找构建文件
            BUILD_FILES=$(find "dist" -name "*.exe" -o -name "*.dmg" -o -name "*.zip" -o -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" 2>/dev/null || true)
            
            if [ -n "$BUILD_FILES" ]; then
              echo "✅ 找到构建文件:"
              echo "$BUILD_FILES" | while read -r file; do
                [ -n "$file" ] && ls -lh "$file"
              done
              
              FILE_COUNT=$(echo "$BUILD_FILES" | grep -c . || echo 0)
              echo "📊 构建统计: 找到 $FILE_COUNT 个构建文件"
              echo "✅ ${{ matrix.name }} 构建成功"
            else
              echo "❌ ${{ matrix.name }} 构建失败: 目录存在但未找到构建文件"
              exit 1
            fi
          else
            echo "❌ ${{ matrix.name }} 构建失败: 未找到构建目录 dist"
            echo "当前目录结构:"
            find . -maxdepth 2 -type d | head -10
            exit 1
          fi

      # 上传构建产物
      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.name }}-${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}-v${{ github.run_number }}
          path: |
            dist/*
          retention-days: 7
          compression-level: 6
          if-no-files-found: warn

  # 发布阶段
  release:
    name: 创建GitHub Release
    needs: build
    runs-on: ubuntu-latest
    if: needs.build.result == 'success'
    timeout-minutes: 30

    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 解析环境信息
        id: parse_env
        shell: bash
        run: |
          # 从git tag或手动输入解析环境
          if [[ "${{ github.event_name }}" == "push" && "${{ github.ref }}" == refs/tags/* ]]; then
            # 从标签解析环境 (支持忽略大小写)
            TAG_NAME="${{ github.ref }}"
            TAG_NAME=${TAG_NAME#refs/tags/}
            echo "📋 检测到标签: $TAG_NAME"
            
            # 提取环境后缀并转换为大写
            if [[ $TAG_NAME =~ -([a-zA-Z]+)$ ]]; then
              ENV_SUFFIX="${BASH_REMATCH[1]}"
              ENV_SUFFIX=$(echo "$ENV_SUFFIX" | tr '[:lower:]' '[:upper:]')
              echo "🎯 检测到环境后缀: $ENV_SUFFIX"
              
              case $ENV_SUFFIX in
                "DEV"|"DEVELOPMENT")
                  BUILD_ENV="DEV"
                  ;;
                "SIT"|"STAGING")
                  BUILD_ENV="SIT"
                  ;;
                "DEMO"|"DEMONSTRATION")
                  BUILD_ENV="DEMO"
                  ;;
                "PROD"|"PRODUCTION")
                  BUILD_ENV="PROD"
                  ;;
                *)
                  echo "⚠️ 未识别的环境后缀: $ENV_SUFFIX，默认使用 PROD"
                  BUILD_ENV="PROD"
                  ;;
              esac
            else
              echo "📦 无环境后缀，默认使用 PROD"
              BUILD_ENV="PROD"
            fi
          else
            # 手动触发时使用输入的环境
            BUILD_ENV="${{ github.event.inputs.environment || 'PROD' }}"
          fi

          echo "🚀 发布环境: $BUILD_ENV"
          echo "BUILD_ENVIRONMENT=$BUILD_ENV" >> $GITHUB_OUTPUT
          echo "BUILD_ENVIRONMENT=$BUILD_ENV" >> $GITHUB_ENV

      - name: 获取版本信息
        id: version
        run: |
          if [[ $GITHUB_REF == refs/tags/* ]]; then
            VERSION=${GITHUB_REF#refs/tags/v}
          else
            VERSION="${{ github.event.inputs.version || '1.0.0' }}"
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "tag=v$VERSION" >> $GITHUB_OUTPUT
          echo "📋 发布版本: $VERSION"

      # 下载所有构建产物
      - name: 下载构建产物
        uses: actions/download-artifact@v4
        with:
          path: artifacts/

      # 整理发布文件
      - name: 整理发布文件
        run: |
          mkdir -p release-files

          echo "=== 检查下载的构建产物 (环境: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}) ==="
          find artifacts/ -type f \( \
            -name "*.exe" -o \
            -name "*.dmg" -o \
            -name "*.zip" -o \
            -name "*.deb" -o \
            -name "*.rpm" -o \
            -name "*.AppImage" -o \
            -name "*.yml" -o \
            -name "*.blockmap" \
          \) -exec ls -lh {} \;

          # 复制所有文件到release目录
          find artifacts/ -type f \( \
            -name "*.exe" -o \
            -name "*.dmg" -o \
            -name "*.zip" -o \
            -name "*.deb" -o \
            -name "*.rpm" -o \
            -name "*.AppImage" -o \
            -name "*.yml" -o \
            -name "*.blockmap" \
          \) -exec cp {} release-files/ \;

          echo ""
          echo "=== 准备发布的文件 ==="
          ls -lah release-files/

          # 统计文件信息
          file_count=$(ls -1 release-files/ | wc -l)
          total_size=$(du -sh release-files/ | cut -f1)

          echo ""
          echo "📊 发布统计:"
          echo "  📁 文件数量: $file_count"
          echo "  💾 总大小: $total_size"
          echo "  🎯 构建环境: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}"

          if [ $file_count -eq 0 ]; then
            echo "❌ 没有找到可发布的文件"
            exit 1
          fi

      # 生成Release说明
      - name: 生成Release说明
        run: |
          ENV_LABEL=""
          case "${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}" in
            "DEV")
              ENV_LABEL=" (开发版)"
              ;;
            "SIT")
              ENV_LABEL=" (测试版)"
              ;;
            "DEMO")
              ENV_LABEL=" (演示版)"
              ;;
            "PROD")
              ENV_LABEL=""
              ;;
          esac

          cat > release_notes.md << 'RELEASE_EOF'
          ## 🚀 $APP_NAME v${{ steps.version.outputs.version }}$ENV_LABEL

          > **构建环境**: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}  
          > **构建时间**: $(date)

          ### 📦 支持平台

          **🪟 Windows (x64)**
          - NSIS安装程序 (推荐) - 双击安装，支持自动更新
          - 便携版本 - 绿色版，无需安装

          **🍎 macOS**
          - Intel Mac (x64) - 支持macOS 10.15+
          - Apple Silicon (ARM64) - 原生M系列芯片支持

          **🐧 Linux (x64)**
          - AppImage - 通用便携版本，适用于所有发行版
          - Debian/Ubuntu (.deb) - 系统包管理器安装

          ### 🔄 自动更新

          ✅ 应用内置自动更新功能  
          ✅ 安装后会自动检测新版本  
          ✅ 支持增量更新，节省下载时间  

          ### 🛠️ 技术信息

          - **Electron**: 28.2.4
          - **TypeScript**: 5.9.2
          - **Node.js**: 20.x  
          - **构建平台**: GitHub Actions
          - **构建环境**: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}

          ---

          **🔗 相关链接**
          - [📖 源代码](https://github.com/${{ github.repository }})
          - [🐛 问题反馈](https://github.com/${{ github.repository }}/issues)
          - [📝 更新日志](https://github.com/${{ github.repository }}/releases)
RELEASE_EOF

      # 创建Release
      - name: 创建GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.version.outputs.tag }}
          name: "🎉 $APP_NAME v${{ steps.version.outputs.version }} [${{ steps.parse_env.outputs.BUILD_ENVIRONMENT }}]"
          body_path: release_notes.md
          draft: false
          prerelease: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT != 'PROD' }}
          files: release-files/*
          make_latest: ${{ steps.parse_env.outputs.BUILD_ENVIRONMENT == 'PROD' }}
          generate_release_notes: true
          fail_on_unmatched_files: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # 清理工件
  cleanup:
    name: 清理临时文件
    needs: [build, release]
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: 清理构建工件
        uses: geekyeggo/delete-artifact@v5
        with:
          name: |
            Windows-*-v${{ github.run_number }}
            macOS-*-v${{ github.run_number }}
            Linux-*-v${{ github.run_number }}
        continue-on-error: true

      - name: 清理完成
        run: echo "🧹 临时文件清理完成"
EOF

    print_success "GitHub Actions工作流创建完成"
}

# 创建其他必要文件
create_other_files() {
    print_info "创建其他必要文件..."
    
    # 创建.gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Build outputs
dist/
release/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*.sublime-project
*.sublime-workspace

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Electron specific
app/dist/
app/release/
app/node_modules/
*.asar

# MacOS specific for Electron
*.dmg
*.pkg

# Windows specific for Electron
*.exe
*.msi

# Linux specific for Electron
*.AppImage
*.deb
*.rpm
*.snap

# Auto-generated files
*.d.ts.map
*.js.map
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

# 发布到GitHub
npm run publish
\`\`\`

## 🚀 快速发布

1. 设置GitHub Token:
\`\`\`bash
export GITHUB_TOKEN=your_github_token_here
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
    cat > assets/README.md << EOF
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
1. 设置GitHub Token: export GITHUB_TOKEN=your_token
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
    echo "     export GITHUB_TOKEN=your_token_here"
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
    echo "   - 请在 assets/ 目录中添加应用图标"
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