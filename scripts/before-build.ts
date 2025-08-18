// scripts/before-build.ts
import { BeforeBuildContext } from 'electron-builder';
import { promises as fs } from 'fs';
import { join } from 'path';

export default async function beforeBuild(context: BeforeBuildContext): Promise<void> {
  console.log('🔨 Before build hook executed');
  console.log(`Platform: ${context.platform.name}`);
  console.log(`Architecture: ${context.arch}`);
  
  try {
    // 示例：确保必要的目录存在
    const buildDir = join(process.cwd(), 'build');
    await fs.mkdir(buildDir, { recursive: true });
    console.log(`📁 Build directory ensured: ${buildDir}`);
    
    // 示例：检查必要的资源文件
    const assetsDir = join(process.cwd(), 'assets');
    try {
      await fs.access(assetsDir);
      console.log('✅ Assets directory found');
    } catch {
      console.warn('⚠️ Assets directory not found');
    }
    
    // 在这里添加你的预构建逻辑
    // 例如：
    // - 清理临时文件
    // - 预处理资源
    // - 生成配置文件
    
  } catch (error) {
    console.error('❌ Before build hook error:', error);
    throw error; // 如果预构建失败，停止构建过程
  }
}