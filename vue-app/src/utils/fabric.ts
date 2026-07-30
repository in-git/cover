// ===== fabric 5.x 导出 shim =====
// 问题: @types/fabric 使用 `export as namespace fabric` (UMD 全局) +
//   `export import fabric = require("./fabric-impl")` 双重导出, 直接 import 会与
//   UMD 全局名冲突 (isolatedModules 下 TS2866 / TS2686).
// 解决: 此 shim 统一以宽松类型 (any) 导出 fabric 命名空间, 隔离冲突.
// 运行时: fabric dist/fabric.js 通过 `exports.fabric = fabric` (CJS 命名导出) 暴露.
// 原项目为纯 JS (fabric 作为 CDN 全局变量使用), 此处保留同等宽松度.
import * as fabricPkg from 'fabric';

// 优先取命名导出 fabric, 兜底 default (Vite CJS→ESM 互操作)
const fabricInstance: any =
  (fabricPkg as any).fabric ?? (fabricPkg as any).default ?? fabricPkg;

export const fabric: any = fabricInstance;
export default fabricInstance;
