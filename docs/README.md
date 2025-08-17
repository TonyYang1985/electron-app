# BMO Middle Office App - 文档中心

## 📚 文档导航

### 🚀 快速开始
- [项目结构说明](./project_structure.md) - 项目目录和文件结构
- [启动流程解析](./startup_flow_explanation.md) - 应用启动机制详解

### 🔧 开发指南
- [开发者模式解决方案](./developer_mode_solution.md) - Windows开发环境配置
- [管理员权限解决方案](./admin_solution_guide.md) - 权限问题处理

### 📦 构建与部署
- [构建资源说明](./build-resources.md) - 构建所需的资源文件
- [发布流程指南](./release_process_guide.md) - 完整的应用发布流程
- [图标创建指南](./create_simple_icons.txt) - 应用图标制作方法
- [图标文件](./README.md) - 图标文件说明

### ⚙️ 配置详解
- [Electron Forge 详细流程](./electron_forge_detailed_process.md) - Forge 启动机制
- [Forge 配置文件解析](./forge_config_detailed_analysis.md) - forge.config.js 详解
- [GitHub Secrets 设置](./github_secrets_guide.md) - CI/CD 配置指南

## 🏗️ 项目概览

**BMO Middle Office App** 是基于 Electron + Ant Design Pro 构建的跨平台桌面应用，支持多环境部署和自动更新。

### 核心特性
- 🌐 **跨平台支持** - Windows、macOS、Linux
- 🔄 **多环境配置** - LOCAL、DEV、SIT、UAT、PROD、DEMO
- 📱 **现代化界面** - 基于 Ant Design Pro
- 🚀 **自动更新** - 支持增量更新和热更新
- 🔒 **代码签名** - 支持 Windows 和 macOS 代码签名

### 技术栈
- **桌面框架**: Electron v28+
- **前端框架**: React + Ant Design Pro
- **构建工具**: Electron Forge + Electron Builder
- **包管理**: Yarn
- **CI/CD**: GitHub Actions

## 🎯 快速开始

### 环境要求
- Node.js 18+
- Yarn 1.22+
- Git

### 安装依赖
```bash
yarn install
```

### 开发模式
```bash
# DEMO 环境
yarn config:DEMO && yarn start

# 本地开发环境
yarn config:LOCAL && yarn start
```

### 构建应用
```bash
# 生成配置并构建
npm run config:ts:DEMO
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 📋 环境配置

| 环境 | 用途 | 配置文件 | 图标 |
|------|------|----------|------|
| LOCAL | 本地开发 | `env/LOCAL.json` | mol-DEV |
| DEV | 开发测试 | `env/DEV.json` | mol-DEV |
| SIT | 系统集成测试 | `env/SIT.json` | mol-SIT |
| UAT | 用户验收测试 | `env/UAT.json` | mol-UAT |
| PROD | 生产环境 | `env/PROD.json` | mol |
| DEMO | 演示环境 | `env/DEMO.json` | mol-DEMO |

## 🔗 相关链接

- [GitHub Repository](https://github.com/TonyYang1985/electron-app)
- [Issues](https://github.com/TonyYang1985/electron-app/issues)
- [Releases](https://github.com/TonyYang1985/electron-app/releases)

## 📞 支持

如有问题，请查看相关文档或提交 Issue。
