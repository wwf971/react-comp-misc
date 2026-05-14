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

export const FileIcon: ComponentType<any>;
export const DeleteIcon: ComponentType<any>;
export const SearchIcon: ComponentType<any>;
export const ClearIcon: ComponentType<any>;
export const InfoIcon: ComponentType<any>;
export const InfoIconWithTooltip: ComponentType<any>;
export const SuccessIcon: ComponentType<any>;
export const ErrorIcon: ComponentType<any>;
export const UploadIcon: ComponentType<any>;
export const BackIcon: ComponentType<any>;
export const ForwardIcon: ComponentType<any>;
export const LeftIcon: ComponentType<any>;
export const RightIcon: ComponentType<any>;
export const UpIcon: ComponentType<any>;
export const DownIcon: ComponentType<any>;
export const EyeIcon: ComponentType<any>;
export const EyeOffIcon: ComponentType<any>;
export const CrossIcon: ComponentType<any>;
export const AddIcon: ComponentType<any>;
export const SpinningCircle: ComponentType<any>;
export const FolderIcon: ComponentType<any>;
export const EditIconNotepad: ComponentType<any>;
export const EditIcon: ComponentType<any>;
export const EditIconPen: ComponentType<any>;
export const PlusIcon: ComponentType<any>;
export const MinusIcon: ComponentType<any>;
export const DragIcon: ComponentType<any>;
export const PdfIcon: ComponentType<any>;
export const RefreshIcon: ComponentType<any>;
export const CheckIcon: ComponentType<any>;
export const CalendarIcon: ComponentType<any>;

export function get_local_timezone_int(...args: any[]): any;
export function format_date(...args: any[]): any;
export function get_cookie(...args: any[]): any;

export const MasterDetail: ComponentType<any>;
export const MasterDetailTab: ComponentType<any>;
export const MasterDetailSubTab: ComponentType<any>;
export const MasterDetailPanel: ComponentType<any>;
export const MasterDetailInfiLevel: ComponentType<any>;
export const MasterDetailInfiLevelTab: ComponentType<any>;
export const MasterDetailInfiLevelSubTab: ComponentType<any>;
export const MasterDetailInfiLevelPanel: ComponentType<any>;
export const TabsOnTop: ComponentType<any>;
export const TabsOnTopTab: ComponentType<any>;
export const TabsOnTopTabLabel: ComponentType<any>;

export const Login: ComponentType<any>;
export const ConfigPanel: ComponentType<any>;
export const ConfigPanelWithTabs: ComponentType<any>;
export const ConfigPanelWithTabGroups: ComponentType<any>;
export const ConfigPanelWithSubtabs: ComponentType<any>;
export const PathBar: ComponentType<any>;
export const KeyValues: ComponentType<any>;
export const KeyValuesComp: ComponentType<any>;
export const MetadataKeyValues: ComponentType<MetadataKeyValuesProps>;
export const EditableValueComp: ComponentType<any>;
export const EditableValueWithInfo: ComponentType<any>;
export const SelectableValue: ComponentType<any>;
export const SelectableValueComp: ComponentType<any>;
export const SearchableValue: ComponentType<any>;
export const SearchableValueComp: ComponentType<any>;
export const PanelToggle: ComponentType<any>;
export const PanelDual: ComponentType<any>;
export const PanelPopup: ComponentType<any>;
export const JsonComp: ComponentType<any>;
export const JsonKeyValueComp: ComponentType<any>;
export const JsonListItemComp: ComponentType<any>;
export const JsonTextComp: ComponentType<any>;
export const JsonNumberComp: ComponentType<any>;
export const JsonBoolComp: ComponentType<any>;
export const JsonNullComp: ComponentType<any>;
export const JsonRaw: ComponentType<any>;
export const JsonContextProvider: ComponentType<any>;
export function useJsonContext(...args: any[]): any;
export * from './layout/json/typeConvert';
export const JsonCompMobx: ComponentType<any>;

export function parseYamlToJson(...args: any[]): any;
export function parseJsonString(...args: any[]): any;
export function parseStringToJson(...args: any[]): any;
export function formatJson(...args: any[]): any;

export const Menu: ComponentType<any>;
export const MenuComp: ComponentType<any>;
export const DatabaseSetup: ComponentType<any>;
export const TableManage: ComponentType<any>;
export const BoolSlider: ComponentType<any>;
export const SegmentedControl: ComponentType<any>;
export const FolderBody: ComponentType<any>;
export const CellDropdown: ComponentType<any>;
export const TreeView: ComponentType<any>;
export const ItemList: ComponentType<ItemListProps>;
export const ItemTree: ComponentType<ItemTreeProps>;
export const HtmlRender: ComponentType<any>;
export const DateSelector: ComponentType<any>;
export const DateView: ComponentType<any>;
export const Radar: ComponentType<any>;

export function parsePathToSegments(...args: any[]): any;
export function navigateToPath(...args: any[]): any;
export function segmentsToPath(...args: any[]): any;
export function convertPathToMongoDotNotation(...args: any[]): any;
export function navigateToParentArray(...args: any[]): any;
export function isPathToArrayItem(...args: any[]): any;
export function extractDocId(...args: any[]): any;

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
  columnResizeDragMode?: 'preview' | 'immediate';
  columnResizeWidthMode?: 'natural' | 'local';
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
  columnResizeDragMode?: 'preview' | 'immediate';
  columnResizeWidthMode?: 'natural' | 'local';
};
export type SideListItemData = {
  key?: string;
  id?: string;
  label?: string;
  name?: string;
  description?: string;
  parentKey?: string | null;
  parentId?: string | null;
  [key: string]: unknown;
};
export type ItemListProps = {
  data?: {
    items?: SideListItemData[];
    selectedItemKey?: string;
  };
  config?: {
    titleText?: string;
    searchPlaceholder?: string;
    isSearchEnabled?: boolean;
    isHeaderVisible?: boolean;
  };
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
  items?: SideListItemData[];
  selectedItemKey?: string;
  onItemSelect?: (itemData: SideListItemData, itemKey: string) => Promise<void> | void;
  titleText?: string;
  headerExtraContent?: unknown;
  searchPlaceholder?: string;
  isSearchEnabled?: boolean;
  isHeaderVisible?: boolean;
  getItemKey?: (itemData: SideListItemData) => string;
  getItemLabel?: (itemData: SideListItemData) => string;
  getItemDescription?: (itemData: SideListItemData) => string;
  className?: string;
};
export type ItemTreeProps = ItemListProps;
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
