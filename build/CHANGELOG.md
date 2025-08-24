# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 待添加的新功能

### Changed
- 待修改的功能

### Fixed
- 待修复的问题

## [1.0.78] - 2025-01-XX

### Fixed
- 修复了 electron-builder NSIS 脚本语言冲突问题
- 优化了安装程序的多语言支持
- 改进了卸载程序的用户数据清理功能

### Changed
- 更新了 NSIS 脚本为 installer.nsh 格式
- 简化了 electron-builder 配置
- 移除了冲突的语言定义

## [1.0.76] - 2025-01-XX

### Added
- 添加了自定义 NSIS 安装脚本
- 支持安装/卸载时检查应用程序运行状态
- 增加了用户数据清理选项

### Fixed
- 修复了安装程序构建失败的问题

## [1.0.0] - 2025-01-XX

### Added
- 初始版本发布
- 基于 Electron 28.2.4 构建
- 支持 Windows、macOS、Linux 平台
- 集成自动更新功能
- 支持多环境配置（LOCAL、DEV、SIT、UAT、PROD、DEMO）
- 内置 MinIO 文件存储支持
- 现代化的用户界面

### Features
- 📦 跨平台桌面应用
- 🔄 自动更新机制
- 🌍 多环境配置支持
- 💾 本地数据存储
- 🎨 现代化 UI/UX
- 📝 日志记录系统
- ⚙️ 灵活的配置管理

### Technical Stack
- Electron 28.2.4
- TypeScript 5.9.2
- electron-builder 26.0.0
- electron-updater 6.6.2
- electron-store 8.1.0

---

## Version History Template

### [版本号] - YYYY-MM-DD

#### Added
- 新增功能描述

#### Changed
- 修改的功能描述

#### Deprecated
- 即将废弃的功能

#### Removed
- 移除的功能

#### Fixed
- 修复的问题

#### Security
- 安全性改进

---

## 发版说明

### 版本号规则
- 主版本号：重大架构变更或不兼容的变更
- 次版本号：新功能添加，向后兼容
- 修订版本号：问题修复，向后兼容

### 发版类型标识
- 🎉 **Major** - 重大版本发布
- ✨ **Feature** - 新功能发布
- 🐛 **Bugfix** - 问题修复
- 🔧 **Maintenance** - 维护性更新
- 📖 **Documentation** - 文档更新
- ⚡ **Performance** - 性能优化
- 🔒 **Security** - 安全修复

### 贡献者
感谢所有为此项目做出贡献的开发者！

---

*更新日期：2025-01-XX*