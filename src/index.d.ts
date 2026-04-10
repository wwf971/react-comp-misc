export * from './index.js';
export { default as CellDropdown } from './layout/folder/CellEditable.jsx';

export type PathSegment = {
  name: string;
  id?: string;
  [key: string]: unknown;
};

export type PathData = {
  segments: PathSegment[];
};

export function defaultParsePathStrToPathData(raw: string): PathData | null;

export function buildCanonicalPathStrFromSegs(
  segmentList: PathSegment[] | undefined,
  options: {
    addSlashBeforeFirstSeg: boolean;
    appendTrailingSlash: boolean;
    separator: string;
  }
): string;

export type PathChangeCommitHandler = (pathData: PathData) => Promise<boolean | void>;
export type { TypeConversionBehavior, ConversionMenuRequest } from './layout/json/JsonContext';
export type { MenuItem, MenuItemSingle, MenuItemSubmenu } from './menu/Menu';
export type { MenuCompItem, MenuCompItemSingle, MenuCompItemSubmenu } from './menu/MenuComp';
export type { DatabaseSetupProps, TableConfig } from './database/DatabaseSetup';
export type { TableManageProps } from './database/TableManage';
