import type { ComponentType, ReactNode } from 'react';

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
export type ConfigItemType = 'group' | 'boolean' | 'string' | 'number' | 'select' | 'tab' | 'tab-group' | 'subtab' | string;
export type ConfigItem = {
  id: string;
  type: ConfigItemType;
  label?: ReactNode;
  name?: ReactNode;
  description?: ReactNode;
  defaultValue?: unknown;
  options?: string[];
  children?: ConfigItem[];
  [key: string]: unknown;
};
export type ConfigOperationState = {
  activeTabId?: string;
  activeSubtabId?: string;
  isLocked?: boolean;
  isEditable?: boolean;
  [key: string]: unknown;
};
export type ConfigPanelConfig = {
  componentPath?: string[] | string;
  path?: string[] | string;
  items?: ConfigItem[];
  operationStateByPath?: Record<string, ConfigOperationState>;
  activeTabId?: string;
  activeSubtabId?: string;
  isLocked?: boolean;
  isEditable?: boolean;
  missingItemStrategy?: 'setDefault' | 'reportError' | 'ignore' | string;
  [key: string]: unknown;
};
export type ConfigPanelEventData = {
  componentPath?: string[];
  componentPathText?: string;
  itemPath?: string[];
  itemPathText?: string;
  tabPath?: string[];
  tabPathText?: string;
  subtabPath?: string[];
  subtabPathText?: string;
  valueId?: string;
  value?: unknown;
  tabId?: string;
  subtabId?: string;
  [key: string]: unknown;
};
export type ConfigPanelProps = {
  data?: Record<string, unknown>;
  config?: ConfigPanelConfig;
  onEvent?: (eventType: string, eventData: ConfigPanelEventData) => Promise<unknown> | unknown;
};
export const ConfigPanel: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithTabs: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithTabGroups: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithSubtabs: ComponentType<ConfigPanelProps>;
export const PathBar: ComponentType<any>;
export const KeyValues: ComponentType<any>;
export const KeyValuesComp: ComponentType<any>;
export const MetadataKeyValues: ComponentType<MetadataKeyValuesProps>;
export const ButtonWithDropDown: ComponentType<ButtonWithDropDownProps>;
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
export type JsonCompMobxValueCompContext = {
  path: string;
  value: unknown;
  data: unknown;
  itemKey: string | number;
  valueType: string;
};

export type JsonCompMobxProps = {
  data?: unknown;
  isEditable?: boolean;
  isKeyEditable?: boolean;
  isValueEditable?: boolean;
  onChange?: (path: string, changeData: unknown) => Promise<{ code: number; message?: string }>;
  indent?: number;
  typeConversionBehavior?: string;
  isDebug?: boolean;
  getValueComp?: (context: JsonCompMobxValueCompContext) => ReactNode;
};

export const JsonCompMobx: ComponentType<JsonCompMobxProps>;

export function parseYamlToJson(...args: any[]): any;
export function parseJsonString(...args: any[]): any;
export function parseStringToJson(...args: any[]): any;
export function formatJson(...args: any[]): any;

