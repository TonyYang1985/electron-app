# Electron Microframework 文档

一个基于加载器模式的轻量级 Electron 微框架，提供模块化、可扩展的桌面应用开发解决方案。

## 🚀 核心特性

- **模块化架构**: 基于加载器模式，支持按需加载功能模块
- **链式配置**: 流畅的 API 设计，支持链式调用配置
- **开箱即用**: 提供常用功能的默认实现
- **高度可扩展**: 支持自定义加载器扩展框架功能
- **TypeScript 支持**: 完整的类型定义和智能提示
- **企业级特性**: 包含单实例保护、自动更新、主题系统等

## 📦 安装

```bash
npm install electron
npm install electron-updater  # 如果需要自动更新功能
```

## 🏗️ 核心架构

### 类型定义

```typescript
// 框架配置接口
interface ElectronMicroframeworkSettings {
  isDev?: boolean;
  window?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  };
  app?: {
    name?: string;
    version?: string;
    protocol?: string;
  };
  showBootstrapTime?: boolean;
}

// 加载器接口
interface ElectronMicroframeworkLoader {
  name: string;
  load(settings: ElectronMicroframeworkSettings): Promise<void> | void;
}

// 全局上下文
interface ElectronContext {
  mainWindow: BrowserWindow | null;
  settings: ElectronMicroframeworkSettings;
}
```

### 核心类：ElectronMicroframeworkBootstrap

框架的主要引导类，负责管理加载器链和应用启动流程。

```typescript
class ElectronMicroframeworkBootstrap {
  constructor(settings?: ElectronMicroframeworkSettings)
  use(loader: ElectronMicroframeworkLoader): this
  bootstrap(): Promise<ElectronMicroframework>
}
```

## 🎯 快速开始

### 方式1: 使用预配置的 bootstrap 函数（推荐）

```typescript
import { bootstrapMicroframework } from './bootstrap';

bootstrapMicroframework({
  app: {
    name: 'my-awesome-app',
    version: '2.0.1',
    protocol: 'my-awesome-app'
  },
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },
  showBootstrapTime: true
}).catch((e) => {
  console.error(e);
  process.exit(-1);
});
```

### 方式2: 使用链式注册（精确控制）

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

### 方式3: 完全自定义加载器链

```typescript
const framework = new ElectronMicroframeworkBootstrap({
  app: { name: 'custom-app' },
  showBootstrapTime: true
});

framework
  .use(new SingleInstanceLoader())
  .use(new WindowLoader({ theme: 'light' }))
  .use(new CustomDatabaseLoader())
  .use(new CustomThemeLoader())
  .use(new AutoUpdaterLoader({ silent: true }))
  .bootstrap()
  .catch((e) => {
    console.error(e);
    process.exit(-1);
  });
```

## 🔧 内置加载器

### 1. SingleInstanceLoader - 单实例保护

确保应用只运行一个实例，重复启动时会聚焦到现有窗口。

```typescript
new SingleInstanceLoader()
```

**功能特性:**
- 自动获取单实例锁
- 检测到第二个实例时聚焦现有窗口
- 支持自定义协议客户端设置
- 生产环境下自动设置默认协议处理

### 2. WindowLoader - 窗口管理

负责创建和管理主窗口，提供丰富的窗口配置选项。

```typescript
interface WindowLoaderOptions {
  theme?: 'light' | 'dark';
  devTools?: boolean;
  customPreload?: string;
  webSecurity?: boolean;
}

new WindowLoader({
  theme: 'dark',
  devTools: true,
  webSecurity: false
})
```

**功能特性:**
- 安全的窗口配置（默认禁用 nodeIntegration）
- 防止导航到外部链接
- 兼容多版本 Electron API
- 支持自定义预加载脚本
- 自动显示开发者工具（开发模式）

### 3. AppEventsLoader - 应用事件处理

处理应用级别的事件和进程信号。

