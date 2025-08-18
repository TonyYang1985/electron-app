import { promises as fs } from "fs";
import { join } from "path";
import type {
  EnvironmentConfig,
  CommonConfig,
  PackageJson,
  Environment,
  MetaConfig,
} from "../shared/types";

/**
 * 模块化 Electron Builder 配置生成器
 * 基于现有的 ConfigurationGenerator 扩展，专门用于生成 electron-builder.json
 */
export class ModularElectronBuilderGenerator {
  private readonly packageInfo: PackageJson;
  //private readonly domain: string;
  private readonly configDir: string;
  private readonly templatePath: string;
  private readonly outputPath: string;

  constructor() {
    // 加载 package.json
    this.packageInfo = require("../../package.json") as PackageJson;
    //this.domain = this.packageInfo.minio;
    // 配置路径
    this.configDir = join(process.cwd(), "env");
    this.templatePath = join(process.cwd(), "env", "electron_builder_template.json");
    this.outputPath = join(process.cwd(), "electron-builder.json");

    console.log(`🚀 开始生成configDir  ${ this.configDir} ...`);
    console.log(`🚀 开始生成templatePath ${ this.templatePath} ...`);
    console.log(`🚀 开始生成outputPath ${ this.outputPath} ...`);
  }

  /**
   * 主配置生成函数
   */
  async generateElectronBuilderConfig(environment: Environment): Promise<void> {
    this.validateEnvironment(environment);

    try {
      console.log(`🚀 开始生成 ${environment} 环境的 Electron Builder 配置...`);

      // 1. 加载配置文件
      const commonConfig = await this.loadCommonConfig();
      const envConfig = await this.loadEnvironmentConfig(environment);
      const metaConfig = await this.loadMetaConfig();

      // 验证环境是否支持
      if (!metaConfig.ENVIRONMENTS.includes(environment)) {
        throw new Error(`不支持的环境: ${environment}。支持的环境: ${metaConfig.ENVIRONMENTS.join(', ')}`);
      }

      // 2. 合并配置
      const mergedConfig = this.mergeConfigurations(commonConfig, envConfig, metaConfig);

      // 3. 处理环境变量
      const processedConfig = this.processEnvironmentVariables(mergedConfig);

      // 4. 创建扩展变量映射
      const extendedConfig = this.createExtendedVariableMap(processedConfig, environment);

      // 5. 生成 Electron Builder 配置
      await this.generateConfigFromTemplate(extendedConfig);

      // 6. 复制环境对应的图标
      await this.copyEnvironmentIcon(environment);

      console.log(`✅ Electron Builder 配置生成完成: ${this.outputPath}`);
      console.log(`📦 应用名称: ${processedConfig.PRODUCT_NAME}`);
      console.log(`🔢 版本号: ${this.packageInfo.version}`);
      console.log(`🏗️ 构建环境: ${environment}`);

    } catch (error) {
      console.error(`❌ 配置生成失败:`, error);
      throw error;
    }
  }

  /**
   * 验证环境参数
   */
  private validateEnvironment(environment: string): asserts environment is Environment {
    const supportedEnvironments: Environment[] = [
      "LOCAL", "DEV", "SIT", "UAT", "PROD", "DEMO",
    ];
    if (!supportedEnvironments.includes(environment as Environment)) {
      throw new Error(
        `不支持的环境: ${environment}. 支持的环境: ${supportedEnvironments.join(", ")}`
      );
    }
  }

