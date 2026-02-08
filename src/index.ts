// common/src/index.ts
export {
    FileIconDefault,
    DeleteIcon,
    SearchIcon,
    ClearIcon,
    InfoIcon,
    InfoIconWithTooltip,
    SuccessIcon,
    ErrorIcon,
    UploadIcon,
    BackIcon,
    ForwardIcon,
    EyeIcon,
    EyeOffIcon,
    CrossIcon,
    AddIcon,
    SpinningCircle,
    FolderIcon,
    EditIconNotepad,
    EditIcon,
    EditIconPen,
    PlusIcon,
    MinusIcon
} from "./icon/Icon.jsx";

export { default as PdfIcon } from "./icon/PdfIcon.jsx";
export { default as RefreshIcon } from "./icon/RefreshIcon.jsx";

export {
    get_local_timezone_int,
    format_date,
    get_cookie,
} from "./common.js";

export { 
    default as MasterDetail,
    Tab as MasterDetailTab, 
    SubTab as MasterDetailSubTab, 
    Panel as MasterDetailPanel 
} from "./layout/master-detail/MasterDetail.tsx";

export { default as TabsOnTop } from "./layout/tab/TabsOnTop.jsx";

export { default as Login } from "./auth/Login.jsx";

export { ConfigPanel, ConfigPanelWithTabs, ConfigPanelWithTabGroups, ConfigPanelWithSubtabs } from "./config";
export type { ConfigStruct, ConfigItemStruct, ConfigItemType, ConfigProps, MissingItemStrategy } from "./config";

export { default as PathBar } from "./path/PathBar.tsx";

export { default as KeyValues } from "./dict/KeyValues.jsx";
export { default as KeyValuesComp } from "./dict/KeyValuesComp.jsx";

export { default as EditableValueComp } from "./layout/value-comp/EditableValueComp.jsx";
export { default as EditableValueWithInfo } from "./layout/value-comp/EditableValueWithInfo.jsx";
export { default as SelectableValueComp } from "./layout/value-comp/SelectableValueComp.jsx";
export { default as SearchableValueComp } from "./layout/value-comp/SearchableValueComp.jsx";
export { default as PanelToggle } from "./panel/PanelToggle.jsx";

export { default as JsonComp } from "./layout/json/JsonComp.jsx";
export { default as JsonKeyValueComp } from "./layout/json/JsonKeyValueComp.jsx";
export { default as JsonListItemComp } from "./layout/json/JsonListItemComp.jsx";
export { default as JsonTextComp } from "./layout/json/JsonTextComp.jsx";
export { default as JsonNumberComp } from "./layout/json/JsonNumberComp.jsx";
export { default as JsonBoolComp } from "./layout/json/JsonBoolComp.jsx";
export { default as JsonNullComp } from "./layout/json/JsonNullComp.jsx";
export { default as JsonRaw } from "./layout/json/JsonRaw.jsx";

export { JsonContextProvider, useJsonContext } from "./layout/json/JsonContext";
export type { TypeConversionBehavior, ConversionMenuRequest } from "./layout/json/JsonContext";
export * from "./layout/json/typeConvert";

export { parseYamlToJson, parseJsonString, parseStringToJson, formatJson } from "./utils/parseString";

export { default as Menu } from "./menu/Menu";
export type { MenuItem, MenuItemSingle, MenuItemSubmenu } from "./menu/Menu";

export { default as MenuComp } from "./menu/MenuComp";
export type { MenuCompItem, MenuCompItemSingle, MenuCompItemSubmenu } from "./menu/MenuComp";

export { default as DatabaseSetup } from "./database/DatabaseSetup";
export type { DatabaseSetupProps, TableConfig } from "./database/DatabaseSetup";
export { default as TableManage } from "./database/TableManage";
export type { TableManageProps } from "./database/TableManage";

export { default as BoolSlider } from "./button/BoolSlider.jsx";

export { default as FolderView } from "./layout/folder/FolderView.jsx";
export { default as FolderHeader } from "./layout/folder/Header.jsx";
export { default as FolderBody } from "./layout/folder/Body.jsx";

export {
    parsePathToSegments,
    navigateToPath,
    segmentsToPath,
    convertPathToMongoDotNotation,
    navigateToParentArray,
    isPathToArrayItem,
    extractDocId
} from "./layout/json/pathUtils.js";