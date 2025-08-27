# Electron App 项目结构文档

## 项目概述

**My Awesome App** 是一个基于 Electron 28.2.4 和 TypeScript 构建的跨平台桌面应用程序，支持 Windows、macOS 和 Linux 平台。项目采用现代化的开发工具链，包含自动更新、多环境配置和 CI/CD 自动化构建发布流程。

electron-app/
├── .gitignore              # Git 忽略文件配置。
├── Info.plist              # macOS 应用信息属性列表文件，用于定义应用元数据。
├── README.md               # 项目说明文档。
├── package.json            # 项目核心配置文件。定义了项目名称、版本、依赖、以及各种构建和启动脚本。
├── package-lock.json       # 锁定项目依赖的具体版本，确保环境一致性。
├── config.json             # 动态生成的应用配置文件。由 start.js 根据环境生成，主进程会读取此文件获取配置。
├── electron-builder.json   # electron-builder 的配置文件，用于应用打包和分发。此文件由 start.js 动态生成。
├── forge.config.js         # electron-forge 的配置文件，用于开发和打包。
├── start.js                # 环境配置脚本。在启动或构建时运行，根据环境变量 (API_ENV) 生成 config.json 和 electron-builder.json。
│
├── assets/                 # 存放应用的静态资源，主要是不同环境下的图标。
│   ├── mol-DEMO.icns       # DEMO 环境的 macOS 图标。
│   ├── mol-DEMO.ico        # DEMO 环境的 Windows 图标。
│   ├── mol-DEV.icns        # DEV 环境的 macOS 图标。
│   ├── mol-DEV.ico         # DEV 环境的 Windows 图标。
│   ├── mol-SIT.icns        # SIT 环境的 macOS 图标。
│   ├── mol-SIT.ico         # SIT 环境的 Windows 图标。
│   ├── mol-UAT.icns        # UAT 环境的 macOS 图标。
│   ├── mol-UAT.ico         # UAT 环境的 Windows 图标。
│   └── mol.icns            # PROD 环境的 macOS 图标。
│   └── mol.ico             # PROD 环境的 Windows 图标。
│   └── mol.png             # 应用启动闪屏页的图片。
│   └── Removable.icns      # Removable的图片。
│   └── splash.png          # 应用启动闪屏页的图片。
│
├── build/                      # 构建过程中使用的资源。
│   ├── CHANGELOG.md            # CHANGELOG.md 文件。
│   ├── installer.nsh           # installer.nsh 文件。
│   ├── LICENSE_en-US.md        # LICENSE_en-US.md 文件。
│   ├── LICENSE_zh-CN.md        # LICENSE_zh-CN.md 文件。
│   ├── LICENSE_zh-TW.md        # LICENSE_zh-TW.md 文件。
│   ├── linux-after-install.sh  # linux-after-install.sh 文件。
│   ├── linux-after-remove.sh   # linux-after-remove.sh 文件。
│   └── icon.ico                # 当前构建环境所使用的 Windows 图标，由 start.js 从 assets/ 目录复制而来。
│
├── env/                      # 存放各个环境的特定配置。
│   ├── LOCAL.json          # 本地环境配置。
│   ├── DEV.json            # 开发环境配置。
│   ├── SIT.json            # SIT环境配置。
│   ├── UAT.json            # UAT环境配置。
│   ├── DEMO.json           # DEMO环境配置。
│   ├── PROD.json           # PROD环境配置。
│   ├── meta.json           # meta 模板配置。
│   ├── electron_builder_template.json           # electron-builder 模板配置。
│   └── common.json         # 所有环境共享的通用配置。
│
├── main/                   # Electron 主进程代码目录。
│   ├── badges.js           # 主进程入口文件。负责创建窗口、处理应用生命周期、初始化日志、菜单和更新程序。
│   ├── index.js            # 主进程入口文件。负责创建窗口、处理应用生命周期、初始化日志、菜单和更新程序。
│   ├── logger.js           # 配置和初始化日志系统 (electron-log)。
│   ├── menu.js             # 定义应用程序的顶部菜单栏。
│   ├── serve.js            # 启动本地静态服务器（Koa），用于提供前端页面。
│   ├── server.js           # 可能是另一个服务相关的文件，或与 serve.js 协同工作。
│   ├── stores.js           # 初始化和管理本地数据存储 (electron-store)。
│   ├── updaters/           # 应用更新逻辑。
│   │   ├── electron-updater.js # 使用 electron-updater 实现应用外壳的自动更新。
│   │   └── static-updater.js   # 自定义的静态资源（前端页面）更新逻辑。
│   ├── utils/              # 通用工具函数。
│   │   ├── constants.js    # 版本管理相关的工具函数。
│   │   ├── folder.js       # 文件夹管理相关的工具函数。
│   │   ├── platform.js     # 判断当前操作系统平台（如 macOS, Windows）。
│   │   ├── redirect.js     # 路由跳转管理相关的工具函数。
│   │   ├── util.js         # 工具函数。
│   │   └── version.js      # 版本管理相关的工具函数。
│   └── windows/            # 窗口管理。
│       ├── index.js        # index。
│       ├── main-window.js  # 创建和管理主应用窗口。
│       ├── splash-window.js# 创建和管理应用启动时的闪屏窗口。
│       ├── preload.js      # 预加载脚本，在渲染进程中运行，用于安全地将 Node.js API 暴露给前端。
│       └── splash.html     # 闪屏窗口加载的 HTML 文件。
│
├── renderer/               # 渲染进程（前端页面）的辅助脚本。
│   └── notifications.js    # 可能用于处理桌面通知。
│
└── static/                 # 存放编译打包后的前端应用（由 UmiJS 生成）。
    ├── index.html          # 前端应用的入口 HTML。
    ├── umi.js              # UmiJS 框架的核心 JS 文件。
    ├── umi.css             # 全局 CSS 文件。
    ├── vendors.async.js    # 第三方库的 JS 文件。
    ├── layouts__*.js       # 页面布局相关的 JS 文件。
    └── ... (其他编译后的前端资源)



