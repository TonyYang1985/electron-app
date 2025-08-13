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
  win: {
    target: Array<{
      target: 'nsis' | 'portable' | 'zip';
      arch: ('x64' | 'ia32' | 'arm64')[];
    }>;
  };
  mac?: {
    target: string[];
    icon?: string;
  };
  linux?: {
    target: string[];
    icon?: string;
  };
  publish: Array<{
    provider: 'generic' | 's3' | 'github';
    url: string;
  }>;
}