export const Menu: ComponentType<any>;
export const MenuContext: ComponentType<MenuContextProps>;
export const MenuCore: ComponentType<MenuCoreProps>;
export const MenuDropDown: ComponentType<MenuDropDownProps>;
export const MenuComp: ComponentType<import('./component/menu/MenuComp').MenuCompProps>;
export const DatabaseSetup: ComponentType<any>;
export const TableManage: ComponentType<any>;
export const BoolSlider: ComponentType<any>;
export const SegmentedControl: ComponentType<any>;
export const FolderBody: ComponentType<any>;
export const CellDropdown: ComponentType<any>;
export type TreeViewItemData = {
  id: string;
  text?: ReactNode;
  name?: ReactNode;
  isLeaf?: boolean;
  isExpanded?: boolean;
  childrenIds?: string[];
  childrenLoadState?: 'loaded' | 'loading' | 'load-failed' | string;
  childrenErrorMessage?: string;
  [key: string]: unknown;
};
export type TreeViewDropInfo = {
  type: 'before' | 'after' | 'under';
  itemParentId?: string | null;
  itemBeforeId?: string | null;
  itemAfterId?: string | null;
};
export type TreeViewDragState = {
  isDragged: boolean;
  isDragHovered: boolean;
  isInsertBefore: boolean;
  isInsertAfter: boolean;
  isInsertUnder: boolean;
  isDropAllowed: boolean;
};
export type TreeViewProps = {
  data?: {
    itemRootIds?: string[];
    itemDataById?: Record<string, TreeViewItemData>;
    itemSelectedId?: string | null;
  };
  config?: {
    className?: string;
    indentPx?: number;
    isToggleExpandOnItemClick?: boolean;
    isItemDragEnabled?: boolean;
    getItemComp?: (itemData: TreeViewItemData) => ComponentType<any> | null | undefined;
    getItemRowClassName?: (itemData: TreeViewItemData) => string;
    getIsItemDraggable?: (itemData: TreeViewItemData) => boolean;
    getItemDropStatus?: (context: {
      itemId: string;
      itemData?: TreeViewItemData | null;
      targetItemId: string;
      targetItemData?: TreeViewItemData | null;
      drop: TreeViewDropInfo;
    }) => boolean | { isDropAllowed?: boolean };
  };
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const TreeView: ComponentType<TreeViewProps>;
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

export type Ms48IdParseOptions = {
  form?: 'base36' | 'base36-low' | 'base36-high' | 'decimal';
  timezoneHourOffset?: number;
};

export type Ms48IdBuildOptions = {
  timeMs?: number;
  offset?: number;
};

export type Ms48IdParts = {
  idBigInt: bigint;
  decimalText: string;
  base36Text: string;
  base36LowText: string;
  base36HighText: string;
  timeMs: number;
  offset: number;
  timestampText: string;
};

export type Ms48EncodingCandidate = {
  encoding: string;
  idBigInt: bigint;
  timeMs: number | null;
  offset: number | null;
  timestampText: string;
  isReasonable: boolean;
  errorText: string;
};

export type Ms48EncodingDetection = {
  encoding: string;
  candidates: Ms48EncodingCandidate[];
  errorText: string;
};

export function buildMs48IdBigInt(options?: Ms48IdBuildOptions): bigint;
export function createMs48Id(options?: Ms48IdBuildOptions): string;
export function createMs48IdBigInt(options?: Ms48IdBuildOptions): bigint;
export function createMs48IdDecimal(options?: Ms48IdBuildOptions): string;
export function convertMs48Id(id: string | number | bigint, options?: Ms48IdParseOptions): {
  decimalText: string;
  base36Text: string;
  base36LowText: string;
  base36HighText: string;
};
export function detectMs48StringEncoding(idText: string, options?: Ms48IdParseOptions): Ms48EncodingDetection;
export function extractOffset(idBigInt: bigint): number;
export function extractTimestampMs(idBigInt: bigint): number;
export function formatIdInfo(idText: string, options?: Ms48IdParseOptions): any;
export function formatTimestamp10Ms(timeMs: number, timezoneHourOffset?: number): string;
export function formatTimezoneHourOffset(timezoneHourOffset?: number): string;
export function genIdStr(offset?: number): string;
export function generateSequentialId(): string;
export function getIdInt(unixStampMs?: number, offset?: number): bigint;
export function getRandomIdInt(): bigint;
export function getUnixStampMs(): number;
export function id09azToInt(idText: string): bigint;
export function idIntTo09az(idBigInt: bigint): string;
export function parseMs48Id(id: string | number | bigint, options?: Ms48IdParseOptions): Ms48IdParts;
export function parseMs48IdBigInt(id: string | number | bigint, options?: Ms48IdParseOptions): bigint;

export type { TypeConversionBehavior, ConversionMenuRequest } from './layout/json/JsonContext';
export type { MenuItem, MenuItemSingle, MenuItemSubmenu } from './component/menu/Menu';
export type { MenuCompItem, MenuCompItemSingle, MenuCompItemSubmenu, MenuCompProps } from './component/menu/MenuComp';
export type { DatabaseSetupProps, TableConfig } from './database/DatabaseSetup';
export type { TableManageProps } from './database/TableManage';
export type FolderColumnDef = {
  data: unknown;
  align?: string;
};
export type FolderHeaderProps = {
  columns: Record<string, FolderColumnDef>;
  columnsOrder: string[];
  columnsSizeInit?: Record<string, { width?: number; minWidth?: number; resizable?: boolean }>;
  allowColumnReorder?: boolean;
  isLastColumnFilled?: boolean;
  columnResizeDragMode?: 'preview' | 'immediate';
  columnResizeWidthMode?: 'natural' | 'local';
};
export type FolderViewProps = {
  columns?: Record<string, FolderColumnDef>;
  columnsOrder?: string[];
  columnsSizeInit?: Record<string, { width?: number; minWidth?: number; resizable?: boolean }>;
  rows?: Array<{ id: string; data?: Record<string, unknown> }>;
  getHeaderComponent?: (columnId: string) => ComponentType<any> | undefined;
  getBodyComponent?: (columnId: string) => ComponentType<any> | undefined;
  selectionMode?: 'single' | 'multiple' | 'none';
  selectedRowIds?: string[];
  selectedRowId?: string;
  onSelectedRowIdsChange?: (nextRowIds: string[]) => void;
  onRowClick?: (rowId: string) => void;
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
  label?: ReactNode;
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
export type ItemTreeProps = {
  data?: {
    items?: SideListItemData[];
    selectedItemKey?: string;
  };
  config?: {
    titleText?: string;
    headerExtraContent?: unknown;
    searchPlaceholder?: string;
    isSearchEnabled?: boolean;
    isHeaderVisible?: boolean;
    getItemKey?: (itemData: SideListItemData) => string;
    getItemLabel?: (itemData: SideListItemData) => string;
    getItemDescription?: (itemData: SideListItemData) => string;
    className?: string;
    indentPx?: number;
    isItemDragEnabled?: boolean;
    getIsItemDraggable?: (itemData: SideListItemData, treeItemData: TreeViewItemData) => boolean;
    getItemDropStatus?: (context: {
      itemKey: string;
      itemData?: SideListItemData | null;
      treeItemData?: TreeViewItemData | null;
      targetItemKey: string;
      targetItemData?: SideListItemData | null;
      targetTreeItemData?: TreeViewItemData | null;
      drop: TreeViewDropInfo;
    }) => boolean | { isDropAllowed?: boolean };
  };
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export type EndpointCardActionItem = {
  id: string;
  labelText?: string;
  isVisible?: boolean;
  isDisabled?: boolean;
  isDanger?: boolean;
};
export type EndpointCardData = {
  id?: string;
  titleText?: string;
  descriptionText?: string;
  keyValues?: Array<{ key: string; value: string }>;
  statusTagText?: string;
  statusMessage?: {
    status?: 'idle' | 'loading' | 'success' | 'error';
    messageText: string;
  } | null;
  errorMessage?: string;
};
export type EndpointCardConfig = {
  isSelected?: boolean;
  isLocked?: boolean;
  isUnavailable?: boolean;
  isSelectable?: boolean;
  isCardDisabled?: boolean;
  actionItems?: EndpointCardActionItem[];
  keyColWidth?: string;
  statusTagClassName?: string;
  showStatusDot?: boolean;
  selectedDetailText?: string;
};
export type EndpointCardProps = {
  data?: EndpointCardData;
  config?: EndpointCardConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const EndpointCard: ComponentType<EndpointCardProps>;
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

export type ButtonWithDropDownItem = {
  id: string;
  label?: string;
  isDisabled?: boolean;
  children?: ButtonWithDropDownItem[];
  [key: string]: unknown;
};

export type ButtonWithDropDownProps = {
  data?: {
    label?: ReactNode;
    items?: ButtonWithDropDownItem[];
    emptyText?: string;
  };
  config?: {
    isDisabled?: boolean;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    itemClassName?: string;
    disabledItemClassName?: string;
    minWidth?: number;
    menuAlign?: 'left' | 'right';
    isClickPropagationStopped?: boolean;
  };
  onEvent?: (eventType: string, eventData: any) => void;
};
export const MetadataKeyValues: ComponentType<MetadataKeyValuesProps>;

export type MenuDataItem = {
  id: string;
  label?: string;
  isDisabled?: boolean;
  data?: unknown;
  children?: MenuDataItem[];
  component?: ComponentType<any>;
  componentProps?: Record<string, unknown>;
  [key: string]: unknown;
};

export type MenuPosition = {
  x: number;
  y: number;
};

export type MenuCoreProps = {
  data?: {
    items?: MenuDataItem[];
    position?: MenuPosition;
    emptyText?: string;
  };
  config?: {
    minWidth?: number;
    className?: string;
    itemClassName?: string;
    disabledItemClassName?: string;
    isClickPropagationStopped?: boolean;
  };
  onEvent?: (eventType: string, eventData: any) => void;
};

export type MenuContextProps = MenuCoreProps;

export type MenuDropDownProps = {
  data?: {
    items?: MenuDataItem[];
    position?: MenuPosition;
    emptyText?: string;
  };
  config?: {
    className?: string;
    minWidth?: number;
    itemClassName?: string;
    disabledItemClassName?: string;
    isClickPropagationStopped?: boolean;
  };
  onEvent?: (eventType: string, eventData: any) => void;
};
