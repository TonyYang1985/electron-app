import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface AfterAllArtifactBuildContext {
  outDir: string;
  artifactPaths: string[];
  platformToTargets: Map<any, any>;
  configuration: any;
}

interface ArtifactInfo {
  name: string;
  path: string;
  size: number;
  checksum: string;
  platform: string;
  arch: string;
}

export default async function afterAllArtifactBuild(context: AfterAllArtifactBuildContext): Promise<void> {
  const { outDir, artifactPaths, platformToTargets } = context;
  
  console.log(`🎉 After all artifact build hook executed`);
  console.log(`📁 Output directory: ${outDir}`);
  console.log(`📦 Built artifacts count: ${artifactPaths.length}`);
  
  try {
    const artifactInfos: ArtifactInfo[] = [];
    
    // Process each artifact
    for (const artifactPath of artifactPaths) {
      console.log(`🔍 Processing artifact: ${path.basename(artifactPath)}`);
      
      const stats = await fs.stat(artifactPath);
      const fileBuffer = await fs.readFile(artifactPath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Extract platform and arch from filename or path
      const fileName = path.basename(artifactPath);
      let platform = 'unknown';
      let arch = 'unknown';
      
      if (fileName.includes('darwin') || fileName.includes('mac')) platform = 'darwin';
      else if (fileName.includes('win') || fileName.includes('.exe')) platform = 'win32';
      else if (fileName.includes('linux') || fileName.includes('.deb') || fileName.includes('.rpm')) platform = 'linux';
      
      if (fileName.includes('x64') || fileName.includes('amd64')) arch = 'x64';
      else if (fileName.includes('arm64')) arch = 'arm64';
      else if (fileName.includes('ia32') || fileName.includes('i386')) arch = 'ia32';
      
      const artifactInfo: ArtifactInfo = {
        name: fileName,
        path: artifactPath,
        size: stats.size,
        checksum,
        platform,
        arch
      };
      
      artifactInfos.push(artifactInfo);
      console.log(`  ✅ ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    // Generate build report
    const buildReport = {
      buildTime: new Date().toISOString(),
      totalArtifacts: artifactInfos.length,
      totalSize: artifactInfos.reduce((sum, info) => sum + info.size, 0),
      platforms: [...new Set(artifactInfos.map(info => info.platform))],
      architectures: [...new Set(artifactInfos.map(info => info.arch))],
      artifacts: artifactInfos
    };
    
    const reportPath = path.join(outDir, 'build-report.json');
    await fs.writeJson(reportPath, buildReport, { spaces: 2 });
    console.log(`📊 Build report generated: ${reportPath}`);
    
    // Generate checksums file
    const checksumsPath = path.join(outDir, 'checksums.txt');
    const checksumLines = artifactInfos.map(info => `${info.checksum}  ${info.name}`);
    await fs.writeFile(checksumsPath, checksumLines.join('\n'));
    console.log(`🔐 Checksums file generated: ${checksumsPath}`);
    
    console.log(`✅ After all artifact build operations completed successfully`);
    console.log(`📈 Total build size: ${(buildReport.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ After all artifact build operations failed:', error);
    throw error;
  }
}