// scripts/after-pack.ts
import { AfterPackContext } from 'electron-builder';

export default async function afterPack(context: AfterPackContext): Promise<void> {
  console.log('📦 After pack hook executed');
  console.log(`Platform: ${context.packager.platform.name}`);
  console.log(`Architecture: ${context.arch}`);
  console.log(`Output directory: ${context.appOutDir}`);
  
  // 在这里添加你的自定义逻辑
  // 例如：
  // - 复制额外的文件
  // - 修改文件权限
  // - 创建符号链接
  
  try {
    // 示例：输出构建信息
    const packageJson = require('../package.json');
    console.log(`📋 Application: ${packageJson.name} v${packageJson.version}`);
    console.log(`🏗️ Build completed for ${context.packager.platform.name}`);
  } catch (error) {
    console.error('❌ After pack hook error:', error);
  }
}