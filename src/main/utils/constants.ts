import { app } from "electron";
const pkg = require("../../package.json");
//const config = require('../../config.json');

const API_ENV = process.env.API_ENV;
const CHANNEL_ID = process.env.CHANNEL_ID;
const DOMAIN: string = pkg.minio;
const suffix: string =
  process.platform === "darwin"
    ? `/RELEASES.json?method=JSON&version=${app.getVersion()}`
    : "";

export const MO_IS_PROD: boolean = API_ENV === "PROD";
export const MO_APP_VERSION: string = pkg.version;
export const MO_APP_STATIC_VERSION: string = pkg.staticVersion;

export const UPDATE_URL = `${DOMAIN}/nucleus/bmo-mo-app/${CHANNEL_ID}/${process.platform}/${process.arch}${suffix}`;
export const STATIC_UPDATE_URL = `${DOMAIN}/bmo-mo-app/${API_ENV}`;

export const USER_DATA_FOLDER: string = app.getPath("userData");

export const STATIC_FOLDER = `${USER_DATA_FOLDER}/static`;

export const STATIC_FILE_PREFIX = "static";

export const STATIC_FILE_EXT = "zip";

export const DOWNLOADS_FOLDER: string = app.getPath("downloads");
