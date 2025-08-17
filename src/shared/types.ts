// 环境类型
export type Environment = 'LOCAL' | 'DEV' | 'SIT' | 'UAT' | 'PROD' | 'DEMO';

// 通用配置接口
export interface CommonConfig {
  [key: string]: any;
}

// 环境配置接口
export interface EnvironmentConfig {
  name: string;
  CHANNEL_ID: string;
  PRODUCT_NAME: string;
  appBundleId: string;
  proxy: string;
  API_ENV: Environment;
}

// Package.json 接口
export interface PackageJson {
  name: string;
  version: string;
  staticVersion: string;
  description: string;
  main: string;
  minio: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Electron Builder 配置接口
export interface ElectronBuilderConfig {
  extraMetadata: {
    name: string;
  };
  directories: {
    output: string;
  };
  appId: string;
  productName: string;
  copyright: string;
  files: string[];
  extraResources: Array<{
    from: string;
    to: string;
    filter: string[];
  }>;
  win: {
    target: Array<{
      target: 'nsis' | 'portable' | 'zip';
      arch: ('x64' | 'ia32' | 'arm64')[];
    }>;
    icon: string;
    forceCodeSigning: boolean;
    verifyUpdateCodeSignature: boolean;
    requestedExecutionLevel: string;
  };
  mac?: {
    target: Array<{ target: 'dmg' | 'zip'; arch: ('x64' | 'arm64')[]; }>;
    icon?: string;
    category?: string;
  };    
  linux?: {
    target: Array<{ target: 'AppImage' | 'deb' | 'rpm'; arch: ('x64' | 'arm64')[]; }>;
    icon?: string;
    category?: string;
    maintainer?: string;
    vendor?: string;
    synopsis?: string;
    description?: string;
  };
  nsis?: {
    oneClick: boolean;
    perMachine: boolean;
    allowToChangeInstallationDirectory: boolean;
    createDesktopShortcut: string;
    createStartMenuShortcut: boolean;
    shortcutName: string;
    deleteAppDataOnUninstall: boolean;
    runAfterFinish: boolean;
    menuCategory: string;
    installerIcon: string;
    uninstallerIcon: string;
  };

  publish: Array<{
    provider: 'generic' | 's3' | 'github';
    url: string;
  }>;
}

// forge 配置接口
export interface AppConfig {
  PRODUCT_NAME: string;
  name: string;
  appBundleId: string;
  [key: string]: any;
}

// forge 配置接口
export interface ForgeTemplate {
  packagerConfig: {
    asar: boolean;
    name: string;
    executableName: string;
    appBundleId: string;
    icon: string;
    protocols: Array<{
      name: string;
      schemes: string[];
    }>;
  };
  rebuildConfig: {};
  makers: Array<{
    name: string;
    platforms?: string[];
    config: {
      name?: string;
      authors?: string;
      description?: string;
      setupIcon?: string;
      options?: {
        maintainer?: string;
        description?: string;
        icon?: string;
      };
    };
  }>;
  plugins: Array<{
    name: string;
    config: {};
  }>;
}