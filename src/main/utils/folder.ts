import * as fs from "fs-extra";
import * as path from "path";
import * as mkdirp from "mkdirp";
import * as log from "electron-log";
import extract from "extract-zip";
import { STATIC_FILE_PREFIX } from "./constants";

// 类型定义
export interface ExtractOptions {
  dir: string;
  defaultDirMode?: number;
  defaultFileMode?: number;
  onEntry?: (entry: any, zipfile: any) => void;
}

/**
 * 检查文件夹是否存在
 * @param dir 目录路径
 * @returns 是否存在
 */
export function folderExists(dir: string): boolean {
  try {
    log.info("检查文件夹存在性:", dir);
    return fs.existsSync(dir);
  } catch (error) {
    log.error("检查文件夹存在性失败:", error);
    return false;
  }
}

/**
 * 错误处理回调函数
 * @param err 错误对象
 */
function cbErrorHandler(err: Error | null): void {
  if (err) {
    log.error("文件操作错误:", err);
  }
}

/**
 * 获取最新的文件夹名称
 * @param dir 目录路径
 * @param prefix 文件夹前缀，默认为 'static'
 * @returns 最新文件夹名称或 null
 */
export function getMostRecentFolderName(
  dir: string,
  prefix: string = STATIC_FILE_PREFIX
): string | null {
  try {
    if (!folderExists(dir)) {
      log.info("文件夹不存在，创建目录:", dir);
      mkdirp.sync(dir);
      log.info("创建目录:", dir);
      return null;
    }

    log.info("文件夹存在，查找最新文件夹:", prefix);
    const files = getAllFolderNamesWithPrefix(dir, prefix);
    if (!files || files.length === 0) {
      log.info("未找到匹配的文件夹:", prefix);
      return null;
    }

    // 手动实现查找最新文件，避免 underscore 类型问题
    let mostRecentFile: string | null = null;
    let mostRecentTime = 0;

    for (const file of files) {
      const fullpath = path.join(dir, file);
      const stats = fs.statSync(fullpath);
      const ctime = stats.ctime.getTime();

      if (ctime > mostRecentTime) {
        mostRecentTime = ctime;
        mostRecentFile = file;
      }
    }

    log.info("找到最新文件夹:", mostRecentFile);
    return mostRecentFile;
  } catch (error) {
    log.error("获取最新文件夹失败:", error);
    return null;
  }
}

/**
 * 异步版本的获取最新文件夹
 * @param dir 目录路径
 * @param prefix 文件夹前缀，默认为 'static'
 * @returns Promise<最新文件夹名称或 null>
 */
export async function getMostRecentFolderNameAsync(
  dir: string,
  prefix: string = STATIC_FILE_PREFIX
): Promise<string | null> {
  try {
    if (!(await fs.pathExists(dir))) {
      await fs.ensureDir(dir);
      log.info("创建目录 (async):", dir);
      return null;
    }

    log.info("文件夹存在，查找最新文件夹:", prefix);
    const files = await getAllFolderNamesWithPrefixAsync(dir, prefix);
    if (files.length === 0) {
      log.info("未找到匹配的文件夹 (async):", prefix);
      return null;
    }

    log.info("找到匹配的文件夹 (async):", prefix);
    const filesWithStats = await Promise.all(
      files.map(async (file) => {
        const fullpath = path.join(dir, file);
        const stats = await fs.stat(fullpath);
        return {
          name: file,
          ctime: stats.ctime.getTime(),
        };
      })
    );

    const mostRecent = filesWithStats.reduce((prev, current) =>
      prev.ctime > current.ctime ? prev : current
    );

    log.info("找到最新文件夹 (async):", mostRecent.name);
    return mostRecent.name;
  } catch (error) {
    log.error("获取最新文件夹失败 (async):", error);
    return null;
  }
}

/**
 * 提取 ZIP 文件（现代 Promise 版本）
 * @param zip ZIP 文件路径
 * @param options 提取选项
 * @param cb 成功回调函数
 */
