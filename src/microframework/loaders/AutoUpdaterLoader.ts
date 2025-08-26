import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import { dialog } from "electron";
import { ElectronMicroframeworkLoader } from "../../shared/ElectronMicroframeworkLoader";
import { ElectronMicroframeworkSettings } from "../../shared/ElectronMicroframeworkSettings";

export interface AutoUpdaterLoaderOptions {
  silent?: boolean;
  checkInterval?: number;
  allowPrerelease?: boolean;
  autoDownload?: boolean;
}

export class AutoUpdaterLoader implements ElectronMicroframeworkLoader {
  name = "AutoUpdaterLoader";

  private options: AutoUpdaterLoaderOptions;

  constructor(options: AutoUpdaterLoaderOptions = {}) {
    this.options = {
      silent: false,
      checkInterval: 3600000, // 1 hour
      allowPrerelease: false,
      ...options,
    };
  }

  load(settings: ElectronMicroframeworkSettings): void {
    if (settings.isDev) {
      console.log("🔧 开发模式：跳过自动更新功能");
      return;
    }

    console.log("🔄 配置自动更新功能...");
    this.configureAutoUpdater();
    this.setupUpdateEvents(settings);

    setTimeout(() => this.checkForUpdates(), this.options.checkInterval);
  }

  // private configureAutoUpdater(settings: ElectronMicroframeworkSettings): void {
  //   autoUpdater.logger = console;
  //   autoUpdater.autoDownload = false; // We will manually trigger download
  //   autoUpdater.allowPrerelease = this.options.allowPrerelease || false;
  // }

  private configureAutoUpdater(): void {
    autoUpdater.logger = console;
    autoUpdater.autoDownload = this.options.autoDownload ?? true;
    autoUpdater.allowPrerelease = this.options.allowPrerelease ?? false;
  }

  private setupUpdateEvents(settings: ElectronMicroframeworkSettings): void {
    autoUpdater.on("update-available", (info: UpdateInfo) =>
      this.onUpdateAvailable(info, settings)
    );
    autoUpdater.on("update-not-available", (info: UpdateInfo) =>
      this.onUpdateNotAvailable(info)
    );
    autoUpdater.on("download-progress", (progress: ProgressInfo) =>
      this.onDownloadProgress(progress)
    );
    autoUpdater.on("update-downloaded", (info: UpdateInfo) =>
      this.onUpdateDownloaded(info)
    );
    autoUpdater.on("error", (error: Error) => this.onUpdateError(error));
  }

  private checkForUpdates(): void {
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      console.error("🚨 启动更新检查时出错:", error);
    }
  }

  private async onUpdateAvailable(
    info: UpdateInfo,
    settings: ElectronMicroframeworkSettings
  ): Promise<void> {
    console.log(
      `🎉 发现新版本: ${info.version} (当前版本: ${settings.app?.version})`
    );
    if (this.options.silent) {
      autoUpdater.downloadUpdate();
      return;
    }

    const context = (global as any).electronContext;
    if (!context?.mainWindow || context.mainWindow.isDestroyed()) return;

    const { response } = await dialog.showMessageBox(context.mainWindow, {
      type: "info",
      title: "发现更新",
      message: `发现新版本 ${info.version}`,
      detail: `是否立即下载并安装更新？`,
      buttons: ["立即更新", "稍后提醒"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      console.log("✅ 用户选择立即更新, 开始下载...");
      autoUpdater.downloadUpdate();
    }
  }

  private onUpdateNotAvailable(info: UpdateInfo): void {
    console.log("✨ 当前已是最新版本:", info.version);
  }

  private onDownloadProgress(progress: ProgressInfo): void {
    const percent = Math.round(progress.percent);
    console.log(`📥 下载进度: ${percent}%`);
    const context = (global as any).electronContext;
    if (context?.mainWindow && !context.mainWindow.isDestroyed()) {
      context.mainWindow.setProgressBar(percent / 100);
    }
  }

  private async onUpdateDownloaded(info: UpdateInfo): Promise<void> {
    console.log("✅ 更新下载完成:", info.version);
    const context = (global as any).electronContext;
    if (!context?.mainWindow || context.mainWindow.isDestroyed()) return;

    context.mainWindow.setProgressBar(-1);

    const {response} = await dialog.showMessageBox(context.mainWindow, {
      type: "info",
      title: "更新已就绪",
      message: "更新已下载完成，重启应用即可安装。",
      buttons: ["立即重启", "稍后重启"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      autoUpdater.quitAndInstall(true, true);
    }
  }

  private onUpdateError(error: Error): void {
    console.error("❌ 自动更新检查失败:", error.message);
  }
}
