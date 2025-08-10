# my-awesome-app

基于Electron构建的跨平台桌面应用。

## 📦 下载安装

访问 [Releases页面](https://github.com/TonyYang1985/my-awesome-app/releases) 下载最新版本。

### Windows
- 下载 `my-awesome-app-Setup-x.x.x.exe` 安装程序版本
- 或下载便携版本直接运行

### macOS  
- 下载 `my-awesome-app-x.x.x.dmg` 文件
- 双击安装到应用程序文件夹

### Linux
- 下载 `my-awesome-app-x.x.x.AppImage` 文件
- 添加执行权限并运行

## ✨ 特性

- 🚀 快速启动和响应
- 🔄 自动更新功能
- 🌍 跨平台支持
- 🎨 现代化界面设计

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/TonyYang1985/my-awesome-app.git

# 安装依赖
npm install

# 开发模式
npm start

# 构建应用
npm run build

# 发布到GitHub Releases
npm run publish
```

## 🚀 快速发布

1. 设置GitHub Token:
```bash
export GH_TOKEN=your_github_token_here
```

2. 构建并发布:
```bash
npm run publish
```

3. 或使用标签自动发布:
```bash
git tag v1.0.1
git push origin v1.0.1
```
4. 方法一：推送标签触发:
```bash
git tag v1.0.1
git push origin v1.0.1
```
5. 方法二：手动触发:
```bash
打开GitHub仓库
点击 Actions 标签
选择 构建和发布 工作流
点击 Run workflow
输入版本号，点击 Run workflow
```

## 📝 许可证

MIT License
