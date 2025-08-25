// 平台检测常量
export const isMac: boolean = process.platform === "darwin";
export const isWin: boolean = process.platform === "win32";
export const isLinux: boolean = process.platform === "linux";

// 默认导出对象（保持向后兼容）
export default { isMac, isWin, isLinux };
