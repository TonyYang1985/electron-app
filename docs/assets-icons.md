# 图标文件说明

## 📁 图标文件结构

```
assets/
├── mol.ico                     # Windows 图标 (生产环境)
├── mol.icns                    # macOS 图标 (生产环境)
├── mol.png                     # Linux 图标 (生产环境)
├── mol-DEMO.ico                # Windows 图标 (DEMO环境)
├── mol-DEMO.icns               # macOS 图标 (DEMO环境)
├── mol-DEV.ico                 # Windows 图标 (开发环境)
├── mol-DEV.icns                # macOS 图标 (开发环境)
├── mol-SIT.ico                 # Windows 图标 (SIT环境)
├── mol-SIT.icns                # macOS 图标 (SIT环境)
├── mol-UAT.ico                 # Windows 图标 (UAT环境)
├── mol-UAT.icns                # macOS 图标 (UAT环境)
├── loading.gif                 # Windows 加载动画
└── splash.bmp                  # 便携版启动画面
```

## 🎨 图标规格要求

### Windows 图标 (.ico)
- **格式**: ICO
- **包含尺寸**: 16x16, 32x32, 48x48, 256x256 像素
- **颜色深度**: 32位 (支持透明度)
- **用途**: 应用程序图标、任务栏图标

### macOS 图标 (.icns)
- **格式**: ICNS
- **包含尺寸**: 16x16 到 1024x1024 像素 (多种尺寸)
- **颜色深度**: 32位 (支持透明度)
- **用途**: 应用程序图标、Dock图标

### Linux 图标 (.png)
- **格式**: PNG
- **尺寸**: 256x256 像素
- **颜色深度**: 32位 (支持透明度)
- **用途**: 应用程序图标

## 🔧 图标制作工具

### 在线工具
- [IcoConverter](https://www.icoconverter.com/) - 免费PNG转ICO
- [AppIcon](https://appicon.co/) - 专业应用图标生成器
- [Canva](https://www.canva.com/) - 在线图标设计

### 桌面工具
- **macOS**: Icon Composer, Image2icon
- **Windows**: IcoFX, Greenfish Icon Editor
- **跨平台**: GIMP, Photoshop

## 🚀 快速创建图标

### 方法1: 使用现有PNG图片
```bash
# 1. 准备一张 1024x1024 的PNG图片
# 2. 使用在线工具转换:
#    - 上传PNG到 https://www.icoconverter.com/
#    - 下载生成的ICO文件
#    - 重命名为对应的环境图标名称
```

### 方法2: 批量生成
```bash
# 使用ImageMagick (需要安装)
convert icon-source.png -resize 256x256 mol.png
convert icon-source.png mol.ico
```

## 📋 环境图标映射

| 环境 | Windows图标 | macOS图标 | 说明 |
|------|-------------|-----------|------|
| PROD | `mol.ico` | `mol.icns` | 生产环境，使用标准图标 |
| LOCAL | `mol-DEV.ico` | `mol-DEV.icns` | 本地开发，使用DEV图标 |
| DEV | `mol-DEV.ico` | `mol-DEV.icns` | 开发环境 |
| SIT | `mol-SIT.ico` | `mol-SIT.icns` | 系统集成测试 |
| UAT | `mol-UAT.ico` | `mol-UAT.icns` | 用户验收测试 |
| DEMO | `mol-DEMO.ico` | `mol-DEMO.icns` | 演示环境 |

## ⚠️ 注意事项

### 图标缺失处理
- 如果图标文件不存在，应用仍可正常构建
- 会使用 Electron 默认图标
- 建议为每个环境准备对应图标以便区分

### 图标更新
- 修改图标后需要重新构建应用
- 开发模式下图标更改需要重启应用
- 图标文件建议使用版本控制管理

### 性能优化
- 图标文件不宜过大 (建议单个文件 < 1MB)
- ICO文件包含多个尺寸时，只包含必要尺寸
- PNG图标使用适当的压缩级别
