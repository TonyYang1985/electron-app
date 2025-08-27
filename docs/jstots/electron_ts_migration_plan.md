# Electron App TypeScript 迁移计划

## 项目概述

将现有的 **My Awesome App** 从 JavaScript 架构迁移到基于 TypeScript 的微框架架构，采用加载器模式实现模块化、可扩展的企业级 Electron 应用。

## 迁移目标

- ✅ **完整 TypeScript 支持** - 类型安全与智能提示
- ✅ **微框架架构** - 基于加载器模式的模块化设计
- ✅ **链式 API** - 流畅的配置和扩展方式
- ✅ **企业级特性** - 单实例、自动更新、主题系统等
- ✅ **开箱即用** - 提供常用功能的默认实现
- ✅ **高度可扩展** - 支持自定义加载器

## 新项目结构

```
electron-app/
├── .gitignore
├── README.md
├── package.json                    # 更新的项目配置
├── package-lock.json
├── tsconfig.json                   # TypeScript 配置
├── electron-builder.json          # 动态生成
├── assets/                         # 静态资源 (保持不变)
│   ├── mol-*.icns/ico              # 各环境图标
│   └── splash.png
├── build/                          # 构建资源 (保持不变)
├── env/                            # 环境配置 (保持不变)
├── static/                         # 前端资源 (保持不变)
├── renderer/                       # 渲染进程 (保持不变)
│   └── notifications.js
├── src/                            # TypeScript 源码目录
│   ├── main.ts                     # 主入口文件
│   ├── core/                       # 核心框架
│   │   ├── bootstrap.ts            # 启动器核心类
│   │   ├── interfaces/             # 接口定义
│   │   │   ├── loader.interface.ts
│   │   │   ├── config.interface.ts
│   │   │   └── window.interface.ts
│   │   └── types/                  # 类型定义
│   │       ├── app.types.ts
│   │       └── index.ts
│   ├── loaders/                    # 加载器模块
│   │   ├── index.ts                # 导出所有加载器
│   │   ├── single-instance.loader.ts
│   │   ├── window.loader.ts
│   │   ├── app-events.loader.ts
│   │   ├── auto-updater.loader.ts
│   │   ├── menu.loader.ts
│   │   ├── store.loader.ts
│   │   ├── logger.loader.ts
│   │   └── serve.loader.ts
│   │
│   ├── services/                   # 服务类
│   │   ├── window.service.ts
│   │   ├── updater.service.ts
│   │   ├── store.service.ts
│   │   ├── logger.service.ts
│   │   └── serve.service.ts
│   │
│   ├── utils/                      # 工具类 (TypeScript 化)
│   │   ├── constants.ts
│   │   ├── platform.ts
│   │   ├── version.ts
│   │   ├── folder.ts
│   │   ├── redirect.ts
│   │   └── index.ts
│   │
│   ├── scripts/                    # 构建脚本 (TypeScript 化)
│   │   └── start.ts
│   │
│   └── windows/                    # 窗口相关
│       ├── main-window.ts
│       ├── splash-window.ts
│       ├── preload.ts
│       └── splash.html
│
└── release/                        # 编译输出目录
    ├── main.js
    ├── index.html
    └── ... (编译后的文件)
```

## 阶段性迁移计划

### 阶段 1: 基础设施准备 (1-2 天)

#### 1.1 TypeScript 环境配置

**创建 `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./release",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "release",
    "static",
    "build"
  ]
}
```

**更新 `package.json` scripts:**
```json
{
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
  }
}
```

#### 1.2 创建核心接口和类型

**`src/core/interfaces/loader.interface.ts`:**
```typescript
export interface ILoader {
  name: string;
  load(): Promise<void> | void;
  unload?(): Promise<void> | void;
  priority?: number;
}

export interface LoaderConstructor {
  new(...args: any[]): ILoader;
}
```

**`src/core/interfaces/config.interface.ts`:**
```typescript
export interface IAppConfig {
  name: string;
  version: string;
  staticVersion?: string;
  environment?: string;
}

export interface IWindowConfig {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  webPreferences?: Electron.WebPreferences;
  theme?: 'light' | 'dark' | 'system';
  devTools?: boolean;
  webSecurity?: boolean;
}

export interface IFrameworkConfig {
  app: IAppConfig;
  window?: IWindowConfig;
  showBootstrapTime?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
```

### 阶段 2: 核心框架开发 (3-4 天)

#### 2.1 创建启动器核心类

