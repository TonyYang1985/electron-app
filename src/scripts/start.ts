import { promises as fs } from "fs";
import { join } from "path";
import type {
  EnvironmentConfig,
  CommonConfig,
  ElectronBuilderConfig,
  PackageJson,
  Environment,
} from "../shared/types";

/**
 * 配置生成器类
 * 负责生成环境特定的配置文件和构建配置
 * 基于原 start.js 的 TypeScript 重构版本
 */
export class ConfigurationGenerator {
  private readonly packageInfo: PackageJson;
  private readonly domain: string;

  constructor() {
    // 加载 package.json
    this.packageInfo = require("../../package.json") as PackageJson;
    this.domain = this.packageInfo.minio;
  }

  /**
   * 主配置生成函数 - 对应原 setConfig 函数
   */
  async setConfig(environment: Environment): Promise<string> {
    this.validateEnvironment(environment);

    try {
      console.log(`🚀 开始生成 ${environment} 环境配置...`);

      // 加载配置文件
      const commonConfig = await this.loadCommonConfig();
      const envConfig = await this.loadEnvironmentConfig(environment);
      // 生成 electron-builder 配置（仅 Windows）
     // if (process.platform === "win32") {
        await this.generateElectronBuilderConfig(envConfig);
      //}
      // 生成运行时配置
      const configContent = await this.generateRuntimeConfig(
        commonConfig,
        envConfig
      );
      console.log(`✅ ${environment} 环境配置生成完成!`);
      return configContent;
    } catch (error) {
      console.error(`❌ 配置生成失败:`, error);
      throw error;
    }
  }

