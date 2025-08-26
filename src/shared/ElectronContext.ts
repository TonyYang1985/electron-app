import { ElectronMicroframeworkSettings } from "./ElectronMicroframeworkSettings";

  export interface ElectronContext {
    mainWindow: Electron.BrowserWindow | null;
    settings: ElectronMicroframeworkSettings;
  }