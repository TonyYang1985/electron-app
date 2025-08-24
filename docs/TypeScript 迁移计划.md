# bmo-react-mo 主进程 TypeScript 迁移计划

本文档旨在为 `bmo-react-mo` 项目的 Electron 主进程（`main` 目录）迁移到 TypeScript 提供一个为期 8 周的详细开发路线图。

---

### **第一阶段：基础建设与工具集迁移 (第 1 - 2 周)**

*   **第一周：环境搭建与验证**
    *   **任务**:
        1.  **安装依赖**: 安装 `typescript` 及所有必要的 `@types/*` 包。
        2.  **配置 `tsconfig.json`**: 创建并配置用于主进程代码编译的 `tsconfig.json`。
        3.  **更新构建脚本**: 修改 `package.json`，在启动和打包前加入 `tsc` 编译步骤。
        4.  **首次迁移**: 将 `main/utils/platform.js` 迁移至 `platform.ts` 并验证工作流。
    *   **目标**: 搭建并验证主进程的 TypeScript 编译与构建环境。

*   **第二周：核心工具 (`utils`) 迁移**
    *   **任务**:
        1.  迁移 `main/utils/constants.js` 和 `main/utils/util.js`。
        2.  协同迁移 `main/utils/folder.js` 和 `main/utils/version.js`，处理文件系统和版本比较逻辑。
    *   **目标**: 完成所有底层工具函数的类型化。

---

### **第二阶段：核心服务与窗口管理 (第 3 - 5 周)**

*   **第三周：核心服务迁移**
    *   **任务**:
        1.  迁移日志服务 `main/logger.js`。
        2.  迁移持久化数据存储 `main/stores.js`。
        3.  迁移自定义协议处理器 `main/serve.js`。
    *   **目标**: 完成应用核心服务的类型化。

*   **第四周：窗口管理 (`windows`) 迁移**
    *   **任务**:
        1.  迁移 `main/windows/main-window.js` 和 `main/windows/splash-window.js`。
        2.  迁移链接重定向逻辑 `main/utils/redirect.js`。
        3.  迁移窗口模块入口 `main/windows/index.js`。
    *   **目标**: 实现对所有应用窗口创建和管理的类型安全。

*   **第五周：应用主入口 (`index.js`) 迁移**
    *   **任务**:
        1.  将主入口文件 `main/index.js` 迁移到 `index.ts`。
        2.  为 Electron `app` 的生命周期事件添加类型。
        3.  确保所有模块在主入口中被正确引入和调用。
    *   **目标**: 完成主进程核心逻辑的迁移。

---

### **第三阶段：复杂模块与 IPC 重构 (第 6 - 7 周)**

*   **第六周：更新器 (`updaters`) 迁移**
    *   **任务**:
        1.  迁移静态资源更新器 `main/updaters/static-updater.js`。
        2.  迁移应用本身更新器 `main/updaters/electron-updater.js`。
    *   **目标**: 保证应用两种更新流程的稳定性和类型安全。

*   **第七周：废弃 `remote` 模块与 IPC 重构**
    *   **任务**:
        1.  重构 `main/windows/preload.js`，使用 `contextBridge` 和 `ipcRenderer/ipcMain` 替代 `remote` 模块。
        2.  重构 `main/badges.js`，移除 `remote` 模块，改为通过 IPC 通信更新角标。
        3.  迁移应用菜单 `main/menu.js`。
    *   **目标**: 消除安全隐患，建立现代化的进程间通信机制。

---

### **第四阶段：强化与收尾 (第 8 周)**

*   **第八周：严格模式与清理**
    *   **任务**:
        1.  在 `tsconfig.json` 中启用 `"strict": true`。
        2.  解决所有因严格模式产生的类型错误。
        3.  清理项目中所有遗留的 `.js` 源文件和编译产物。
        4.  进行全面的功能回归测试并更新项目文档。
    *   **目标**: 交付一个高质量、类型严格、代码整洁的 Electron 主进程代码库。
