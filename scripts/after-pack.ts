import * as fs from 'fs-extra';
import * as path from 'path';

interface AfterPackContext {
  electronPlatformName: string;
  appOutDir: string;
  packager: {
    appInfo: {
      productFilename: string;
    };
  };
}

export default async function afterPack(context: AfterPackContext): Promise<void> {
  const { electronPlatformName, appOutDir, packager } = context;
  
  console.log(`🔧 After pack hook executed for ${electronPlatformName}`);
  console.log(`📁 App output directory: ${appOutDir}`);
  console.log(`📦 App name: ${packager.appInfo.productFilename}`);
  
  // Add any post-packaging logic here
  try {
    // Example: Copy additional resources
    const assetsPath = path.join(appOutDir, '..', '..', 'assets');
    if (await fs.pathExists(assetsPath)) {
      console.log('📋 Copying additional assets...');
      // Add copy logic here if needed
    }
    
    // Example: Platform-specific operations
    switch (electronPlatformName) {
      case 'darwin':
        console.log('🍎 macOS-specific post-pack operations');
        break;
      case 'win32':
        console.log('🪟 Windows-specific post-pack operations');
        break;
      case 'linux':
        console.log('🐧 Linux-specific post-pack operations');
        break;
    }
    
    console.log('✅ After pack operations completed successfully');
  } catch (error) {
    console.error('❌ After pack operations failed:', error);
    throw error;
  }
}
