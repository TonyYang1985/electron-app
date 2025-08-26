import { app } from 'electron';
import { ElectronMicroframeworkSettings } from '../../shared/ElectronMicroframeworkSettings';
import { ElectronMicroframeworkLoader } from '../../shared/ElectronMicroframeworkLoader';
import { ElectronMicroframework } from '../../shared/ElectronMicroframework';
import { ElectronContext } from '../../shared/ElectronContext';

export class MicroframeworkBootstrap {
  private loaders: ElectronMicroframeworkLoader[] = [];
  private settings: ElectronMicroframeworkSettings;
  private startTime: number = 0;
  
  constructor(settings: ElectronMicroframeworkSettings = {}) {
    this.settings = this.mergeDefaultSettings(settings);
  }

  /**
   * 合并默认设置
   */
  private mergeDefaultSettings(settings: ElectronMicroframeworkSettings): ElectronMicroframeworkSettings {
    return {
      isDev: process.env.NODE_ENV === 'development',
      showBootstrapTime: process.env.NODE_ENV === 'development',
      window: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        ...settings.window
      },
      app: {
        name: 'electron-app',
        version: '1.0.0',
        protocol: 'electron-app',
        ...settings.app
      },
      ...settings
    };
  }

  /**
   * 链式注册加载器
   */
  public use(loader: ElectronMicroframeworkLoader): this {
    this.loaders.push(loader);
    return this;
  }

  /**
   * 启动微框架
   */
  public async bootstrap(): Promise<ElectronMicroframework> {
    if (this.settings.showBootstrapTime) {
      this.startTime = Date.now();
      console.log('🚀 启动 Electron 微框架...');
    }

    try {
      // 等待应用准备就绪
      await app.whenReady();
      
      // 设置应用用户模型ID (Windows)
      if (process.platform === 'win32' && this.settings.app?.name) {
        app.setAppUserModelId(`com.yourcompany.${this.settings.app.name}`);
      }

      // 初始化全局上下文
      const context: ElectronContext = {
        mainWindow: null,
        settings: this.settings
      };

      (global as any).electronContext = context;

      // 顺序加载所有加载器
      for (const loader of this.loaders) {
        if (this.settings.showBootstrapTime) {
          console.log(`📦 加载模块: ${loader.name}`);
        }
        await loader.load(this.settings);
      }

      if (this.settings.showBootstrapTime) {
        const bootTime = Date.now() - this.startTime;
        console.log(`✅ Electron 微框架启动完成 (${bootTime}ms)`);
      }

      // 创建框架实例
      const framework: ElectronMicroframework = {
        settings: this.settings,
        context,
        getMainWindow: () => (global as any).electronContext?.mainWindow || null,
        getContext: () => (global as any).electronContext || context
      };

      return framework;
    } catch (error) {
      console.error('❌ 微框架启动失败:', error);
      throw error;
    }
  }
}
