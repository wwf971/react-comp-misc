export * from './index.js';
export { default as CellDropdown } from './layout/folder/CellEditable.jsx';
import type { ComponentType } from 'react';

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
export type { MenuItem, MenuItemSingle, MenuItemSubmenu } from './component/menu/Menu';
export type { MenuCompItem, MenuCompItemSingle, MenuCompItemSubmenu } from './component/menu/MenuComp';
export type { DatabaseSetupProps, TableConfig } from './database/DatabaseSetup';
export type { TableManageProps } from './database/TableManage';
export type DbConnectionCardActionItem = {
  id: string;
  labelText?: string;
  isVisible?: boolean;
  isDisabled?: boolean;
  isDanger?: boolean;
};
export type DbConnectionCardProps = {
  titleText?: string;
  statusTagText?: string;
  keyValuesData?: Array<{ key: string; value: string }>;
  actionItems?: DbConnectionCardActionItem[];
  isLocked?: boolean;
  onAction?: (actionId: string, actionItem: DbConnectionCardActionItem) => Promise<void> | void;
};
export const DbConnectionCard: ComponentType<DbConnectionCardProps>;
