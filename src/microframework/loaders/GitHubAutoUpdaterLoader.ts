import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import { dialog } from "electron";
import { ElectronMicroframeworkLoader } from "../../shared/ElectronMicroframeworkLoader";
import { ElectronMicroframeworkSettings } from "../../shared/ElectronMicroframeworkSettings";
import { AutoUpdaterLoaderOptions } from "./AutoUpdaterLoader";
import { prerelease, gt } from 'semver';

export class GitHubAutoUpdaterLoader implements ElectronMicroframeworkLoader {
  name = "GitHubAutoUpdaterLoader";

  private options: AutoUpdaterLoaderOptions;

  constructor(options: AutoUpdaterLoaderOptions = {}) {
    this.options = {
      silent: false,
      checkInterval: 3600000, // 1 hour
      allowPrerelease: true, // 
      autoDownload: true,
      ...options,
    };
  }

  load(settings: ElectronMicroframeworkSettings): void {
    if (settings.isDev) {
      console.log("");
      return;
    }

    console.log("");
    this.configureAutoUpdater();
    this.setupUpdateEvents(settings);

    setTimeout(() => this.checkForUpdates(), this.options.checkInterval);
  }

  private configureAutoUpdater(): void {
    // GitHub 
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'TonyYang1985',
      repo: 'electron-app',
    });

    autoUpdater.logger = console;
    autoUpdater.autoDownload = this.options.autoDownload ?? true;
    autoUpdater.allowPrerelease = this.options.allowPrerelease ?? true; // 
    
    // GitHub 
    autoUpdater.allowDowngrade = false;
    autoUpdater.forceDevUpdateConfig = false;
    
    // GitHub API 
    if (process.env.GITHUB_TOKEN) {
      autoUpdater.requestHeaders = {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      };
    }
    
    console.log("");
    console.log(`  Repository: TonyYang1985/electron-app`);
    console.log(`  allowPrerelease: ${autoUpdater.allowPrerelease}`);
    console.log(`  autoDownload: ${autoUpdater.autoDownload}`);
    console.log(`  GitHub Token: ${process.env.GITHUB_TOKEN ? ' ' : ' '}`);
  }

  private setupUpdateEvents(settings: ElectronMicroframeworkSettings): void {
    // 
    autoUpdater.on("checking-for-update", () => {
      console.log("");
      console.log(``);
    });

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
      console.log("checkForUpdates start");
      autoUpdater.checkForUpdates();
    } catch (error) {
      console.error("checkForUpdates error");
      console.error(`  : ${error}`);
    }
  }

  private async onUpdateAvailable(
    info: UpdateInfo,
    settings: ElectronMicroframeworkSettings
  ): Promise<void> {
    const currentVersion = settings.app?.version || '0.0.0';
    const newVersion = info.version;
    const isPrerelease = prerelease(newVersion) !== null;

    console.log("");
    console.log(`  : ${currentVersion}`);
    console.log(`  : ${newVersion}`);
    console.log(`  Release : https://github.com/TonyYang1985/electron-app/releases/tag/v${newVersion}`);
    console.log(`  : ${isPrerelease || false}`);
    console.log(`  : ${info.releaseDate}`);
    
    // 
    if (info.files && info.files.length > 0) {
      console.log("");
      info.files.forEach(file => {
        console.log(`  - ${file.url} (${this.formatBytes(file.size ?? 0)})`);
      });
    }

    // 
    const isNewer = gt(newVersion, currentVersion);
    console.log(`  : ${isNewer ? ' ' : ' '}`);
    
    if (!isNewer) {
      console.warn("");
      return;
    }

    // 
    if (isPrerelease && !this.options.allowPrerelease) {
      console.log("isPrerelease",isPrerelease);
      return;
    }

    if (this.options.silent) {
      autoUpdater.downloadUpdate();
      return;
    }

    await this.showUpdateDialog(info, settings);
  }

  private onUpdateNotAvailable(info: UpdateInfo): void {
    console.log("✨ GitHub 当前已是最新版本:", info.version);
  }

  private onDownloadProgress(progress: ProgressInfo): void {
    const percent = Math.round(progress.percent);
    console.log(` : ${percent}%`);
    const context = (global as any).electronContext;
    if (context?.mainWindow && !context.mainWindow.isDestroyed()) {
      context.mainWindow.setProgressBar(percent / 100);
    }
  }

  private async onUpdateDownloaded(info: UpdateInfo): Promise<void> {
    console.log("✅ GitHub 更新下载完成:", info.version);
    const context = (global as any).electronContext;
    if (!context?.mainWindow || context.mainWindow.isDestroyed()) return;

    context.mainWindow.setProgressBar(-1);

    const { response } = await dialog.showMessageBox(context.mainWindow, {
      type: "info",
      title: "GitHub 更新已就绪",
      message: "GitHub 更新已下载完成，重启应用即可安装。",
      buttons: ["立即重启", "稍后重启"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      autoUpdater.quitAndInstall(true, true);
    }
  }

  private onUpdateError(error: Error): void {
    console.error("");
    console.error(`  : ${error.message}`);
    
    // GitHub 
    const message = error.message.toLowerCase();
    
    if (message.includes('api rate limit')) {
      console.error("");
      console.error("   ");
      console.error("   : https://github.com/settings/tokens");
    } else if (message.includes('404') || message.includes('not found')) {
      console.error("");
      console.error("   : https://github.com/TonyYang1985/electron-app/releases");
    } else if (message.includes('network') || message.includes('timeout')) {
      console.error("");
      console.error("   GitHub ");
      console.error("   ");
    } else if (message.includes('forbidden') || message.includes('403')) {
      console.error("");
      console.error("   Repository ");
      console.error("   ");
    }
    
    // 
    this.suggestFallbackOptions();
  }

  private async showUpdateDialog(info: UpdateInfo, settings: ElectronMicroframeworkSettings): Promise<void> {
    const context = (global as any).electronContext;
    if (!context?.mainWindow || context.mainWindow.isDestroyed()) {
      autoUpdater.downloadUpdate();
      return;
    }
    
    const newVersion = info.version;
    const isPrerelease = prerelease(newVersion) !== null;
    const releaseUrl = `https://github.com/TonyYang1985/electron-app/releases/tag/v${info.version}`;
    
    const { response } = await dialog.showMessageBox(context.mainWindow, {
      type: "info",
      title: "",
      message: ` ${info.version}${isPrerelease ? ' ' : ''}`,
      detail: ` : ${settings.app?.version}\n : ${info.version}\n\n : ${releaseUrl}\n\n ?`,
      buttons: ["", "", ""],
      defaultId: 0,
      cancelId: 2,
    });

    switch (response) {
      case 0:
        console.log("");
        autoUpdater.downloadUpdate();
        break;
      case 1:
        console.log("");
        require('electron').shell.openExternal(releaseUrl);
        break;
      default:
        console.log("");
    }
  }

  private suggestFallbackOptions(): void {
    console.log("");
    console.log("1. : https://github.com/TonyYang1985/electron-app/releases");
    console.log("2. ");
    console.log("3. ");
    console.log("4. ");
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}