**`src/core/bootstrap.ts`:**
```typescript
import { app } from 'electron';
import { ILoader, IFrameworkConfig } from './interfaces';
import { Logger } from '../services/logger.service';

export class ElectronMicroframeworkBootstrap {
  private loaders: ILoader[] = [];
  private config: IFrameworkConfig;
  private logger: Logger;
  private startTime: number;

  constructor(config: IFrameworkConfig) {
    this.config = config;
    this.logger = new Logger(config.logLevel || 'info');
    this.startTime = Date.now();
  }

  /**
   * 注册加载器 (支持链式调用)
   */
  use(loader: ILoader): this {
    this.loaders.push(loader);
    return this;
  }

  /**
   * 批量注册加载器
   */
  useMany(loaders: ILoader[]): this {
    this.loaders.push(...loaders);
    return this;
  }

  /**
   * 启动框架
   */
  async bootstrap(): Promise<void> {
    try {
      this.logger.info(`🚀 Starting ${this.config.app.name} v${this.config.app.version}`);
      
      // 按优先级排序加载器
      this.sortLoadersByPriority();
      
      // 等待 Electron 就绪
      await app.whenReady();
      
      // 逐个加载加载器
      for (const loader of this.loaders) {
        await this.loadSingleLoader(loader);
      }

      if (this.config.showBootstrapTime) {
        const bootTime = Date.now() - this.startTime;
        this.logger.info(`✅ Framework bootstrapped in ${bootTime}ms`);
      }
      
    } catch (error) {
      this.logger.error('❌ Failed to bootstrap framework:', error);
      throw error;
    }
  }

  /**
   * 获取配置
   */
  getConfig(): IFrameworkConfig {
    return this.config;
  }

  /**
   * 获取已注册的加载器
   */
  getLoaders(): ILoader[] {
    return [...this.loaders];
  }

  private async loadSingleLoader(loader: ILoader): Promise<void> {
    try {
      this.logger.debug(`Loading ${loader.name}...`);
      await loader.load();
      this.logger.debug(`✅ ${loader.name} loaded successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to load ${loader.name}:`, error);
      throw error;
    }
  }

  private sortLoadersByPriority(): void {
    this.loaders.sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }
}
```

#### 2.2 创建核心服务类

**`src/services/logger.service.ts`:**
```typescript
import * as electronLog from 'electron-log';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export class Logger {
  private log = electronLog;

  constructor(level: LogLevel = 'info') {
    this.log.transports.console.level = level;
    this.log.transports.file.level = level;
  }

  error(message: string, ...args: any[]): void {
    this.log.error(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log.warn(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log.info(message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log.debug(message, ...args);
  }
}
```

### 阶段 3: 加载器模块开发 (4-5 天)

#### 3.1 单实例加载器

**`src/loaders/single-instance.loader.ts`:**
```typescript
import { app } from 'electron';
import { ILoader } from '../core/interfaces';

export class SingleInstanceLoader implements ILoader {
  name = 'SingleInstanceLoader';
  priority = 10; // 高优先级

  load(): void {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      // 当第二个实例启动时，聚焦到主窗口
      // 这里可以通过事件系统通知窗口服务
      app.emit('focus-main-window');
    });
  }
}
```

#### 3.2 窗口加载器

**`src/loaders/window.loader.ts`:**
```typescript
import { ILoader, IWindowConfig } from '../core/interfaces';
import { WindowService } from '../services/window.service';

export interface WindowLoaderOptions extends IWindowConfig {
  // 扩展选项
}

export class WindowLoader implements ILoader {
  name = 'WindowLoader';
  priority = 50;

  private windowService: WindowService;
  private options: WindowLoaderOptions;

  constructor(options: WindowLoaderOptions = {}) {
    this.options = options;
    this.windowService = new WindowService(options);
  }

  async load(): Promise<void> {
    await this.windowService.createMainWindow();
    this.setupWindowEvents();
  }

  private setupWindowEvents(): void {
    // 设置窗口相关事件监听
  }
}
```

#### 3.3 自动更新加载器

