import { ElectronMicroframeworkSettings } from "./ElectronMicroframeworkSettings";

export interface ElectronMicroframeworkLoader {
    name: string;
    load(settings: ElectronMicroframeworkSettings): Promise<void> | void;
  }
  