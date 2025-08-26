import { app, BrowserWindow, dialog, MessageBoxOptions } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import * as path from 'path';
import * as utils from './main/utils';

const isDev: boolean = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  if (!isDev) {
    // 自动更新配置
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      if (mainWindow) {
        const options: MessageBoxOptions = {
          type: 'info',
          title: '发现更新',
          message: `发现新版本 ${info.version}`,
          buttons: ['立即更新', '稍后提醒']
        };
        console.log('发现新版本', utils.MO_APP_VERSION);
        dialog.showMessageBox(mainWindow, options);
      }
    });

    // 立即检查更新
    autoUpdater.checkForUpdatesAndNotify();
    
    // 5秒后再次检查
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