  /**
   * 验证环境参数
   */
  private validateEnvironment(
    environment: string
  ): asserts environment is Environment {
    const supportedEnvironments: Environment[] = [
      "LOCAL", "DEV", "SIT", "UAT","PROD",  "DEMO",
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
      const configPath = join(process.cwd(), "env/common.json");
      const content = await fs.readFile(configPath, "utf8");
      return JSON.parse(content) as CommonConfig;
    } catch (error) {
      throw new Error(
        `加载通用配置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 加载环境特定配置
   */
  private async loadEnvironmentConfig(
    environment: Environment
  ): Promise<EnvironmentConfig> {
    try {
      const configPath = join(process.cwd(), `env/${environment}.json`);
      const content = await fs.readFile(configPath, "utf8");
      return JSON.parse(content) as EnvironmentConfig;
    } catch (error) {
      throw new Error(
        `加载环境配置失败 (${environment}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 生成运行时配置文件 - config.json
   */
  private async generateRuntimeConfig(
    commonConfig: CommonConfig,
    envConfig: EnvironmentConfig
  ): Promise<string> {
    try {
      const outputFile = "./config.json";
      const mergedConfig = { ...commonConfig, ...envConfig };
      const configContent = JSON.stringify(mergedConfig, null, 2)

      await fs.writeFile(outputFile, configContent, "utf8");
      console.log(`📝 运行时配置已生成: ${outputFile}`);

      return configContent;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`生成运行时配置失败: ${errorMessage}`);
    }
  }

  /**
   * 生成 Electron Builder 配置 - 对应原 electronBuilderConfig 函数
   */
  private async generateElectronBuilderConfig(
    envConfig: EnvironmentConfig
  ): Promise<void> {
    try {
      const builderConfig: ElectronBuilderConfig = {
        appId: envConfig.appBundleId,
        productName: envConfig.PRODUCT_NAME,
        copyright: "Copyright 2018 Marine Online Pte. Ltd.",
        directories: {
          output: `../BMO-MO-APP-RELEASES/${envConfig.API_ENV}`,
        },
        files: [
          "release/**/*",
          "node_modules/**/*",
          "package.json"
        ],
        extraResources: [
          {
            from: "resources",
            to: "resources",
            filter: [
              "**/*"
            ]
          }
        ],
        extraMetadata: {
          name: envConfig.name,
        },

        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64","ia32"]
            },
            {
              target: "portable",
              arch: ["x64"]
            }
          ],
          icon: "resources/icon.png",
          forceCodeSigning: false,
          verifyUpdateCodeSignature: false,
          requestedExecutionLevel: "asInvoker"
        },

        mac: {
          target: [
            {
              target: "dmg",
              arch: ["x64", "arm64"]
            },
            {
              target: "zip",
              arch: ["x64", "arm64"]
            }
          ],
          icon: "resources/icon.png",
          category: "public.app-category.productivity"
        },

        linux: {
          target: [
            {
              target: "AppImage",
              arch: ["x64"]
            },
            {
              target: "deb",
              arch: ["x64"]
            },
            {
              target: "rpm",
              arch: ["x64"]
            }
          ],
          icon: "resources/icon.png",
          category: "Utility",
          maintainer: "TonyYang1985 <yangxindev@gmail.com>",
          vendor: "TonyYang1985",
          synopsis: "基于Electron构建的现代化桌面应用",
          description: "My Awesome App是一个基于Electron构建的跨平台桌面应用，提供现代化的用户界面和丰富的功能。支持Windows、macOS和Linux平台，内置自动更新功能。"
        },
        nsis: {
          oneClick: false,
          perMachine: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: "always",
          createStartMenuShortcut: true,
          shortcutName: "${productName}",
          deleteAppDataOnUninstall: false,
          runAfterFinish: true,
          menuCategory: "应用程序",
          installerIcon: "resources/icon.ico",
          uninstallerIcon: "resources/icon.ico"
        },
        
        publish: [
          {
            provider: "generic",
            url: `${this.domain}/nucleus/${this.packageInfo.name}/${envConfig.CHANNEL_ID}/win32/x64/`,
          },
        ],
      };

      // 写入 electron-builder.json
      const configPath = "./electron-builder.json";
      await fs.writeFile(
        configPath,
        JSON.stringify(builderConfig, null, 4),
        "utf8"
      );

      console.log(
        `🔧 Electron Builder 配置已生成: ${configPath} (${envConfig.API_ENV})`
      );

      // 复制环境对应的图标
      await this.copyEnvironmentIcon(envConfig);
    } catch (error) {
      throw new Error(
        `生成 Electron Builder 配置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 复制环境对应的图标文件
   */
  private async copyEnvironmentIcon(
    envConfig: EnvironmentConfig
  ): Promise<void> {
    try {
      // 图标文件选择逻辑（保持与原代码一致）
      const iconName = this.getIconName(envConfig.API_ENV);
      const sourceIconPath = `./assets/${iconName}.ico`;
      const targetIconPath = "./build/icon.ico";

      // 确保构建目录存在
      await this.ensureDirectoryExists("./build");

      // 复制图标文件
      await fs.copyFile(sourceIconPath, targetIconPath);

      console.log(`🎨 图标已复制: ${sourceIconPath} → ${targetIconPath}`);
    } catch (error) {
      throw new Error(
        `复制图标失败: ${error instanceof Error ? error.message : String(error)}`
      );
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
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
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
  ├── 更新域名: ${this.domain}
  └── 输出目录: ../BMO-MO-APP-RELEASES/${environment}
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
    const generator = new ConfigurationGenerator();

    // 显示配置摘要
    console.log(generator.getConfigurationSummary(environment));

    // 生成配置
    await generator.setConfig(environment);
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
    console.log("  npm run config:ts:LOCAL");
    console.log("  tsx src/scripts/start.ts LOCAL");
    console.log("  API_ENV=LOCAL tsx src/scripts/start.ts");
    console.log("支持的环境: LOCAL, DEV, SIT, UAT, PROD, DEMO");
    process.exit(1);
  }

  return environment as Environment;
}

/**
 * 兼容性导出 - 保持与原 start.js 的接口一致
 */
export async function setConfig(env: string): Promise<string> {
  const generator = new ConfigurationGenerator();
  return await generator.setConfig(env as Environment);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 致命错误:", error);
    process.exit(1);
  });
}

export default ConfigurationGenerator;
