export interface ElectronMicroframeworkSettings {
    isDev?: boolean;
    window?: {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
    };
    app?: {
      name?: string;
      version?: string;
      protocol?: string;
    };
    showBootstrapTime?: boolean;
  }