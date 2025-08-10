const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development';

// 配置自动更新
if (!isDev) {
  // 生产环境才启用自动更新
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'your-username',
    repo: 'my-electron-app',
    private: false
  });
  
  // 设置更新检查间隔（可选）
  autoUpdater.checkForUpdatesAndNotify();
}

let mainWindow;

// 自动更新事件处理
autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新...');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', '正在检查更新...');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('发现新版本:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', `发现新版本 ${info.version}`);
    
    // 询问用户是否立即更新
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '发现更新',
      message: `发现新版本 ${info.version}`,
      detail: '是否立即下载并安装？',
      buttons: ['立即更新', '稍后提醒'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        // 开始下载
        autoUpdater.downloadUpdate();
      }
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('当前已是最新版本');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', '当前已是最新版本');
  }
});

autoUpdater.on('error', (err) => {
  console.error('自动更新出错:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', '更新检查失败');
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  console.log(`下载进度: ${percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', percent);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('更新下载完成');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', '更新下载完成');
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '更新就绪',
      message: '更新已下载完成',
      detail: '点击"立即重启"安装更新',
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    show: false, // 先不显示，等加载完再显示
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // 加载页面
  const indexPath = isDev 
    ? 'http://localhost:3000' // 如果有开发服务器
    : `file://${path.join(__dirname, 'index.html')}`;
  
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 页面加载完成后显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发环境打开调试工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 阻止新窗口打开，改为在默认浏览器中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 应用程序菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => {
            if (!isDev) {
              autoUpdater.checkForUpdatesAndNotify();
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '检查更新',
                message: '开发环境不支持自动更新'
              });
            }
          }
        },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'My Electron App',
              detail: `版本: ${app.getVersion()}\n使用 Electron ${process.versions.electron} 构建`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用程序事件
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // macOS应用激活时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // 启动后检查更新（延迟5秒）
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  }
});

// 所有窗口关闭时退出应用（Windows & Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 防止多个实例
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}