**`src/loaders/auto-updater.loader.ts`:**
```typescript
import { ILoader } from '../core/interfaces';
import { UpdaterService } from '../services/updater.service';

export interface AutoUpdaterOptions {
  silent?: boolean;
  checkInterval?: number;
  allowPrerelease?: boolean;
  updateUrl?: string;
}

export class AutoUpdaterLoader implements ILoader {
  name = 'AutoUpdaterLoader';
  priority = 80;

  private updaterService: UpdaterService;
  private options: AutoUpdaterOptions;

  constructor(options: AutoUpdaterOptions = {}) {
    this.options = {
      silent: false,
      checkInterval: 60000, // 1分钟
      allowPrerelease: false,
      ...options
    };
    this.updaterService = new UpdaterService(this.options);
  }

  async load(): Promise<void> {
    await this.updaterService.initialize();
    
    if (!this.options.silent) {
      this.setupUpdateEvents();
    }
  }

  private setupUpdateEvents(): void {
    // 设置更新事件监听
  }
}
```

### 阶段 4: 服务类迁移 (3-4 天)

#### 4.1 窗口服务

**`src/services/window.service.ts`:**
```typescript
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { IWindowConfig } from '../core/interfaces';

export class WindowService {
  private mainWindow: BrowserWindow | null = null;
  private splashWindow: BrowserWindow | null = null;
  private config: IWindowConfig;

  constructor(config: IWindowConfig) {
    this.config = {
      width: 1400,
      height: 900,
      theme: 'system',
      devTools: false,
      webSecurity: true,
      ...config
    };
  }

  async createMainWindow(): Promise<BrowserWindow> {
    // 先创建启动画面
    await this.createSplashWindow();

    // 创建主窗口
    this.mainWindow = new BrowserWindow({
      width: this.config.width,
      height: this.config.height,
      minWidth: this.config.minWidth,
      minHeight: this.config.minHeight,
      show: false, // 初始隐藏
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: this.config.webSecurity,
        preload: path.join(__dirname, '../windows/preload.js'),
        ...this.config.webPreferences
      }
    });

    // 加载页面
    await this.loadMainContent();

    // 页面加载完成后显示主窗口，隐藏启动画面
    this.mainWindow.once('ready-to-show', () => {
      this.showMainWindow();
      this.closeSplashWindow();
    });

    this.setupMainWindowEvents();

    return this.mainWindow;
  }

  private async createSplashWindow(): Promise<void> {
    this.splashWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await this.splashWindow.loadFile(path.join(__dirname, '../windows/splash.html'));
  }

  private async loadMainContent(): Promise<void> {
    const isDev = process.argv.includes('--dev');
    
    if (isDev) {
      // 开发模式加载本地服务
      await this.mainWindow?.loadURL('http://localhost:3000');
      this.config.devTools && this.mainWindow?.webContents.openDevTools();
    } else {
      // 生产模式加载静态文件
      await this.mainWindow?.loadFile(path.join(__dirname, '../static/index.html'));
    }
  }

  private showMainWindow(): void {
    this.mainWindow?.show();
    this.mainWindow?.focus();
  }

  private closeSplashWindow(): void {
    if (this.splashWindow) {
      this.splashWindow.close();
      this.splashWindow = null;
    }
  }

  private setupMainWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 处理单实例聚焦
    require('electron').app.on('focus-main-window', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
      }
    });
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getSplashWindow(): BrowserWindow | null {
    return this.splashWindow;
  }
}
```

### 阶段 5: 主入口迁移 (1-2 天)

#### 5.1 新的主入口文件

**`src/main.ts`:**
```typescript
import { ElectronMicroframeworkBootstrap } from './core/bootstrap';
import {
  SingleInstanceLoader,
  WindowLoader,
  AppEventsLoader,
  AutoUpdaterLoader,
  MenuLoader,
  StoreLoader,
  LoggerLoader,
  ServeLoader
} from './loaders';

// 从配置文件读取环境配置
const config = require('../config.json');

const framework = new ElectronMicroframeworkBootstrap({
  app: {
    name: config.app?.name || 'my-awesome-app',
    version: config.app?.version || '2.0.1',
    staticVersion: config.app?.staticVersion,
    environment: process.env.API_ENV || 'LOCAL'
  },
  window: {
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    theme: 'dark',
    devTools: process.argv.includes('--dev'),
    webSecurity: process.env.NODE_ENV === 'production'
  },
  showBootstrapTime: true,
  logLevel: process.argv.includes('--dev') ? 'debug' : 'info'
});

// 注册核心加载器
framework
  .use(new SingleInstanceLoader())
  .use(new LoggerLoader())
  .use(new StoreLoader())
  .use(new ServeLoader())
  .use(new WindowLoader({ 
    theme: 'dark',
    devTools: process.argv.includes('--dev'),
    webSecurity: process.env.NODE_ENV === 'production'
  }))
  .use(new MenuLoader())
  .use(new AppEventsLoader())
  .use(new AutoUpdaterLoader({ 
    silent: false,
    checkInterval: 60000,
    allowPrerelease: false 
  }));

// 启动应用
framework
  .bootstrap()
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(-1);
  });
```