```typescript
new AppEventsLoader()
```

**功能特性:**
- macOS 特定行为处理
- 优雅的进程退出处理
- 未处理异常捕获
- SIGINT/SIGTERM 信号处理

### 4. AutoUpdaterLoader - 自动更新

基于 electron-updater 的自动更新功能。

```typescript
interface AutoUpdaterLoaderOptions {
  checkInterval?: number;
  silent?: boolean;
  autoDownload?: boolean;
  allowPrerelease?: boolean;
}

new AutoUpdaterLoader({
  silent: false,
  checkInterval: 5000,
  allowPrerelease: false,
  autoDownload: true
})
```

**功能特性:**
- 自动检查更新
- 下载进度显示
- 用户交互式更新确认
- 静默更新模式
- 开发模式跳过更新检查

### 5. DatabaseLoader - 数据库连接

提供数据库连接和初始化功能。

```typescript
interface DatabaseLoaderOptions {
  type?: 'sqlite' | 'mysql' | 'postgresql';
  host?: string;
  port?: number;
  database?: string;
  synchronize?: boolean;
  logging?: boolean;
}

new DatabaseLoader({
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'myapp_db',
  synchronize: true,
  logging: true
})
```

**功能特性:**
- 多数据库类型支持
- 开发/生产环境区分配置
- 数据库结构同步
- 连接状态管理

### 6. ThemeLoader - 主题系统

提供完整的主题管理功能。

```typescript
interface ThemeLoaderOptions {
  theme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  customCSS?: string;
  allowUserChange?: boolean;
}

new ThemeLoader({
  theme: 'auto',
  accentColor: '#0078d4',
  allowUserChange: true,
  customCSS: `
    .app-header { background: var(--accent-color); }
    .sidebar { border-right: 1px solid var(--border-color); }
  `
})
```

**功能特性:**
- 系统主题自动跟随
- 自定义强调色
- CSS 变量注入
- 主题变更监听
- 动态主题切换

### 7. MenuLoader - 菜单系统

创建和管理应用程序菜单。

```typescript
interface MenuLoaderOptions {
  template?: MenuItemConstructorOptions[];
  showDeveloperMenu?: boolean;
  customMenus?: { [key: string]: MenuItemConstructorOptions[] };
}

new MenuLoader({
  showDeveloperMenu: true,
  customMenus: {
    tools: [
      { label: '数据导出', accelerator: 'CmdOrCtrl+E', click: () => {} },
      { label: '数据导入', accelerator: 'CmdOrCtrl+I', click: () => {} }
    ]
  }
})
```

**功能特性:**
- 默认菜单模板
- 开发者菜单自动添加
- 自定义菜单项
- 快捷键支持
- 多平台兼容

### 8. TrayLoader - 系统托盘

添加系统托盘功能。

```typescript
interface TrayLoaderOptions {
  iconPath?: string;
  tooltip?: string;
  contextMenu?: MenuItemConstructorOptions[];
  clickBehavior?: 'show' | 'hide' | 'toggle' | 'none';
}

new TrayLoader({
  tooltip: 'My App - 运行中',
  clickBehavior: 'toggle',
  contextMenu: [
    { label: '显示主窗口', click: () => {} },
    { label: '快速操作', submenu: [/* ... */] },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]
})
```

**功能特性:**
- 自定义托盘图标
- 上下文菜单
- 点击行为配置
- 窗口显示/隐藏控制

## 📋 配置选项

### ElectronMicroframeworkSettings

```typescript
interface ElectronMicroframeworkSettings {
  // 是否为开发模式（默认：process.env.NODE_ENV === 'development'）
  isDev?: boolean;
  
  // 窗口配置
  window?: {
    width?: number;        // 默认：1200
    height?: number;       // 默认：800
    minWidth?: number;     // 默认：800
    minHeight?: number;    // 默认：600
  };
  
  // 应用配置
  app?: {
    name?: string;         // 默认：'electron-app'
    version?: string;      // 默认：'1.0.0'
    protocol?: string;     // 默认：'electron-app'
  };
  
  // 是否显示启动时间（默认：开发模式下为 true）
  showBootstrapTime?: boolean;
}
```

