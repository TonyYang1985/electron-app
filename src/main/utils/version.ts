import * as semver from "semver";
import * as path from "path";
import * as log from "electron-log";
import { MO_APP_STATIC_VERSION, STATIC_FOLDER } from "./constants";
import {
  getMostRecentFolderName,
  getAllFolderNamesWithPrefix,
  deleteFolder,
  folderExists,
} from "./folder";

const defaultVersion: string = MO_APP_STATIC_VERSION;

export function compareVersion(a: string, b: string): boolean {
  return semver.gt(a, b);
}

export function getCurrentVersion(): string {
  const folderName = getMostRecentFolderName(STATIC_FOLDER);
  if (folderName === null) {
    return defaultVersion;
  } else {
    const currentVersion = folderName.replace("static-", "");
    if (compareVersion(defaultVersion, currentVersion)) {
      return defaultVersion;
    }
    return currentVersion;
  }
}

export function getLatestStaticFolder(): string {
  const folderName = getMostRecentFolderName(STATIC_FOLDER);
  if (folderName === null) {
    return path.join(__dirname, "../../static");
  } else {
    const currentVersion = folderName.replace("static-", "");
    if (compareVersion(defaultVersion, currentVersion)) {
      return path.join(__dirname, "../../static");
    }
    return path.join(STATIC_FOLDER, folderName);
  }
}

export function cleanStaticVersions(): void {
  log.info("cleanStaticVersions init", STATIC_FOLDER);

  const dir = STATIC_FOLDER;
  let latestFolderName = getMostRecentFolderName(STATIC_FOLDER);

  if (latestFolderName !== null) {
    const latestVersion = latestFolderName.replace("static-", "");
    if (compareVersion(defaultVersion, latestVersion)) {
      latestFolderName = `static-${defaultVersion}`;
    }
  }

  log.info("cleanStaticVersions - latestFolderName", latestFolderName);

  if (!folderExists(dir)) {
    return;
  }

  const folderNames = getAllFolderNamesWithPrefix(dir, "static");
  if (!folderNames || folderNames.length === 0) {
    return;
  }

  for (const folderName of folderNames) {
    if (folderName !== latestFolderName) {
      deleteFolder(dir, folderName);
    }
  }
}
