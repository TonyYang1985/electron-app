import {
  shell,
  BrowserWindow,
  Menu,
  MenuItem,
  BrowserWindowConstructorOptions,
} from "electron";
import * as log from "electron-log";
import { MO_IS_PROD } from "./constants";

// 类型定义
interface NewWindowEvent {
  preventDefault(): void;
  newGuest?: BrowserWindow;
}

// 窗口变量
let imWin: BrowserWindow | null = null;
let previewWin: BrowserWindow | null = null;

// 右键菜单 - 兼容 Electron 28.x
const contextMenu: Menu = new Menu();
contextMenu.append(
  new MenuItem({
    role: "toggleDevTools", // 注意：Electron 28.x 中是 toggleDevTools 而不是 toggledevtools
    label: "开发者工具",
  })
);

// 添加其他开发者选项
if (MO_IS_PROD !== true) {
  contextMenu.append(new MenuItem({ type: "separator" }));
  contextMenu.append(
    new MenuItem({
      role: "reload",
      label: "重新加载",
    })
  );
  contextMenu.append(
    new MenuItem({
      role: "forceReload",
      label: "强制重新加载",
    })
  );
}

/**
 * 在浏览器或新窗口中打开链接
 * @param event Electron 新窗口事件
 * @param url 要打开的URL
 * @param frameName 框架名称（可选）
 * @param disposition 窗口处理方式（可选）
 * @param options 窗口选项（可选）
 * @param _additionalFeatures 附加特性（可选）
 */
export function openLinksInBrowser(
  event: NewWindowEvent,
  url: string,
  frameName?: string,
  disposition?:
    | "default"
    | "foreground-tab"
    | "background-tab"
    | "new-window"
    | "save-to-disk"
    | "other",
  options?: BrowserWindowConstructorOptions,
  _additionalFeatures?: string
): void {
  event.preventDefault();

  try {
    log.info("处理链接打开请求:", { url, frameName, disposition });

    if (url.includes("/#/SNP/")) {
      handleIMWindow(url);
    } else if (url.includes("/preview/#/")) {
      handlePreviewWindow(event, url, options);
    } else {
      handleExternalLink(url);
    }
  } catch (error) {
    log.error("打开链接失败:", error);
    // 降级处理：在外部浏览器中打开
    shell
      .openExternal(url)
      .catch((err) => log.error("外部浏览器打开也失败:", err));
  }
}

/**
 * 处理IM聊天窗口
 */
function handleIMWindow(url: string): void {
  log.info("创建IM聊天窗口:", url);

  // 销毁现有窗口
  if (imWin && !imWin.isDestroyed()) {
    log.debug("销毁现有IM窗口");
    imWin.destroy();
    imWin = null;
  }

  // 创建新窗口 - Electron 28.x 兼容配置
  const windowOptions: BrowserWindowConstructorOptions = {
    width: 800,
    height: 600,
    minWidth: 450,
    minHeight: 450,
    title: "IM Chat",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
    // Electron 28.x 新增的安全选项
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  };

  imWin = new BrowserWindow(windowOptions);

  // 开发环境右键菜单 - Electron 28.x 兼容写法
  if (MO_IS_PROD !== true) {
    imWin.webContents.on("context-menu", (_event, params) => {
      if (imWin && !imWin.isDestroyed()) {
        // Electron 28.x 的正确 popup 调用方式
        contextMenu.popup({
          window: imWin,
          x: params.x,
          y: params.y,
        });
      }
    });
  }

  // 防止标题更新
  imWin.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  // 窗口准备好后显示
  imWin.once("ready-to-show", () => {
    if (imWin && !imWin.isDestroyed()) {
      log.debug("IM窗口准备就绪，显示窗口");
      imWin.show();
      imWin.focus();
    }
  });

  // 窗口关闭事件
  imWin.on("closed", () => {
    log.debug("IM窗口已关闭");
    imWin = null;
  });

  // 错误处理
  imWin.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      log.error("IM窗口加载失败:", { errorCode, errorDescription });
    }
  );

  // 设置菜单和加载 URL
  imWin.setMenu(null);

  // Electron 28.x 推荐的加载方式
  imWin
    .loadURL(url, {
      userAgent: "Mozilla/5.0 (compatible; ElectronApp)",
    })
    .catch((error) => {
      log.error("加载IM窗口失败:", error);
    });
}

/**
 * 处理预览窗口
 */
