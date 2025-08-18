import * as fs from 'fs-extra';
import * as path from 'path';

interface BeforeBuildContext {
  electronPlatformName: string;
  arch: string;
  appDir: string;
}

export default async function beforeBuild(context: BeforeBuildContext): Promise<void> {
  const { electronPlatformName, arch, appDir } = context;
  
  console.log(`🚀 Before build hook executed for ${electronPlatformName}-${arch}`);
  console.log(`📁 App directory: ${appDir}`);
  
  try {
    // Environment validation
    console.log('🔍 Validating build environment...');
    
    // Check if required directories exist
    const requiredDirs = ['dist', 'assets'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(appDir, dir);
      if (!(await fs.pathExists(dirPath))) {
        console.log(`📁 Creating missing directory: ${dir}`);
        await fs.ensureDir(dirPath);
      }
    }
    
    // Platform-specific pre-build operations
    switch (electronPlatformName) {
      case 'darwin':
        console.log('🍎 macOS pre-build setup');
        // Add macOS-specific setup here
        break;
      case 'win32':
        console.log('🪟 Windows pre-build setup');
        // Add Windows-specific setup here
        break;
      case 'linux':
        console.log('🐧 Linux pre-build setup');
        // Add Linux-specific setup here
        break;
    }
    
    // Generate build info
    const buildInfo = {
      platform: electronPlatformName,
      arch,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    };
    
    const buildInfoPath = path.join(appDir, 'build-info.json');
    await fs.writeJson(buildInfoPath, buildInfo, { spaces: 2 });
    console.log('📝 Build info generated');
    
    console.log('✅ Before build operations completed successfully');
  } catch (error) {
    console.error('❌ Before build operations failed:', error);
    throw error;
  }
}
