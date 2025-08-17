import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, ForgeTemplate } from '../shared/types';


const generateForgeConfig = (): void => {
  try {
    // 读取应用配置
    const config: AppConfig = JSON.parse(
      fs.readFileSync('./config.json', 'utf8')
    );
    
    // 读取 forge 配置模板
    const template: ForgeTemplate = JSON.parse(
      fs.readFileSync('./env/forge.config.template.json', 'utf8')
    );
    
    // 替换模板变量
    const forgeConfig = JSON.stringify(template, null, 2)
      .replace(/\$\{PRODUCT_NAME\}/g, config.PRODUCT_NAME)
      .replace(/\$\{name\}/g, config.name)
      .replace(/\$\{appBundleId\}/g, config.appBundleId);
    
    // 解析并重新格式化
    const finalConfig = JSON.parse(forgeConfig);
    
    // 解析路径
    finalConfig.packagerConfig.icon = path.resolve(__dirname, 'assets', 'mol');
    finalConfig.makers.forEach((maker: any) => {
      if (maker.config.setupIcon) {
        maker.config.setupIcon = path.resolve(__dirname, 'assets', 'mol.ico');
      }
      if (maker.config.options?.icon) {
        maker.config.options.icon = path.resolve(__dirname, 'assets', 'mol.png');
      }
    });
    
    // 写入最终配置
    fs.writeFileSync(
      './forge.config.json',
      JSON.stringify(finalConfig, null, 2),
      'utf8'
    );
    
    console.log('✅ Generated forge.config.json successfully');
  } catch (error) {
    console.error('❌ Failed to generate forge.config.json:', error);
    process.exit(1);
  }
};

// 执行生成
generateForgeConfig();

export { generateForgeConfig };