function handlePreviewWindow(
  event: NewWindowEvent,
  url: string,
  options?: BrowserWindowConstructorOptions
): void {
  log.info("创建预览窗口:", url);

  // 销毁现有窗口
  if (previewWin && !previewWin.isDestroyed()) {
    log.debug("销毁现有预览窗口");
    previewWin.destroy();
    previewWin = null;
  }

  // 合并窗口选项 - Electron 28.x 兼容
  const windowOptions: BrowserWindowConstructorOptions = {
    width: 1000,
    height: 700,
    ...options,
    minWidth: 450,
    minHeight: 450,
    title: "Preview",
    show: false,
    webPreferences: {
      ...options?.webPreferences,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  };

  previewWin = new BrowserWindow(windowOptions);

  // 防止标题更新
  previewWin.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  // 窗口准备好后显示
  previewWin.once("ready-to-show", () => {
    if (previewWin && !previewWin.isDestroyed()) {
      log.debug("预览窗口准备就绪，显示窗口");
      previewWin.show();
      previewWin.focus();
    }
  });

  // 窗口关闭事件
  previewWin.on("closed", () => {
    log.debug("预览窗口已关闭");
    previewWin = null;
  });

  // 错误处理
  previewWin.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      log.error("预览窗口加载失败:", { errorCode, errorDescription });
    }
  );

  previewWin.setMenu(null);

  // 加载URL
  previewWin
    .loadURL(url, {
      userAgent: "Mozilla/5.0 (compatible; ElectronApp)",
    })
    .catch((error) => {
      log.error("加载预览窗口失败:", error);
    });

  // 设置新窗口到事件对象
  event.newGuest = previewWin;
}

/**
 * 处理外部链接 - Electron 28.x 兼容
 */
function handleExternalLink(url: string): void {
  log.info("在外部浏览器中打开链接:", url);

  // Electron 28.x 中 shell.openExternal 的选项
  shell
    .openExternal(url, {
      activate: true, // 激活外部应用
    })
    .then(() => {
      log.info("外部链接打开成功:", url);
    })
    .catch((error) => {
      log.error("打开外部链接失败:", error);
    });
}

/**
 * 清理所有窗口
 */
export function cleanupWindows(): void {
  log.info("开始清理所有窗口");

  const windows = [
    { window: imWin, name: "IM" },
    { window: previewWin, name: "预览" },
  ];

  windows.forEach(({ window, name }) => {
    if (window && !window.isDestroyed()) {
      log.debug(`关闭${name}窗口`);
      window.close();
    }
  });

  // 清空引用
  imWin = null;
  previewWin = null;

  log.info("窗口清理完成");
}

/**
 * 获取当前活动窗口状态
 */
/**
 * 获取当前活动窗口状态
 */
export function getWindowsStatus(): {
  imActive: boolean;
  previewActive: boolean;
  totalActive: number;
  windows: Array<{ type: string; id?: number; title?: string }>;
} {
  const windows: Array<{ type: string; id?: number; title?: string }> = [];

  // 明确转换为 boolean 类型
  const imActive: boolean = !!(imWin && !imWin.isDestroyed());
  const previewActive: boolean = !!(previewWin && !previewWin.isDestroyed());

  if (imActive && imWin) {
    windows.push({
      type: "IM",
      id: imWin.id,
      title: imWin.getTitle(),
    });
  }

  if (previewActive && previewWin) {
    windows.push({
      type: "Preview",
      id: previewWin.id,
      title: previewWin.getTitle(),
    });
  }

  return {
    imActive,
    previewActive,
    totalActive: windows.length,
    windows,
  };
}

/**
 * 强制关闭所有窗口（紧急情况使用）
 */
export function forceCloseAllWindows(): void {
  log.warn("执行强制关闭所有窗口");

  const windows = [imWin, previewWin];

  windows.forEach((window) => {
    if (window && !window.isDestroyed()) {
      try {
        window.destroy();
      } catch (error) {
        log.error("强制关闭窗口时出错:", error);
      }
    }
  });

  imWin = null;
  previewWin = null;
}

/**
 * 获取指定类型的窗口实例
 */
export function getWindow(type: "im" | "preview"): BrowserWindow | null {
  switch (type) {
    case "im":
      return imWin && !imWin.isDestroyed() ? imWin : null;
    case "preview":
      return previewWin && !previewWin.isDestroyed() ? previewWin : null;
    default:
      return null;
  }
}

/**
 * 检查 Electron 版本兼容性
 */
export function checkElectronCompatibility(): {
  version: string;
  isCompatible: boolean;
  warnings: string[];
} {
  const version = process.versions.electron;
  const majorVersion = parseInt(version.split(".")[0]);
  const warnings: string[] = [];

  let isCompatible = true;

  if (majorVersion < 20) {
    isCompatible = false;
    warnings.push("Electron 版本过低，建议升级到 20.0 或更高版本");
  }

  if (majorVersion >= 30) {
    warnings.push("使用较新的 Electron 版本，请注意 API 变更");
  }

  return {
    version,
    isCompatible,
    warnings,
  };
}

// 默认导出
export default {
  openLinksInBrowser,
  cleanupWindows,
  getWindowsStatus,
  forceCloseAllWindows,
  getWindow,
  checkElectronCompatibility,
};
