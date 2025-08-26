import { ElectronContext } from "./ElectronContext";
import { ElectronMicroframeworkSettings } from "./ElectronMicroframeworkSettings";

export interface ElectronMicroframework {
    settings: ElectronMicroframeworkSettings;
    context: ElectronContext;
    getMainWindow(): Electron.BrowserWindow | null;
    getContext(): ElectronContext;
  }
  