import { MicroframeworkSettings } from "./MicroframeworkSettings";

export interface MicroframeworkLoader {
    name: string;
    load(settings: MicroframeworkSettings): Promise<void> | void;
  }
  