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
export type FolderHeaderProps = {
  columns: Record<string, { data: unknown; align?: 'left' | 'center' | 'right' }>;
  columnsOrder: string[];
  columnsSizeInit?: Record<string, { width?: number; minWidth?: number; resizable?: boolean }>;
  allowColumnReorder?: boolean;
  isLastColumnFilled?: boolean;
};
export type FolderViewProps = {
  columns?: Record<string, { data: unknown; align?: 'left' | 'center' | 'right' }>;
  columnsOrder?: string[];
  columnsSizeInit?: Record<string, { width?: number; minWidth?: number; resizable?: boolean }>;
  rows?: Array<{ id: string; data?: Record<string, unknown> }>;
  selectionMode?: 'single' | 'multiple' | 'none';
  selectedRowIds?: string[];
  selectedRowId?: string;
  onSelectedRowIdsChange?: (nextRowIds: string[]) => void;
  onRowDoubleClick?: (rowId: string) => void;
  bodyHeight?: number;
  showStatusBar?: boolean;
  listOnly?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  showStatusItemCount?: boolean;
  isLastColumnFilled?: boolean;
  onDataChangeRequest?: (type: string, params: Record<string, unknown>) => Promise<{ code: number }> | { code: number };
  allowColumnReorder?: boolean;
  allowRowReorder?: boolean;
  onRowContextMenu?: (event: unknown, rowId: string) => void;
  contextMenuItems?: unknown[];
  onRowInteraction?: (event: unknown) => void;
  isLocked?: boolean;
};
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
  statusMessage?: {
    status?: 'idle' | 'loading' | 'success' | 'error';
    messageText: string;
  } | null;
  keyValuesData?: Array<{ key: string; value: string }>;
  actionItems?: DbConnectionCardActionItem[];
  isLocked?: boolean;
  onDismissStatusMessage?: () => void;
  onAction?: (actionId: string, actionItem: DbConnectionCardActionItem) => Promise<void> | void;
};
export const DbConnectionCard: ComponentType<DbConnectionCardProps>;
export const FolderHeader: ComponentType<FolderHeaderProps>;
export const FolderView: ComponentType<FolderViewProps>;
export type MetadataKeyValuesData = {
  titleText?: string;
  rows?: Array<{ id: string; key: string; value: string }>;
  selectedRowId?: string | null;
  messageState?: {
    status?: 'idle' | 'loading' | 'success' | 'error';
    messageText?: string;
  } | null;
};
export type MetadataKeyValuesConfig = {
  isLocked?: boolean;
  isEditable?: boolean;
  keyColWidth?: string;
  requestTimeoutMs?: number;
};
export type MetadataKeyValuesProps = {
  data?: MetadataKeyValuesData;
  config?: MetadataKeyValuesConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const MetadataKeyValues: ComponentType<MetadataKeyValuesProps>;
