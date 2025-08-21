# my-awesome-app

基于Electron构建的跨平台桌面应用。

## 下载安装

访问 [Releases页面](https://github.com/TonyYang1985/electron-app/releases) 下载最新版本。

### Windows

- 下载 `electron-app-Setup-x.x.x.exe` 安装程序版本
- 或下载便携版本直接运行

### macOS  

- 下载 `electron-app-x.x.x.dmg` 文件
- 双击安装到应用程序文件夹

### Linux

- 下载 `electron-app-x.x.x.AppImage` 文件
- 添加执行权限并运行

## 特性

- 快速启动和响应
- 自动更新功能
- 跨平台支持
- 现代化界面设计

## 开发

```bash
# 克隆项目
git clone https://github.com/TonyYang1985/electron-app.git

# 安装依赖
npm install

# 开发模式
npm start

# 构建应用
npm run build

# 构建当前平台
npm run build:all

# 构建特定平台
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux

# 发布到GitHub Releases
npm run publish
```

### 目录结构

- `src/` - TypeScript 源码
- `release/` - TypeScript 编译输出
- `dist/` - Electron 最终打包输出

## 快速发布

1. 设置GitHub Token:

```bash
export GITHUB_TOKEN=your_github_token_here
```

2. 构建并发布:

```bash
npm run publish
```

3. 方法一：推送标签触发自动发布:

```bash
git tag v1.0.55
git push origin v1.0.55

git tag -d v1.0.13
git push origin --delete v1.0.13


# 开发环境（忽略大小写）
git tag v1.0.44-dev    # ✅
git tag v1.0.44-DEV    # ✅
git tag v1.0.44-Dev    # ✅

# 测试环境
git tag v1.0.44-sit    # ✅
git tag v1.0.44-SIT    # ✅

# 演示环境
git tag v1.0.44-demo   # ✅
git tag v1.0.44-DEMO   # ✅

# 生产环境
git tag v1.0.44-prod   # ✅
git tag v1.0.44        # ✅ (默认PROD)
```

 4. 方法二：手动触发发布:

```bash
打开GitHub仓库
点击 Actions 标签
选择 构建和发布 工作流
点击 Run workflow
输入版本号，点击 Run workflow
```

## 时机顺序问题 (最关键)

1. yarn config:LOCAL          # 生成 config.json
2. electron-forge 启动        # 读取 forge.config.js
3. forge.config.js 执行        # require('./config.json')
4. Electron 进程启动           # 使用配置启动
5. Application 初始化          # 应用运行时
你的项目实际依赖链：

yarn start
    ↓
yarn config:LOCAL (执行 start.js)
    ↓  
生成 config.json, icon.ico, electron-builder.json
    ↓
electron-forge start  
    ↓
读取 forge.config.js
    ↓
forge.config.js require('./config.json')  // ← 关键依赖点
    ↓
启动 Electron
    ↓
执行 main/index.js

## 许可证

MIT License