export async function extractZip(
  zip: string,
  options: ExtractOptions,
  cb?: () => void
): Promise<void> {
  try {
    log.info("开始提取 ZIP:", zip);
    // 确保目标目录存在
    await fs.ensureDir(options.dir);
    await extract(zip, options);
    log.info("成功提取:", zip);
    // 执行回调函数
    if (cb) {
      cb();
    }
    log.info("删除原始 ZIP 文件:", zip);
    // 删除原始 ZIP 文件
    await deleteFileAsync(zip);
  } catch (err) {
    log.error("提取失败:", err);
    throw new Error(`提取 ZIP 文件失败: ${zip} - ${err}`);
  }
}

/**
 * 兼容旧版本的 extractZip
 * @param zip ZIP 文件路径
 * @param options 提取选项
 * @param cb 回调函数
 */
export function extractZipLegacy(
  zip: string,
  options: ExtractOptions,
  cb: () => void
): void {
  // 首先尝试现代 Promise 版本
  extractZip(zip, options, cb).catch((modernError) => {
    log.warn("现代版本失败，尝试旧版本 API:", modernError.message);

    try {
      // 类型断言以支持旧版本的回调风格
      (extract as any)(zip, options, (err?: Error) => {
        if (err) {
          log.error("旧版本提取也失败:", err);
        } else {
          log.info("旧版本成功提取:", zip);
          cb();
          deleteFile(zip);
        }
      });
    } catch (legacyError) {
      log.error("所有版本都失败:", legacyError);
    }
  });
}

/**
 * 删除文件（同步版本）
 * @param filePath 文件路径
 */
export function deleteFile(filePath: string): void {
  try {
    log.info("删除文件:", filePath);
    fs.unlink(filePath, cbErrorHandler);
  } catch (error) {
    log.error("删除文件失败:", filePath, error);
  }
}

/**
 * 删除文件（异步版本）
 * @param filePath 文件路径
 */
export async function deleteFileAsync(filePath: string): Promise<void> {
  try {
    log.info("删除文件 (async):", filePath);
    if (await fs.pathExists(filePath)) {
      await fs.unlink(filePath);
      log.info("文件已删除:", filePath);
    }
  } catch (error) {
    log.error("删除文件失败 (async):", filePath, error);
    throw error;
  }
}

/**
 * 删除文件夹（同步版本）
 * @param dir 父目录路径
 * @param folderName 要删除的文件夹名称
 */
export function deleteFolder(dir: string, folderName: string): void {
  try {
    log.info("删除文件夹:", path.join(dir, folderName));
    const fullpath = path.join(dir, folderName);
    if (isDirectory(fullpath)) {
      fs.removeSync(fullpath);
      log.info("deleted folder", fullpath);
    } else {
      log.warn("不是有效目录:", fullpath);
    }
  } catch (error) {
    log.error("删除文件夹失败:", path.join(dir, folderName), error);
  }
}

/**
 * 删除文件夹（异步版本）
 * @param dir 父目录路径
 * @param folderName 要删除的文件夹名称
 */
export async function deleteFolderAsync(
  dir: string,
  folderName: string
): Promise<void> {
  try {
    const fullpath = path.join(dir, folderName);
    if (await isDirectoryAsync(fullpath)) {
      await fs.remove(fullpath);
      log.info("文件夹已删除 (async):", fullpath);
    } else {
      log.warn("不是有效目录 (async):", fullpath);
    }
  } catch (error) {
    log.error("删除文件夹失败 (async):", path.join(dir, folderName), error);
    throw error;
  }
}

/**
 * 获取带指定前缀的文件夹名称列表（同步版本）
 * @param dir 目录路径
 * @param prefix 文件夹前缀
 * @returns 文件夹名称数组
 */
export function getAllFolderNamesWithPrefix(
  dir: string,
  prefix: string
): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter(
        (file) => isDirectory(path.join(dir, file)) && file.startsWith(prefix)
      );
  } catch (err) {
    log.error("读取目录失败:", dir, err);
    return [];
  }
}

/**
 * 获取带指定前缀的文件夹名称列表（异步版本）
 * @param dir 目录路径
 * @param prefix 文件夹前缀
 * @returns Promise<文件夹名称数组>
 */