## 🎨 高级用法

### 企业级应用完整配置

```typescript
import {
  ElectronMicroframeworkBootstrap,
  SingleInstanceLoader,
  WindowLoader,
  AppEventsLoader,
  AutoUpdaterLoader
} from './bootstrap';
import { DatabaseLoader } from './loaders/DatabaseLoader';
import { ThemeLoader } from './loaders/ThemeLoader';
import { MenuLoader } from './loaders/MenuLoader';
import { TrayLoader } from './loaders/TrayLoader';

const framework = new ElectronMicroframeworkBootstrap({
  app: {
    name: 'Enterprise App',
    version: '2.1.0',
    protocol: 'enterprise-app'
  },
  window: {
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800
  },
  showBootstrapTime: true
});

framework
  .use(new SingleInstanceLoader())
  .use(new DatabaseLoader({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'enterprise_db',
    synchronize: true,
    logging: process.env.NODE_ENV === 'development'
  }))
  .use(new ThemeLoader({
    theme: 'auto',
    accentColor: '#0078d4',
    allowUserChange: true,
    customCSS: `
      .app-header { background: var(--accent-color); }
      .sidebar { border-right: 1px solid var(--border-color); }
    `
  }))
  .use(new WindowLoader({
    theme: 'dark',
    devTools: process.env.NODE_ENV === 'development',
    webSecurity: process.env.NODE_ENV === 'production'
  }))
  .use(new MenuLoader({
    showDeveloperMenu: true,
    customMenus: {
      tools: [
        { label: '数据导出', accelerator: 'CmdOrCtrl+E', click: () => {} },
        { label: '数据导入', accelerator: 'CmdOrCtrl+I', click: () => {} }
      ]
    }
  }))
  .use(new TrayLoader({
    tooltip: 'Enterprise App - 运行中',
    clickBehavior: 'toggle',
    contextMenu: [
      { label: '显示主窗口', click: () => {} },
      { label: '快速操作', submenu: [
        { label: '新建项目', click: () => {} },
        { label: '打开最近', click: () => {} }
      ]},
      { type: 'separator' },
      { label: '退出', click: () => require('electron').app.quit() }
    ]
  }))
  .use(new AppEventsLoader())
  .use(new AutoUpdaterLoader({
    silent: false,
    checkInterval: 30000,
    allowPrerelease: false,
    autoDownload: true
  }))
  .bootstrap()
  .catch((e) => {
    console.error('💥 企业应用启动失败:', e);
    process.exit(-1);
  });
```

### 插件化应用示例

```typescript
const framework = new ElectronMicroframeworkBootstrap({
  app: { name: 'Plugin App', version: '1.0.0' },
  showBootstrapTime: true
});

// 核心功能
framework
  .use(new SingleInstanceLoader())
  .use(new WindowLoader({ theme: 'light' }))
  .use(new AppEventsLoader());

// 根据配置动态加载插件
const config = {
  enableDatabase: true,
  enableTheme: true,
  enableTray: false,
  enableAutoUpdate: true
};

if (config.enableDatabase) {
  framework.use(new DatabaseLoader({ type: 'sqlite' }));
}

if (config.enableTheme) {
  framework.use(new ThemeLoader({ theme: 'auto' }));
}

if (config.enableTray) {
  framework.use(new TrayLoader());
}

if (config.enableAutoUpdate) {
  framework.use(new AutoUpdaterLoader({ silent: true }));
}

framework.bootstrap();
```

## 🔌 自定义加载器

### 创建自定义加载器

