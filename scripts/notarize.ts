import { notarize } from '@electron/notarize';

interface AfterPackContext {
  electronPlatformName: string;
  appOutDir: string;
  packager: {
    appInfo: {
      productFilename: string;
    };
  };
}

export default async function notarizing(context: AfterPackContext): Promise<void> {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // Skip notarization if no credentials are provided
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASS) {
    console.log('Skipping notarization - no Apple ID credentials provided');
    return;
  }

  try {
    await notarize({
      tool: 'notarytool',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS,
      teamId: process.env.APPLE_TEAM_ID || 'XXXXXXXXXX', // Replace with your team ID
    });
    console.log('✅ Notarization completed successfully');
  } catch (error) {
    console.error('❌ Notarization failed:', error);
    throw error;
  }
}