### 阶段 6: 工具类迁移 (2-3 天)

#### 6.1 平台工具类

**`src/utils/platform.ts`:**
```typescript
import { platform } from 'os';

export type PlatformType = 'windows' | 'macos' | 'linux' | 'unknown';

export class Platform {
  private static _current: PlatformType;

  static get current(): PlatformType {
    if (!this._current) {
      const p = platform();
      switch (p) {
        case 'win32':
          this._current = 'windows';
          break;
        case 'darwin':
          this._current = 'macos';
          break;
        case 'linux':
          this._current = 'linux';
          break;
        default:
          this._current = 'unknown';
      }
    }
    return this._current;
  }

  static get isWindows(): boolean {
    return this.current === 'windows';
  }

  static get isMacOS(): boolean {
    return this.current === 'macos';
  }

  static get isLinux(): boolean {
    return this.current === 'linux';
  }
}
```

### 阶段 7: 测试和优化 (2-3 天)

#### 7.1 创建测试配置

**创建简单的测试脚本验证迁移成功:**

```typescript
// src/test/bootstrap.test.ts
import { ElectronMicroframeworkBootstrap } from '../core/bootstrap';
import { SingleInstanceLoader } from '../loaders';

describe('Bootstrap', () => {
  test('should create framework instance', () => {
    const framework = new ElectronMicroframeworkBootstrap({
      app: { name: 'test-app', version: '1.0.0' }
    });
    
    expect(framework).toBeDefined();
  });

  test('should register loaders', () => {
    const framework = new ElectronMicroframeworkBootstrap({
      app: { name: 'test-app', version: '1.0.0' }
    });
    
    framework.use(new SingleInstanceLoader());
    
    expect(framework.getLoaders()).toHaveLength(1);
  });
});
```

## 迁移检查清单

### 基础设施
- [ ] TypeScript 配置完成
- [ ] 构建脚本更新
- [ ] 依赖包安装和配置

### 核心框架
- [ ] 启动器类完成
- [ ] 接口定义完成
- [ ] 类型定义完成

### 加载器模块
- [ ] SingleInstanceLoader
- [ ] WindowLoader  
- [ ] AppEventsLoader
- [ ] AutoUpdaterLoader
- [ ] MenuLoader
- [ ] StoreLoader
- [ ] LoggerLoader
- [ ] ServeLoader

### 服务类
- [ ] WindowService
- [ ] UpdaterService
- [ ] StoreService
- [ ] LoggerService
- [ ] ServeService

### 工具类
- [ ] Platform 工具
- [ ] Version 工具
- [ ] Folder 工具
- [ ] Constants 工具

### 测试验证
- [ ] 开发环境测试
- [ ] 生产构建测试
- [ ] 各平台兼容性测试
- [ ] 功能完整性验证

## 风险评估和缓解策略

### 主要风险
1. **兼容性问题**: 新架构可能与现有功能不兼容
2. **性能影响**: 加载器模式可能带来性能开销
3. **迁移复杂度**: 大量代码需要重构

### 缓解策略
1. **渐进式迁移**: 分阶段进行，每个阶段都确保系统可用
2. **向后兼容**: 保持现有 API 的兼容性
3. **充分测试**: 每个阶段都进行完整的功能测试
4. **回滚计划**: 准备回滚到之前版本的方案

## 预期效果

迁移完成后，项目将获得以下优势：

1. **类型安全**: TypeScript 提供编译时类型检查
2. **更好的开发体验**: 智能提示和代码补全
3. **模块化架构**: 基于加载器的可扩展设计
4. **企业级特性**: 完整的日志、更新、存储等功能
5. **维护性提升**: 清晰的代码结构和职责分离
6. **扩展性增强**: 可以轻松添加新功能模块

## 时间线

- **第1-2天**: 基础设施准备
- **第3-6天**: 核心框架开发  
- **第7-11天**: 加载器模块开发
- **第12-15天**: 服务类迁移
- **第16-17天**: 主入口迁移
- **第18-20天**: 工具类迁移
- **第21-23天**: 测试和优化

**预计总时间**: 约 3-4 周

这个迁移计划将帮助你将现有的 Electron 应用升级为现代化的 TypeScript 微框架架构，提供更好的开发体验和维护性。