```typescript
import { ElectronMicroframeworkLoader, ElectronMicroframeworkSettings } from '../types';

export class CustomLoader implements ElectronMicroframeworkLoader {
  name = 'CustomLoader';
  
  constructor(private options: any = {}) {}

  async load(settings: ElectronMicroframeworkSettings): Promise<void> {
    console.log(`🔧 初始化 ${this.name}...`);
    
    try {
      // 执行自定义初始化逻辑
      await this.initializeCustomFeature(settings);
      
      // 保存状态到全局上下文
      const context = (global as any).electronContext;
      if (context) {
        context.customFeature = {
          initialized: true,
          options: this.options
        };
      }
      
      console.log(`✅ ${this.name} 初始化完成`);
    } catch (error) {
      console.error(`❌ ${this.name} 初始化失败:`, error);
      throw error;
    }
  }
  
  private async initializeCustomFeature(settings: ElectronMicroframeworkSettings): Promise<void> {
    // 自定义初始化逻辑
  }
}
```

### 使用自定义加载器

```typescript
framework
  .use(new SingleInstanceLoader())
  .use(new CustomLoader({ option1: 'value1' }))
  .use(new WindowLoader())
  .bootstrap();
```

## 🛠️ 实用工具函数

### 获取框架实例和上下文

```typescript
import { getFramework, getElectronContext } from './bootstrap';

// 获取框架实例
const framework = getFramework();
const mainWindow = framework?.getMainWindow();

// 获取 Electron 上下文
const context = getElectronContext();
if (context?.mainWindow) {
  context.mainWindow.focus();
}
```

## 📝 最佳实践

### 1. 加载器顺序

推荐的加载器顺序：
1. `SingleInstanceLoader` - 最先执行，确保单实例
2. `DatabaseLoader` - 早期初始化数据连接
3. `ThemeLoader` - 在窗口创建前设置主题
4. `WindowLoader` - 创建主窗口
5. `MenuLoader` - 窗口创建后设置菜单
6. `TrayLoader` - 设置系统托盘
7. `AppEventsLoader` - 设置应用事件处理
8. `AutoUpdaterLoader` - 最后检查更新

### 2. 错误处理

```typescript
framework
  .bootstrap()
  .then((mfmk) => {
    console.log('🎉 应用启动成功');
  })
  .catch((error) => {
    console.error('💥 应用启动失败:', error);
    
    // 记录错误到日志文件
    // 发送错误报告
    // 显示用户友好的错误信息
    
    process.exit(-1);
  });
```

### 3. 环境区分

```typescript
const isDev = process.env.NODE_ENV === 'development';

const framework = new ElectronMicroframeworkBootstrap({
  isDev,
  showBootstrapTime: isDev,
  window: {
    width: isDev ? 1400 : 1200,
    height: isDev ? 900 : 800
  }
});
```

## 🚨 注意事项

1. **安全性**: 默认配置已禁用 `nodeIntegration` 和 `enableRemoteModule`
2. **兼容性**: 框架兼容多版本 Electron API
3. **性能**: 加载器按需初始化，避免不必要的资源消耗
4. **内存管理**: 应用退出时会自动清理全局上下文
5. **调试**: 开发模式下会显示详细的启动日志

## 📚 API 参考

### ElectronMicroframeworkBootstrap

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `constructor` | `settings?: ElectronMicroframeworkSettings` | - | 创建框架实例 |
| `use` | `loader: ElectronMicroframeworkLoader` | `this` | 注册加载器（链式调用） |
| `bootstrap` | - | `Promise<ElectronMicroframework>` | 启动框架 |

### ElectronMicroframework

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `settings` | `ElectronMicroframeworkSettings` | 框架配置 |
| `context` | `ElectronContext` | 全局上下文 |
| `getMainWindow()` | `() => BrowserWindow \| null` | 获取主窗口实例 |
| `getContext()` | `() => ElectronContext` | 获取全局上下文 |

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-updater 文档](https://github.com/electron-userland/electron-updater)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs)