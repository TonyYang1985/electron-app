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
      allowPrerelease: true, // 👈 关键：允许预发布版本
      autoDownload: true,
      ...options,
    };
  }

  load(settings: ElectronMicroframeworkSettings): void {
    if (settings.isDev) {
      console.log("🔧 开发模式：跳过 GitHub 自动更新功能");
      return;
    }

    console.log("🔄 配置 GitHub 自动更新功能...");
    this.configureAutoUpdater();
    this.setupUpdateEvents(settings);

    setTimeout(() => this.checkForUpdates(), this.options.checkInterval);
  }

  private configureAutoUpdater(): void {
    // GitHub 专用配置
    autoUpdater.logger = console;
    autoUpdater.autoDownload = this.options.autoDownload ?? true;
    autoUpdater.allowPrerelease = this.options.allowPrerelease ?? true; // 👈 关键
    
    // 设置 GitHub 特定选项
    autoUpdater.allowDowngrade = false;
    autoUpdater.forceDevUpdateConfig = false;
    
    // GitHub API 配置
    if (process.env.GITHUB_TOKEN) {
      autoUpdater.requestHeaders = {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      };
    }
    
    console.log("🔧 GitHub AutoUpdater 配置:");
    console.log(`  Repository: TonyYang1985/electron-app`);
    console.log(`  allowPrerelease: ${autoUpdater.allowPrerelease}`);
    console.log(`  autoDownload: ${autoUpdater.autoDownload}`);
    console.log(`  GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ 已配置' : '❌ 未配置'}`);
  }

  private setupUpdateEvents(settings: ElectronMicroframeworkSettings): void {
    // 检查更新开始
    autoUpdater.on("checking-for-update", () => {
      console.log("🔍 正在从 GitHub 检查更新...");
      console.log(`🔍 检查地址: https://api.github.com/repos/TonyYang1985/electron-app/releases`);
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
      console.log("🔍 开始从 GitHub 检查更新...");
      autoUpdater.checkForUpdates();
    } catch (error) {
      console.error("🚨 启动 GitHub 更新检查时出错:", error);
    }
  }

  private async onUpdateAvailable(
    info: UpdateInfo,
    settings: ElectronMicroframeworkSettings
  ): Promise<void> {
    const currentVersion = settings.app?.version || '0.0.0';
    const newVersion = info.version;
    const isPrerelease = prerelease(newVersion) !== null;

    console.log("🎉 在 GitHub 发现新版本!");
    console.log(`  当前版本: ${currentVersion}`);
    console.log(`  新版本: ${newVersion}`);
    console.log(`  Release 页面: https://github.com/TonyYang1985/electron-app/releases/tag/v${newVersion}`);
    console.log(`  是否预发布: ${isPrerelease || false}`);
    console.log(`  发布日期: ${info.releaseDate}`);
    
    // 详细的文件信息
    if (info.files && info.files.length > 0) {
      console.log("📦 可用文件:");
      info.files.forEach(file => {
        console.log(`  - ${file.url} (${this.formatBytes(file.size ?? 0)})`);
      });
    }

    // 验证版本号
    const isNewer = gt(newVersion, currentVersion);
    console.log(`  版本比较: ${isNewer ? '✅ 需要更新' : '❌ 无需更新'}`);
    
    if (!isNewer) {
      console.warn("⚠️ GitHub Release 版本不比当前版本新");
      return;
    }

    // 检查是否为预发布版本
    if (isPrerelease && !this.options.allowPrerelease) {
      console.log("⚠️ 跳过预发布版本");
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
    console.log(`📥 GitHub 下载进度: ${percent}%`);
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
    console.error("❌ GitHub 自动更新检查失败:");
    console.error(`  错误: ${error.message}`);
    
    // GitHub 特定错误分析
    const message = error.message.toLowerCase();
    
    if (message.includes('api rate limit')) {
      console.error("🚫 GitHub API 速率限制");
      console.error("   解决方案: 设置 GITHUB_TOKEN 环境变量");
      console.error("   获取 Token: https://github.com/settings/tokens");
    } else if (message.includes('404') || message.includes('not found')) {
      console.error("🔍 GitHub Repository 或 Release 未找到");
      console.error("   请检查: https://github.com/TonyYang1985/electron-app/releases");
    } else if (message.includes('network') || message.includes('timeout')) {
      console.error("🌐 网络连接问题");
      console.error("   GitHub 可能在某些地区访问受限");
      console.error("   考虑使用代理或 VPN");
    } else if (message.includes('forbidden') || message.includes('403')) {
      console.error("🔒 GitHub API 访问被禁止");
      console.error("   检查 Repository 是否为 public");
      console.error("   或配置正确的 GITHUB_TOKEN");
    }
    
    // 提供备用方案
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
      title: "GitHub 发现更新",
      message: `发现新版本 ${info.version}${isPrerelease ? ' (预发布)' : ''}`,
      detail: `当前版本: ${settings.app?.version}\n新版本: ${info.version}\n\n查看发布说明: ${releaseUrl}\n\n是否立即下载并安装更新？`,
      buttons: ["立即更新", "查看发布页面", "稍后提醒"],
      defaultId: 0,
      cancelId: 2,
    });

    switch (response) {
      case 0:
        console.log("✅ 用户选择立即更新");
        autoUpdater.downloadUpdate();
        break;
      case 1:
        console.log("🌐 用户选择查看发布页面");
        require('electron').shell.openExternal(releaseUrl);
        break;
      default:
        console.log("⏰ 用户选择稍后提醒");
    }
  }

  private suggestFallbackOptions(): void {
    console.log("📄 可选的备用方案:");
    console.log("1. 手动检查更新: https://github.com/TonyYang1985/electron-app/releases");
    console.log("2. 配置镜像源（如适用）");
    console.log("3. 使用本地更新服务器");
    console.log("4. 修改为 release 而不是 prerelease");
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}