**核心脚本**:

```json
{
  "name": "my-awesome-app",
  "version": "2.0.1",
  "staticVersion": "1.7.16",
  "minio": "http://minio.bm.bwoilmarine.com",
  "description": "基于Electron构建的桌面应用",
  "main": "release/main.js",
  "homepage": "https://github.com/TonyYang1985/electron-app",
  "author": {
    "name": "TonyYang1985",
    "email": "yangxindev@gmail.com",
    "url": "https://github.com/TonyYang1985"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/TonyYang1985/electron-app.git"
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
    "build:win": "npm run config:ts:PROD && npm run clean && npm ci && npm run build && electron-builder --win",
    "build:mac": "npm run config:ts:PROD && npm run clean && npm ci && npm run build && electron-builder --mac",
    "build:linux": "npm run config:ts:PROD && npm run clean && npm ci && npm run build && electron-builder --linux"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.8.3",
    "@electron-forge/shared-types": "^7.8.3",
    "@electron/notarize": "^2.5.0",
    "@types/electron": "^1.6.12",
    "@types/node": "^20.0.0",
    "@types/semver": "^7.7.0",
    "@types/underscore": "^1.13.0",
    "cpy-cli": "^5.0.0",
    "cross-env": "^7.0.3",
    "electron": "^28.2.4",
    "electron-builder": "^26.0.0",
    "fs-extra": "^11.3.1",
    "shx": "^0.3.4",
    "tsx": "^4.20.4",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "app-builder-lib": "^25.0.0",
    "cross-env": "^7.0.3",
    "crypto": "^1.0.1",
    "electron": "^28.2.4",
    "electron-builder": "^26.0.0",
    "electron-fetch": "^1.9.1",
    "electron-log": "^5.4.1",
    "electron-osx-sign": "^0.6.0",
    "electron-squirrel-startup": "^1.0.1",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.6.2",
    "extract-zip": "^2.0.1",
    "fs-extra": "^11.3.1",
    "mkdirp": "^3.0.1",
    "semver": "^7.7.2",
    "underscore": "^1.13.7"
  }
}

```

本文档旨在为 `electron-app` 制作 TypeScript 迁移计划 和详细开发路线图。


## 迁移要求

- **模块化架构**: 基于加载器模式，支持按需加载功能模块
- **链式配置**: 流畅的 API 设计，支持链式调用配置
- **开箱即用**: 提供常用功能的默认实现
- **高度可扩展**: 支持自定义加载器扩展框架功能
- **TypeScript 支持**: 完整的类型定义和智能提示
- **企业级特性**: 包含单实例保护、自动更新、主题系统等
- **main目录下**: 使用链式加载器注册

### 方式: 使用链式注册（精确控制）

```typescript
import {
  ElectronMicroframeworkBootstrap,
  SingleInstanceLoader,
  WindowLoader,
  AppEventsLoader,
  AutoUpdaterLoader
} from './bootstrap';

const framework = new ElectronMicroframeworkBootstrap({
  app: {
    name: 'my-awesome-app',
    version: '2.0.1'
  },
  window: {
    width: 1400,
    height: 900
  },
  showBootstrapTime: true
});

framework
  .use(new SingleInstanceLoader())
  .use(new WindowLoader({ 
    theme: 'dark',
    devTools: true,
    webSecurity: false 
  }))
  .use(new AppEventsLoader())
  .use(new AutoUpdaterLoader({ 
    silent: false,
    checkInterval: 5000,
    allowPrerelease: false 
  }))
  .bootstrap()
  .catch((e) => {
    console.error(e);
    process.exit(-1);
  });
```
