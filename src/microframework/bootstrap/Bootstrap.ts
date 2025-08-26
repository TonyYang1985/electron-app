import "reflect-metadata";
import { ElectronMicroframeworkSettings } from "../../shared/ElectronMicroframeworkSettings";
import { SingleInstanceLoader } from "../loaders/SingleInstanceLoader";
import { WindowLoader } from "../loaders/WindowLoader";
import { AppEventsLoader } from "../loaders/AppEventsLoader";
import { AutoUpdaterLoader } from "../loaders/AutoUpdaterLoader";
import { MicroframeworkBootstrap } from "./MicroframeworkBootstrap";

const settingHolder: { framework?: any } = {};

export const bootstrapMicroframework = async (
  settings: ElectronMicroframeworkSettings = {}
): Promise<any> => {
  // 创建微框架实例
  const framework = new MicroframeworkBootstrap(settings);

  // 默认加载器链 - 推荐的标准配置
  framework
    .use(new SingleInstanceLoader()) // 单实例保护
    .use(new WindowLoader()) // 窗口管理
    .use(new AppEventsLoader()) // 应用事件
    .use(new AutoUpdaterLoader()); // 自动更新

  // 启动框架
  return framework.bootstrap().then(async (mfmk: any) => {
    settingHolder.framework = mfmk;
    const appName = settings.app?.name || "Electron App";
    const appVersion = settings.app?.version || "1.0.0";
    if (settings.showBootstrapTime) {
      console.log(`🎉 ${appName}(v${appVersion}) 启动成功`);
    }

    return mfmk;
  });
};

// 获取框架实例
export const getFramework = () => {
  return settingHolder.framework;
};

// 获取 Electron 上下文
export const getElectronContext = () => {
  return (global as any).electronContext;
};

// 导出所有加载器供用户自定义使用
export {
  MicroframeworkBootstrap,
  SingleInstanceLoader,
  WindowLoader,
  AppEventsLoader,
  AutoUpdaterLoader,
};
