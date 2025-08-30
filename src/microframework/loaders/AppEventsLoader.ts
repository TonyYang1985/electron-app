import { app, BrowserWindow,ipcMain } from "electron";
import { ElectronMicroframeworkSettings } from "../../shared/ElectronMicroframeworkSettings";
import { ElectronMicroframeworkLoader } from "../../shared/ElectronMicroframeworkLoader";

export class AppEventsLoader implements ElectronMicroframeworkLoader {
  name = "AppEventsLoader";

  load(settings: ElectronMicroframeworkSettings): void {
    this.setupAppEvents();
    this.setupProcessEvents(settings);
    this.setupIpcHandlers();
  }

  private setupAppEvents(): void {
    // macOS 特定行为
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        console.log("🍎 macOS activate: 需要重新创建窗口");
        // 这里需要重新创建窗口，通常通过事件通知或回调处理
      }
    });

    // 所有窗口关闭
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // 应用退出前
    app.on("before-quit", () => {
      console.log("📴 应用即将退出...");
    });
  }

  private setupProcessEvents(settings: ElectronMicroframeworkSettings): void {
    // 优雅的进程退出处理
    process.on("SIGINT", () => {
      console.log("📶 收到 SIGINT 信号，正在关闭应用...");
      app.quit();
    });

    process.on("SIGTERM", () => {
      console.log("📶 收到 SIGTERM 信号，正在关闭应用...");
      app.quit();
    });

    // 未处理的异常
    process.on("uncaughtException", (error) => {
      console.error("💥 未捕获的异常:", error);
      if (!settings.isDev) {
        app.quit();
      }
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("🚨 未处理的 Promise 拒绝:", reason);
      console.error("Promise:", promise);
    });
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('get-version-info', () => {
      return {
        appVersion: app.getVersion(),
        electronVersion: process.versions.electron,
      };
    });
  }
}