  /**
   * 加载通用配置
   */
  private async loadCommonConfig(): Promise<CommonConfig> {
    try {
      const configPath = join(this.configDir, "common.json");
      const content = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(content) as CommonConfig;
      console.log(`✅ 已加载通用配置: common.json`);
      return config;
    } catch (error) {
      throw new Error(
        `加载通用配置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 加载环境特定配置
   */
  private async loadEnvironmentConfig(environment: Environment): Promise<EnvironmentConfig> {
    try {
      const configPath = join(this.configDir, `${environment}.json`);
      const content = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(content) as EnvironmentConfig;
      console.log(`✅ 已加载环境配置: ${environment}.json`);
      return config;
    } catch (error) {
      throw new Error(
        `加载环境配置失败 (${environment}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 加载元数据配置
   */
  private async loadMetaConfig(): Promise<any> {
    try {
      const configPath = join(this.configDir, "meta.json");
      const content = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(content);
      console.log(`✅ 已加载元数据配置: meta.json`);
      return config;
    } catch (error) {
      console.warn(`⚠️  元数据配置加载失败，将继续执行: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  /**
   * 合并配置
   */
  private mergeConfigurations(commonConfig: CommonConfig, envConfig: EnvironmentConfig, metaConfig: MetaConfig): Record<string, any> {
    // 合并配置 (环境配置优先级最高)
    const mergedConfig = { ...commonConfig, ...envConfig, ...metaConfig};
    console.log(`🔀 配置合并完成: 环境配置 + 通用配置 + 元配置`);
    return mergedConfig;
  }

  /**
   * 处理环境变量替换
   */
  private processEnvironmentVariables(config: Record<string, any>): Record<string, any> {
    const processedConfig: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVarName = value.slice(2, -1);
        const envValue = process.env[envVarName];
        
        if (envValue === undefined) {
          console.warn(`⚠️  环境变量未设置: ${envVarName}`);
          processedConfig[key] = value; // 保持原样
        } else {
          processedConfig[key] = envValue;
          console.log(`🔄 环境变量替换: ${envVarName} -> [已设置]`);
        }
      } else {
        processedConfig[key] = value;
      }
    }
    
    return processedConfig;
  }

  /**
   * 创建扩展变量映射
   */
  private createExtendedVariableMap(config: Record<string, any>, environment: Environment): Record<string, any> {
    const now = new Date();
    const gitCommit = process.env.GIT_COMMIT || process.env.GITHUB_SHA || 'unknown';
    const gitBranch = process.env.GIT_BRANCH || process.env.GITHUB_REF_NAME || 'unknown';
    
    return {
      ...config,
      // 自动从 package.json 获取版本号
      VERSION: this.packageInfo.version,
      STATIC_VERSION: this.packageInfo.staticVersion,
      
      // 时间戳相关
      BUILD_TIMESTAMP: now.toISOString(),
      BUILD_DATE: now.toISOString().split('T')[0],
      BUILD_TIME: now.toTimeString().split(' ')[0],
      
      // Git 相关
      GIT_COMMIT: gitCommit,
      GIT_BRANCH: gitBranch,
      GIT_SHORT_SHA: gitCommit.substring(0, 7),
      
      // 环境相关
      NODE_ENV: environment,
      API_ENV: environment,
      
      // 处理数组类型的依赖
      PLATFORM_LINUX_DEB_DEPS_ARRAY: this.convertDepsToArray(config.PLATFORM_LINUX_DEB_DEPS_ARRAY || config.PLATFORM_LINUX_DEB_DEPS),
      PLATFORM_LINUX_RPM_DEPS_ARRAY: this.convertDepsToArray(config.PLATFORM_LINUX_RPM_DEPS_ARRAY || config.PLATFORM_LINUX_RPM_DEPS),
      
      // Windows 签名相关
      WIN_SIGN_AND_EDIT: config.ENABLE_CODE_SIGNING === 'true' ? 'true' : 'false',
      VERIFY_UPDATE_SIGNATURE: config.ENABLE_CODE_SIGNING === 'true' ? 'true' : 'false',
      
      // MSI 相关
      MSI_UPGRADE_CODE: config.MSI_UPGRADE_CODE || this.generateUpgradeCode(config.APP_BUNDLE_ID),
      
      // Mac 相关
      MAC_IDENTITY: config.MAC_IDENTITY || 'Developer ID Application',
      MAC_INSTALLER_IDENTITY: config.MAC_INSTALLER_IDENTITY || 'Developer ID Installer',
      
      // 版本信息
      ELECTRON_VERSION: 'latest',
      NODE_VERSION: process.version,
      
      // 其他必需变量的默认值
      SQUIRREL_REMOTE_RELEASES: config.SQUIRREL_REMOTE_RELEASES || '',
      NSIS_WEB_APP_PACKAGE_URL: config.NSIS_WEB_APP_PACKAGE_URL || '',
    };
  }

  /**
   * 从模板生成配置
   */
  private async generateConfigFromTemplate(config: Record<string, any>): Promise<void> {
    try {
      // 读取模板文件
      let template: string;
      if (await this.fileExists(this.templatePath)) {
        template = await fs.readFile(this.templatePath, 'utf8');
        console.log(`📄 已加载模板: electron_builder_template.json`);
      } else {
        // 如果模板不存在，使用内置模板
        template = this.getBuiltinTemplate();
        console.log(`📄 使用内置模板生成配置`);
      }

      // 替换模板中的变量
      Object.entries(config).forEach(([key, value]) => {
        const placeholder = `\${${key}}`;
        
        // 跳过 electron-builder 内置变量
        if (['os', 'arch', 'ext'].includes(key)) {
          return;
        }
        
        // 处理数组类型 - 只替换普通占位符，不处理数组占位符
        if (Array.isArray(value)) {
          return;
        }
        
        // 处理普通字符串占位符
        template = template.split(placeholder).join(String(value || ''));
      });

      // 单独处理数组占位符，避免被字符串替换覆盖
      Object.entries(config).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const arrayPlaceholder = `__ARRAY_${key}__`;
          template = template.split(arrayPlaceholder).join(JSON.stringify(value));
        }
      });

      // 后处理：修复被引号包围的 JSON 数组
      template = template.replace(/"(\[.*?\])"/g, '$1');

      // 验证并解析 JSON
      const builderConfig = JSON.parse(template);

      // 动态调整配置
      this.adjustBuilderConfig(builderConfig, config);

      // 写入配置文件
      await fs.writeFile(this.outputPath, JSON.stringify(builderConfig, null, 2), 'utf8');
    } catch (error) {
      throw new Error(
        `从模板生成配置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 动态调整 Builder 配置
   */
  private adjustBuilderConfig(builderConfig: any, config: Record<string, any>): void {
    // 根据代码签名设置调整 Windows 配置
    if (config.ENABLE_CODE_SIGNING !== 'true') {
      if (builderConfig.win) {
        delete builderConfig.win.certificateFile;
        delete builderConfig.win.certificatePassword;
        delete builderConfig.win.signAndEditExecutable;
        delete builderConfig.win.verifyUpdateCodeSignature;
        delete builderConfig.win.rfc3161TimeStampServer;
        delete builderConfig.win.timeStampServer;
        console.log('🔒 Windows 代码签名已禁用');
      }
    }

    // 根据环境调整发布配置
    if (config.IS_PRERELEASE === 'true') {
      const githubPublish = builderConfig.publish?.find((p: any) => p.provider === 'github');
      if (githubPublish) {
        githubPublish.releaseType = 'prerelease';
        console.log('🏷️ GitHub 发布类型设置为: prerelease');
      }
    }

    // 如果没有设置 GitHub Token，移除 GitHub 发布
    if (!config.GITHUB_TOKEN || config.GITHUB_TOKEN.startsWith('${')) {
      builderConfig.publish = builderConfig.publish?.filter((p: any) => p.provider !== 'github') || [];
      console.log('⚠️  GitHub Token 未设置，已移除 GitHub 发布');
    }

    // 开发环境特殊处理
    if (config.BUILD_IDENTIFIER === 'development' || config.API_ENV === 'LOCAL') {
      // 开发环境禁用发布
      builderConfig.publish = [];
      console.log('🔧 开发环境已禁用所有发布');
      
      // 简化目标平台
      if (builderConfig.win?.target) {
        builderConfig.win.target = [{ target: 'nsis', arch: ['x64'] }];
      }
      if (builderConfig.mac?.target) {
        builderConfig.mac.target = [{ target: 'dmg', arch: ['x64'] }];
      }
      if (builderConfig.linux?.target) {
        builderConfig.linux.target = [{ target: 'AppImage', arch: ['x64'] }];
      }
      console.log('🎯 开发环境已简化构建目标');
    }

    // 设置输出目录（兼容原有逻辑）
    if (builderConfig.directories) {
      builderConfig.directories.output = `../BMO-MO-APP-RELEASES/${config.API_ENV}`;
    }
  }

  /**
   * 复制环境对应的图标文件
   */
  private async copyEnvironmentIcon(environment: Environment): Promise<void> {
    try {
      // 图标文件选择逻辑（保持与原代码一致）
      const iconName = this.getIconName(environment);
      const sourceIconPath = `./assets/${iconName}.ico`;
      const targetIconPath = "./build/icon.ico";

      // 确保构建目录存在
      await this.ensureDirectoryExists("./build");

      // 检查源图标文件是否存在
      if (await this.fileExists(sourceIconPath)) {
        // 复制图标文件
        await fs.copyFile(sourceIconPath, targetIconPath);
        console.log(`🎨 图标已复制: ${sourceIconPath} → ${targetIconPath}`);
      } else {
        console.warn(`⚠️  图标文件不存在: ${sourceIconPath}`);
      }
    } catch (error) {
      console.warn(`⚠️  复制图标失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取图标名称 - 保持原逻辑
   */
  private getIconName(apiEnv: Environment): string {
    if (apiEnv === "PROD") {
      return "mol";
    }

    // LOCAL 环境使用 DEV 图标，其他环境使用对应图标
    const iconEnv = apiEnv === "LOCAL" ? "DEV" : apiEnv;
    return `mol-${iconEnv}`;
  }

  /**
   * 工具函数
   */
  private convertDepsToArray(deps?: string | string[]): string[] {
    if (!deps) return [];
    if (Array.isArray(deps)) return deps;
    if (typeof deps === 'string') {
      return deps.split(',').map(dep => dep.trim()).filter(dep => dep);
    }
    return [];
  }

  private generateUpgradeCode(appBundleId?: string): string {
    if (!appBundleId) return '';
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(appBundleId).digest('hex');
    return `{${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}}`.toUpperCase();
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 内置模板（当模板文件不存在时使用）
   */
  private getBuiltinTemplate(): string {
    return JSON.stringify({
      appId: "${APP_BUNDLE_ID}",
      productName: "${PRODUCT_NAME}",
      copyright: "Copyright \u00A9 ${YEAR} ${COMPANY_NAME}",
      artifactName: "${NAME}-${VERSION}-${os}-${arch}.${ext}",
      buildVersion: "${BUILD_NUMBER}",
      directories: {
        app: "./",
        output: "./dist",
        buildResources: "./build"
      },
      files: [
        "release/**/*",
        "node_modules/**/*",
        "package.json",
        "!**/node_modules/*/{test,__tests__,tests,examples}/**",
        "!**/*.{md,ts,map}",
        "!src/**/*"
      ],
      extraResources: [
        {
          from: "assets",
          to: "assets",
          filter: ["**/*"]
        }
      ],
      extraMetadata: {
        name: "${NAME}"
      },
      win: {
        target: [
          { target: "nsis", arch: ["x64", "ia32"] },
          { target: "portable", arch: ["x64"] }
        ],
        icon: "assets/icon.png",
        forceCodeSigning: false,
        verifyUpdateCodeSignature: false,
        requestedExecutionLevel: "asInvoker"
      },
      mac: {
        target: [
          { target: "dmg", arch: ["x64", "arm64"] },
          { target: "zip", arch: ["x64", "arm64"] }
        ],
        icon: "assets/icon.png",
        category: "public.app-category.productivity"
      },
      linux: {
        target: [
          { target: "AppImage", arch: ["x64"] },
          { target: "deb", arch: ["x64"] },
          { target: "rpm", arch: ["x64"] }
        ],
        icon: "assets/icon.png",
        category: "Utility"
      },
      nsis: {
        oneClick: false,
        perMachine: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: "always",
        createStartMenuShortcut: true,
        shortcutName: "${PRODUCT_NAME}",
        deleteAppDataOnUninstall: false,
        runAfterFinish: true,
        menuCategory: "\u5E94\u7528\u7A0B\u5E8F",
        installerIcon: "assets/icon.ico",
        uninstallerIcon: "assets/icon.ico"
      },
      publish: []
    }, null, 2);
  }

  /**
   * 获取配置摘要信息
   */
  public getConfigurationSummary(environment: Environment): string {
    const iconName = this.getIconName(environment);
    return `
环境配置摘要:
├── 环境: ${environment}
├── 图标: ${iconName}
├── 包名: ${this.packageInfo.name}
├── 版本: ${this.packageInfo.version}
├── 静态版本: ${this.packageInfo.staticVersion}
├── 配置目录: ${this.configDir}
├── 模板文件: ${this.templatePath}
└── 输出文件: ${this.outputPath}
`;
  }
}

/**
 * 主执行函数
 */
async function main(): Promise<void> {
  try {
    // 获取环境参数
    const environment = getEnvironmentFromArgs();

    // 创建配置生成器
    const generator = new ModularElectronBuilderGenerator();

    // 显示配置摘要
    console.log(generator.getConfigurationSummary(environment));

    // 生成配置
    await generator.generateElectronBuilderConfig(environment);
  } catch (error) {
    console.error(
      "❌ 配置生成失败:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * 从命令行参数或环境变量获取环境
 */
function getEnvironmentFromArgs(): Environment {
  const environment = process.env.API_ENV || process.argv[2];

  if (!environment) {
    console.error("❌ 未指定环境参数");
    console.log("用法示例:");
    console.log("  npm run config:ts:DEMO");
    console.log("  tsx src/scripts/ModularConfigGenerator.ts DEMO");
    console.log("  API_ENV=DEMO tsx src/scripts/ModularConfigGenerator.ts");
    console.log("支持的环境: LOCAL, DEV, SIT, UAT, PROD, DEMO");
    process.exit(1);
  }

  return environment as Environment;
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 致命错误:", error);
    process.exit(1);
  });
}

export default ModularElectronBuilderGenerator;