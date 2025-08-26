import { BrowserWindow } from 'electron';
import * as path from 'path';
import { ElectronMicroframeworkLoader } from '../../shared/ElectronMicroframeworkLoader';
import { ElectronMicroframeworkSettings } from '../../shared/ElectronMicroframeworkSettings';

export interface WindowLoaderOptions {
  theme?: 'light' | 'dark';
  devTools?: boolean;
  customPreload?: string;
  webSecurity?: boolean;
}

export class WindowLoader implements ElectronMicroframeworkLoader {
  name = 'WindowLoader';
  
  constructor(private options: WindowLoaderOptions = {}) {}

  async load(settings: ElectronMicroframeworkSettings): Promise<void> {
    await this.createMainWindow(settings);
    this.setupWindowEvents(settings);
  }

  private async createMainWindow(settings: ElectronMicroframeworkSettings): Promise<void> {
    const windowSettings = settings.window || {};
    
    const mainWindow = new BrowserWindow({
      width: windowSettings.width || 1200,
      height: windowSettings.height || 800,
      minWidth: windowSettings.minWidth || 800,
      minHeight: windowSettings.minHeight || 600,
      webPreferences: {
        nodeIntegration: false,
      // contextIsolation: true,
       // enableRemoteModule: false,
        webSecurity: this.options.webSecurity ?? true,
        preload: this.options.customPreload || path.join(__dirname, '../preload.js'),
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      show: false,
      titleBarStyle: 'default',
      frame: true,
      resizable: true,
      backgroundColor: this.options.theme === 'dark' ? '#2f3241' : '#ffffff'
    });

    // 防止导航到外部链接 - 在加载页面前设置
    mainWindow.webContents.setWindowOpenHandler((details: { url: any; }) => {
      console.log('🚫 阻止打开外部链接:', details.url);
      return { action: 'deny' as const };
    });

    // 加载页面
    const indexPath = path.join(__dirname, '../index.html');
    await mainWindow.loadFile(indexPath);


    // 保存到全局上下文
    const context = (global as any).electronContext;
    if (context) {
      context.mainWindow = mainWindow;
    }
  }

  private setupWindowEvents(settings: ElectronMicroframeworkSettings): void {
    const context = (global as any).electronContext;
    const mainWindow = context?.mainWindow;
    
    if (!mainWindow) return;

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.focus();
      
      const shouldShowDevTools = this.options.devTools ?? settings.isDev;
      if (shouldShowDevTools) {
        mainWindow.webContents.openDevTools();
      }
    });

    mainWindow.on('closed', () => {
      if (context) {
        context.mainWindow = null;
      }
    });
  }
}
