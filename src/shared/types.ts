// 环境类型
export type Environment = 'LOCAL' | 'DEV' | 'SIT' | 'UAT' | 'PROD' | 'DEMO';

// 元配置接口
export interface MetaConfig {
  // 配置版本信息
  CONFIG_VERSION: string;
  LAST_UPDATED: string;
  DESCRIPTION: string;

  // 支持的环境列表
  ENVIRONMENTS: string[];

  // 必需的环境变量列表
  REQUIRED_ENV_VARS: string[];

  // 功能特性配置
  FEATURES: {
    ELECTRON_BUILDER: string;
    MULTI_ENVIRONMENT: string;
    CODE_SIGNING: string;
    AUTO_UPDATE: string;
    NUCLEUS_ANALYTICS: string;
    GITHUB_RELEASES: string;
    S3_PUBLISHING: string;
    MULTI_PLATFORM: string;
  };

  // 验证规则配置
  VALIDATION_RULES: {
    REQUIRED_FIELDS: string[];
    BOOLEAN_FIELDS: string[];
    URL_FIELDS: string[];
    FILE_PATH_FIELDS: string[];
  };

  // 配置说明和注意事项
  NOTES: {
    SECURITY: string;
    CERTIFICATES: string;
    ICONS: string;
    LOGS: string;
    VARIABLES: string;
    ELECTRON_BUILDER: string;
  };
}

// 通用配置接口
export interface CommonConfig {
  // 协议配置
  PROTOCOL_NAME: string;
  PROTOCOL_SCHEMES: string;

  // Windows 平台配置
  PLATFORM_WINDOWS_LOADING_GIF: string;

  // macOS 平台配置
  PLATFORM_MACOS_DMG_ICON_SIZE: string;
  PLATFORM_MACOS_DMG_WINDOW_WIDTH: string;
  PLATFORM_MACOS_DMG_WINDOW_HEIGHT: string;

  // Linux 平台配置
  PLATFORM_LINUX_CATEGORIES: string;
  PLATFORM_LINUX_SECTION: string;
  PLATFORM_LINUX_PRIORITY: string;
  PLATFORM_LINUX_LICENSE: string;
  PLATFORM_LINUX_DEB_DEPS: string[];
  PLATFORM_LINUX_RPM_DEPS: string[];
  PLATFORM_LINUX_DEB_DEPS_ARRAY: string[];
  PLATFORM_LINUX_RPM_DEPS_ARRAY: string[];

  // 公司信息
  COMPANY_NAME: string;

  // GitHub 标签前缀
  GITHUB_TAG_PREFIX_DEV: string;
  GITHUB_TAG_PREFIX_STAGING: string;
  GITHUB_TAG_PREFIX_PROD: string;

  // S3 文件夹配置
  S3_FOLDER_DEV: string;
  S3_FOLDER_STAGING: string;
  S3_FOLDER_PROD: string;

  // Electron Fuses 安全配置
  FUSES_VERSION: string;
  FUSES_STRICTLY_REQUIRE_ALL: string;
  FUSES_RUN_AS_NODE: string;
  FUSES_ENABLE_COOKIE_ENCRYPTION: string;
  FUSES_ENABLE_NODE_OPTIONS_ENV: string;
  FUSES_ENABLE_NODE_CLI_INSPECT: string;
  FUSES_ENABLE_EMBEDDED_ASAR_INTEGRITY: string;
  FUSES_ONLY_LOAD_APP_FROM_ASAR: string;
}

// 环境配置接口
export interface EnvironmentConfig {
  // 基础应用信息
  PRODUCT_NAME: string;
  NAME: string;
  APP_BUNDLE_ID: string;
  VERSION: string;
  STATIC_VERSION: string;
  BUILD_NUMBER: string;
  YEAR: string;
  BUILD_IDENTIFIER: string;
  IS_PRERELEASE: string;

  // GitHub 配置
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_TOKEN: string;
  GITHUB_RELEASE_TYPE: string;
  PUBLISH_AUTO_UPDATE: string;

  // 代码签名配置
  CERTIFICATE_FILE: string;
  CERTIFICATE_PASSWORD: string;
  ENABLE_CODE_SIGNING: string;
  MAC_IDENTITY: string;
  MSI_UPGRADE_CODE: string;

  // 开发调试配置
  ENABLE_DEBUG: string;
  ENABLE_DEVTOOLS: string;

  // 应用描述信息
  APP_DESCRIPTION: string;
  APP_HOMEPAGE: string;
  AUTHOR_NAME: string;
  AUTHOR_EMAIL: string;

  // 图标配置
  ICON_WINDOWS: string;
  ICON_MACOS: string;
  ICON_LINUX: string;
  // ICON_GENERIC: string;

  // 发布配置
  SQUIRREL_REMOTE_RELEASES: string;
  NSIS_WEB_APP_PACKAGE_URL: string;

  // 功能开关
  ANALYTICS_ENABLED: string;
  AUTO_UPDATER_ENABLED: string;

  // 日志配置
  LOG_FILE_PATH: string;

  // 兼容旧版本字段 (可选)
  API_ENV?: Environment;

  // Linux 依赖配置
  LINUX_DEB_DEPS_ARRAY: string[];
  LINUX_RPM_DEPS_ARRAY: string[];
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