export async function getAllFolderNamesWithPrefixAsync(
  dir: string,
  prefix: string
): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    const folders: string[] = [];

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if ((await isDirectoryAsync(fullPath)) && file.startsWith(prefix)) {
        folders.push(file);
      }
    }

    return folders;
  } catch (error) {
    log.error("读取目录失败 (async):", dir, error);
    return [];
  }
}

/**
 * 检查路径是否为目录（同步版本）
 * @param dirPath 路径
 * @returns 是否为目录
 */
export function isDirectory(dirPath: string): boolean {
  try {
    return fs.lstatSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * 检查路径是否为目录（异步版本）
 * @param dirPath 路径
 * @returns Promise<是否为目录>
 */
export async function isDirectoryAsync(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 清理旧文件夹，只保留最新的 N 个
 * @param dir 目录路径
 * @param prefix 文件夹前缀
 * @param keepCount 保留数量，默认为 3
 */
export async function cleanupOldFolders(
  dir: string,
  prefix: string = STATIC_FILE_PREFIX,
  keepCount: number = 3
): Promise<void> {
  try {
    const folders = await getAllFolderNamesWithPrefixAsync(dir, prefix);
    if (folders.length <= keepCount) {
      log.info("文件夹数量未超过限制，无需清理");
      return;
    }

    // 获取所有文件夹及其创建时间
    const foldersWithStats = await Promise.all(
      folders.map(async (folder) => {
        const fullPath = path.join(dir, folder);
        const stats = await fs.stat(fullPath);
        return {
          name: folder,
          path: fullPath,
          ctime: stats.ctime.getTime(),
        };
      })
    );

    // 按时间排序，保留最新的
    foldersWithStats.sort((a, b) => b.ctime - a.ctime);
    const foldersToDelete = foldersWithStats.slice(keepCount);

    // 删除旧文件夹
    for (const folder of foldersToDelete) {
      await fs.remove(folder.path);
      log.info("清理旧文件夹:", folder.name);
    }

    log.info(`清理完成，删除了 ${foldersToDelete.length} 个旧文件夹`);
  } catch (error) {
    log.error("清理旧文件夹失败:", error);
    throw error;
  }
}

/**
 * 获取目录统计信息
 * @param dir 目录路径
 * @param prefix 文件夹前缀
 * @returns 目录统计信息
 */
export async function getDirectoryStats(
  dir: string,
  prefix: string = STATIC_FILE_PREFIX
): Promise<{
  exists: boolean;
  totalFolders: number;
  prefixFolders: number;
  mostRecent: string | null;
  oldestFolder: string | null;
}> {
  try {
    const exists = await fs.pathExists(dir);
    if (!exists) {
      return {
        exists: false,
        totalFolders: 0,
        prefixFolders: 0,
        mostRecent: null,
        oldestFolder: null,
      };
    }

    const allFiles = await fs.readdir(dir);
    const allFolders = [];

    for (const file of allFiles) {
      const fullPath = path.join(dir, file);
      if (await isDirectoryAsync(fullPath)) {
        allFolders.push(file);
      }
    }

    const prefixFolders = allFolders.filter((f) => f.startsWith(prefix));
    const mostRecent = await getMostRecentFolderNameAsync(dir, prefix);

    let oldestFolder: string | null = null;
    if (prefixFolders.length > 0) {
      const foldersWithStats = await Promise.all(
        prefixFolders.map(async (folder) => {
          const stats = await fs.stat(path.join(dir, folder));
          return { name: folder, ctime: stats.ctime.getTime() };
        })
      );

      const oldest = foldersWithStats.reduce((prev, current) =>
        prev.ctime < current.ctime ? prev : current
      );
      oldestFolder = oldest.name;
    }

    return {
      exists: true,
      totalFolders: allFolders.length,
      prefixFolders: prefixFolders.length,
      mostRecent,
      oldestFolder,
    };
  } catch (error) {
    log.error("获取目录统计信息失败:", error);
    throw error;
  }
}

// 导出所有类型和常量
export { STATIC_FILE_PREFIX as DEFAULT_PREFIX };
