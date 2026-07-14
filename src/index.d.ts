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
  segList: PathSegment[] | undefined,
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
export const AuthStatusButton: ComponentType<any>;
export function createAuthStore(config: {
  storageKey: string;
  autoLoginStorageKey?: string;
  endpoints?: {
    login?: string;
    tokenLogin?: string;
    temporaryToken?: string;
    logout?: string;
  };
  requestJsonData: (url: string, options?: RequestInit) => Promise<Record<string, unknown>>;
  loginSuccessMessage?: string;
  logoutSuccessMessage?: string;
}): any;
export type MessageBarStatus = 'idle' | 'loading' | 'success' | 'error' | 'info';
export type MessageBarContentItem = {
  id: string;
  type: 'text' | 'button' | 'custom' | string;
  text?: string;
  labelText?: string;
  buttonKind?: 'dismiss' | string;
  eventType?: string;
  eventData?: Record<string, unknown>;
  isDisabled?: boolean;
  compKey?: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  className?: string;
  heightSize?: 'sm' | 'md' | 'lg' | string;
};
export type MessageBarData = {
  messageState?: {
    status?: MessageBarStatus | string;
    messageText?: string;
  } | null;
  idleText?: string;
  contentItems?: MessageBarContentItem[];
};
export type MessageBarConfig = {
  isOneLine?: boolean;
  isPersistent?: boolean;
  isBusy?: boolean;
  idleText?: string;
  scrollLeft?: number;
  isTitleEnabled?: boolean;
  heightSize?: 'sm' | 'md' | 'lg' | string;
  className?: string;
  contentClassName?: string;
  buttonClassName?: string;
  getComp?: (item: MessageBarContentItem) => ComponentType<any> | null | undefined;
};
export type MessageBarEventData = {
  itemId?: string;
  itemData?: unknown;
  scrollLeft?: number;
  scrollLeftMax?: number;
  deltaX?: number;
  widthViewport?: number;
  widthContent?: number;
  [key: string]: unknown;
};
export type MessageBarProps = {
  data?: MessageBarData;
  config?: MessageBarConfig;
  onEvent?: (eventType: string, eventData: MessageBarEventData) => Promise<unknown> | unknown;
};
export const MessageBar: ComponentType<MessageBarProps>;
export type ConfigCustomControlProps = {
  item: ConfigItem;
  value?: unknown;
  itemPath: string[];
  itemPathText: string;
  compPath: string[];
  compPathText: string;
  componentPath: string[];
  componentPathText: string;
  isDisabled?: boolean;
  onValueChange?: (valueNext: unknown) => Promise<unknown> | unknown;
  [key: string]: unknown;
};
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
  comp?: ComponentType<ConfigCustomControlProps> | ReactNode;
  compName?: string;
  compProps?: Record<string, unknown>;
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
  compPath?: string[] | string;
  componentPath?: string[] | string;
  path?: string[] | string;
  items?: ConfigItem[];
  operationStateByPath?: Record<string, ConfigOperationState>;
  activeTabId?: string;
  activeSubtabId?: string;
  isLocked?: boolean;
  isEditable?: boolean;
  missingItemStrategy?: 'setDefault' | 'reportError' | 'ignore' | string;
  compResolveFn?: (compName: string, item: ConfigItem) => ComponentType<ConfigCustomControlProps> | null | undefined;
  getComp?: (itemOrCompName: ConfigItem | string, item?: ConfigItem) => ComponentType<ConfigCustomControlProps> | null | undefined;
  [key: string]: unknown;
};
export type ConfigPanelEventData = {
  compPath?: string[];
  compPathText?: string;
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
  configStruct?: ConfigPanelConfig;
  configValue?: Record<string, unknown>;
  onChangeAttempt?: (valueId: string | undefined, value: unknown, eventData: ConfigPanelEventData) => Promise<unknown> | unknown;
  missingItemStrategy?: 'setDefault' | 'reportError' | 'ignore' | string;
};
export const ConfigPanel: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithTabs: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithTabGroups: ComponentType<ConfigPanelProps>;
export const ConfigPanelWithSubtabs: ComponentType<ConfigPanelProps>;
export const PathBar: ComponentType<any>;
export type KeyValuesRowData = {
  id?: string | number;
  key?: unknown;
  value?: unknown;
  keyCompName?: string;
  valueCompName?: string;
  rowClassName?: string;
  [key: string]: unknown;
};
export type KeyValuesCompData = {
  rows?: KeyValuesRowData[];
  selectedRowId?: string | number | null;
};
export type KeyValuesCompConfig = {
  isEditable?: boolean;
  isKeyEditable?: boolean;
  isValueEditable?: boolean;
  alignCol?: boolean;
  keyColWidth?: string;
  keyColWidthEffective?: string | null;
  keyCellContentAlign?: 'left' | 'right' | 'center';
  isWrap?: boolean;
  isDividerDraggable?: boolean;
  selectionMode?: 'none' | 'single';
  compResolveFn?: (compName: string, context: Record<string, unknown>) => ComponentType<any> | null;
  rowIdResolveFn?: (row: KeyValuesRowData) => string | number | null;
};
export type KeyValuesCompProps = {
  data?: KeyValuesCompData | KeyValuesRowData[];
  config?: KeyValuesCompConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const KeyValues: ComponentType<KeyValuesCompProps>;
export const KeyValuesComp: ComponentType<KeyValuesCompProps>;
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

export type JsonCompMobxConfig = {
  compId?: string;
  isEditable?: boolean;
  isKeyEditable?: boolean;
  isValueEditable?: boolean;
  isDragMoveEnabled?: boolean;
  isDebug?: boolean;
  indentPx?: number;
  typeConversionBehavior?: string;
  getValueComp?: (context: JsonCompMobxValueCompContext) => ReactNode;
};

export type JsonCompMobxEventResult = { code: number; message?: string };

export type JsonCompMobxProps = {
  data?: unknown;
  config?: JsonCompMobxConfig;
  onEvent?: (eventType: string, eventData: { path: string; changeData: unknown }) => Promise<JsonCompMobxEventResult | void> | JsonCompMobxEventResult | void;
  store?: unknown;
};

export const JsonCompMobx: ComponentType<JsonCompMobxProps>;
export function createJsonCompMobxStore(...args: any[]): any;
export function createJsonSelectionOperationStore(...args: any[]): any;
export function createJsonDragOperationStore(...args: any[]): any;
export function createJsonOnEventAdapter(...args: any[]): any;

export function parseYamlToJson(...args: any[]): any;
export function parseJsonString(...args: any[]): any;
export function parseStringToJson(...args: any[]): any;
export function formatJson(...args: any[]): any;

export const Menu: ComponentType<MenuCompProps>;
export const MenuContext: ComponentType<MenuCompProps>;
export const MenuDropDown: ComponentType<MenuDropDownProps>;
export const MenuComp: ComponentType<MenuCompProps>;
export const DatabaseSetup: ComponentType<any>;
export const TableManage: ComponentType<any>;
export const BoolSlider: ComponentType<any>;
export type SegmentedControlSegmentData = {
  value?: string | number | boolean;
  labelText?: string;
  compName?: string;
  [key: string]: unknown;
};
export type SegmentedControlData = {
  valueSelected?: string | number | boolean | null;
  segList?: SegmentedControlSegmentData[];
};
export type SegmentedControlConfig = {
  isDisabled?: boolean;
  colorHighlight?: string;
  widthModeSegment?: 'auto' | 'equal';
  durationTransitionMs?: number;
  compResolveFn?: (compName: string) => ComponentType<any> | null;
  classNameTrack?: string;
};
export type SegmentedControlProps = {
  data?: SegmentedControlData;
  config?: SegmentedControlConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const SegmentedControl: ComponentType<SegmentedControlProps>;
export type ColorPickerModeOption = {
  value: string;
  label: string;
};
export type ColorPickerSwatchCell = {
  row: number;
  col: number;
  value?: string | null;
  label?: string;
};
export type ColorPickerSwatchGrid = {
  rowCount?: number;
  colCount?: number;
  cells?: ColorPickerSwatchCell[];
};
export type ColorPickerData = {
  modeOptions?: ColorPickerModeOption[];
  swatchGrid?: ColorPickerSwatchGrid;
};
export type ColorPickerConfig = {
  modeCurrent?: string;
  hue?: number;
  saturation?: number;
  value?: number;
  alpha?: number;
  colorCurrentValue?: string;
  colorCurrentCss?: string;
  hueColorHex?: string;
  isSwatchGapShown?: boolean;
  swatchCellShape?: 'square' | 'circle';
};
export type ColorPickerProps = {
  data?: ColorPickerData;
  config?: ColorPickerConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const ColorPicker: ComponentType<ColorPickerProps>;
export const ColorPickerStore: new (...args: any[]) => any;
export function createColorPickerStore(...args: any[]): any;
export const colorPickerModeOptions: ColorPickerModeOption[];
export const swatchGridDefault: ColorPickerSwatchGrid;
export type PropEditorData = {
  levelLeftSelectedId?: string;
  levelTopSelectedId?: string;
  levelLeftList?: Record<string, unknown>[];
  levelTopList?: Record<string, unknown>[];
  panelList?: Record<string, unknown>[];
  propertyById?: Record<string, unknown>;
  dragStateByGroupPath?: Record<string, unknown>;
  [key: string]: unknown;
};
export type PropEditorConfig = {
  titleText?: string;
  width?: string;
  embeddedWidth?: number;
  popupWidth?: number;
  isLevelLeftShown?: boolean;
  isLevelTopShown?: boolean;
  isReadOnly?: boolean;
  isEditable?: boolean;
  keyColWidth?: string | number;
  keyColMinWidth?: string;
  keyColMaxWidth?: string;
  isDividerDraggable?: boolean;
  isGroupCollapsible?: boolean;
  requestTimeoutMs?: number;
  groupCollapsedByPath?: Record<string, boolean>;
  getComp?: (compName: string, context?: Record<string, unknown>) => ComponentType<any> | null;
  serverSimulation?: Record<string, unknown>;
  [key: string]: unknown;
};
export type PropEditorProps = {
  data?: PropEditorData;
  config?: PropEditorConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<unknown> | unknown;
};
export const PropEditor: ComponentType<PropEditorProps>;
export const PropEditorStore: new (...args: any[]) => any;
export function createPropEditorDemoStore(...args: any[]): any;
export const FolderBody: ComponentType<any>;
export const CellDropdown: ComponentType<CellDropdownProps>;
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
export type { DatabaseSetupProps, TableConfig } from './database/DatabaseSetup';
export type { TableManageProps } from './database/TableManage';
export type FolderColumnDef = {
  data: unknown;
  align?: string;
};
export type FolderColSizeDef = {
  width?: number;
  minWidth?: number;
  resizable?: boolean;
};
export type FolderMessageState = {
  status?: 'idle' | 'loading' | 'success' | 'error';
  messageText?: string;
} | null;
export type FolderViewData = {
  columns?: Record<string, FolderColumnDef>;
  colsOrder?: string[];
  rows?: Array<{ id: string; data?: Record<string, unknown>; rowClassName?: string }>;
  rowIdsSelected?: string[];
  viewCurrent?: 'list' | 'icon';
  contextMenuItems?: unknown[];
  statusBar?: {
    itemCount?: number;
    messageState?: FolderMessageState;
  };
  getRowData?: (rowId: string, colId: string) => unknown;
  getRowIconData?: (rowId: string) => { label?: string; kind?: string };
};
export type FolderViewConfig = {
  compId?: string;
  isLocked?: boolean;
  isListOnly?: boolean;
  isStatusBarVisible?: boolean;
  isStatusItemCountVisible?: boolean;
  isColReorderAllowed?: boolean;
  isRowReorderAllowed?: boolean;
  isLastColFilled?: boolean;
  selectionMode?: 'single' | 'multiple' | 'none';
  colSizeById?: Record<string, FolderColSizeDef>;
  colWidthById?: Record<string, number>;
  bodyHeight?: number;
  viewDefault?: 'list' | 'icon';
  colResizeDragMode?: 'preview' | 'immediate';
  colResizeWidthMode?: 'natural' | 'local';
  headerPageUtils?: Record<string, unknown>;
  compHeaderByColId?: (colId: string) => ComponentType<any> | undefined;
  compBodyByColId?: (colId: string, rowId?: string) => ComponentType<any> | undefined;
  isRowDataObservable?: boolean;
  isContextMenuBuiltInDisabled?: boolean;
};
export type FolderViewProps = {
  data?: FolderViewData;
  config?: FolderViewConfig;
  onEvent?: (eventType: string, eventData: Record<string, unknown>) => Promise<{ code: number; message?: string }> | { code: number; message?: string };
};
export type FolderHeaderData = {
  columns: Record<string, FolderColumnDef>;
  colsOrder: string[];
  colWidthById?: Record<string, number>;
};
export type FolderHeaderConfig = {
  colSizeById?: Record<string, FolderColSizeDef>;
  isColReorderAllowed?: boolean;
  isLastColFilled?: boolean;
  colResizeDragMode?: 'preview' | 'immediate';
  colResizeWidthMode?: 'natural' | 'local';
  compByColId?: (colId: string) => ComponentType<any> | undefined;
  headerPageUtils?: Record<string, unknown>;
};
export type FolderHeaderProps = {
  data?: FolderHeaderData;
  config?: FolderHeaderConfig;
  onEvent?: FolderViewProps['onEvent'];
};
export type CellDropdownData = {
  value?: unknown;
  options?: Array<{ value: unknown; label?: string }>;
  isEditable?: boolean;
  isBusy?: boolean;
};
export type CellDropdownConfig = {
  isEditable?: boolean;
  isBusy?: boolean;
};
export type CellDropdownProps = {
  data?: CellDropdownData;
  config?: CellDropdownConfig;
  onEvent?: FolderViewProps['onEvent'];
  rowId?: string;
  colId?: string;
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
    searchText?: string;
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
  isMessageVisible?: boolean;
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
    title?: string;
  };
  onEvent?: (eventType: string, eventData: any) => void;
};
export const MetadataKeyValues: ComponentType<MetadataKeyValuesProps>;

export type MenuItemData = {
  id: string;
  label?: ReactNode;
  isDisabled?: boolean;
  data?: unknown;
  children?: MenuItemData[];
  comp?: ComponentType<any>;
  compProps?: Record<string, unknown>;
  preferredWidth?: number;
  preferredHeight?: number;
  [key: string]: unknown;
};

export type MenuPos = {
  x: number;
  y: number;
};

export type MenuAnchor = {
  getRect?: () => DOMRect | {
    left: number;
    top: number;
    width?: number;
    height?: number;
    right?: number;
    bottom?: number;
  } | null;
  getTargetEl?: () => Element | null;
  getVisibilityRoot?: () => Element | null;
  offsetX?: number;
  offsetY?: number;
};

export type MenuCompData = {
  items?: MenuItemData[];
  emptyText?: string;
};

export type MenuCompConfig = {
  isOpen?: boolean;
  posOpen?: MenuPos;
  anchor?: MenuAnchor;
  itemHoverId?: string | null;
  submenuPosOpen?: MenuPos | null;
  minWidth?: number;
  className?: string;
  itemClassName?: string;
  disabledItemClassName?: string;
  isClickPropagationStopped?: boolean;
  isBackdropScrollPassThrough?: boolean;
};

export type MenuCompProps = {
  data?: MenuCompData;
  config?: MenuCompConfig;
  onEvent?: (eventType: string, eventData: any) => void | Promise<{ code: number; message?: string }>;
};

export type MenuDropDownProps = {
  data?: MenuCompData;
  config?: Omit<MenuCompConfig, 'isOpen' | 'anchor' | 'isBackdropScrollPassThrough'>;
  onEvent?: MenuCompProps['onEvent'];
};

export type MenuItem = MenuItemData;
export type MenuItemSingle = MenuItemData;
export type MenuItemSubmenu = MenuItemData & { children: MenuItemData[] };
export type MenuCompItem = MenuItemData;
export type MenuCompItemSingle = MenuItemData;
export type MenuCompItemSubmenu = MenuItemData & { children: MenuItemData[] };
export type MenuContextProps = MenuCompProps;
export type MenuDataItem = MenuItemData;
export type MenuPosition = MenuPos;
