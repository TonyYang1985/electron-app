import { app } from 'electron';
import {  ElectronMicroframeworkSettings } from '../../shared/ElectronMicroframeworkSettings';
import { ElectronMicroframeworkLoader } from '../../shared/ElectronMicroframeworkLoader';

export class SingleInstanceLoader implements ElectronMicroframeworkLoader {
  name = 'SingleInstanceLoader';

  load(settings: ElectronMicroframeworkSettings): void {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      console.log('🔒 应用已在运行，退出当前实例');
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      console.log('🔍 检测到第二个实例，聚焦到现有窗口');
      this.focusMainWindow();
    });

    // 设置默认协议客户端
    if (!settings.isDev && settings.app?.protocol) {
      app.setAsDefaultProtocolClient(settings.app.protocol);
    }
  }

  private focusMainWindow(): void {
    const context = (global as any).electronContext;
    if (context?.mainWindow) {
      if (context.mainWindow.isMinimized()) {
        context.mainWindow.restore();
      }
      context.mainWindow.focus();
      context.mainWindow.show();
    }
  }
}
