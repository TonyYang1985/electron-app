// scripts/after-all-artifact-build.ts
import { promises as fs } from 'fs';
import { join } from 'path';

interface BuildResult {
  configuration?: {
    productName?: string;
  };
  platformToTargets: Map<any, any>;
  artifactPaths?: string[];
  outDir: string;
}

export default async function afterAllArtifactBuild(buildResult: BuildResult): Promise<void> {
  console.log('🎯 After all artifacts build hook executed');
  
  try {
    // 输出构建结果信息
    console.log('📊 Build Summary:');
    console.log(`Configuration: ${buildResult.configuration?.productName}`);
    console.log(`Output directory: ${buildResult.outDir}`);
    
    // 遍历所有平台和目标
    for (const [platform, targets] of buildResult.platformToTargets) {
      console.log(`📱 Platform: ${platform}`);
      if (Array.isArray(targets)) {
        targets.forEach((target, index) => {
          console.log(`  🎯 Target ${index + 1}: ${target.name || target.toString()}`);
        });
      } else {
        console.log(`  🎯 Target: ${targets.toString()}`);
      }
    }
    
    // 示例：生成构建报告
    const reportPath = join(process.cwd(), 'build-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      platforms: Array.from(buildResult.platformToTargets.keys()),
      targets: Array.from(buildResult.platformToTargets.entries()).map(([platform, targets]) => ({
        platform,
        targets: Array.isArray(targets) ? targets.map(t => t.toString()) : [targets.toString()]
      })),
      artifactPaths: buildResult.artifactPaths || [],
      outDir: buildResult.outDir
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Build report saved: ${reportPath}`);
    
    // 在这里添加你的后处理逻辑
    // 例如：
    // - 上传构建产物
    // - 发送通知
    // - 更新版本记录
    
  } catch (error) {
    console.error('❌ After all artifacts build hook error:', error);
  }
}