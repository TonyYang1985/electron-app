# BMO-MO-APP 启动流程解析

## 🔄 完整启动链条

```
用户执行命令 → start.js 配置生成 → electron-forge 启动 → main/index.js 应用入口
```

## 1️⃣ start.js 的作用 - 配置生成器

### 核心职责
- **环境配置生成**：根据 API_ENV 创