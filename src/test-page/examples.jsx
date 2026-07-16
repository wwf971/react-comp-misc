// Import examples from component folders
import { authExamples } from '../component/auth/exampleAuth.jsx';
import { layoutExamples } from '../layout/master-detail/exampleMasterDetail.jsx';
import { iconsExamples } from '../icon/exampleIcons.jsx';
import { configExamples } from '../app/config-panel/exampleConfig.jsx';
import { pathExamples } from '../component/path/examplePath.jsx';
import { messageBarExamples } from '../component/message-bar/exampleMessageBar.jsx';
import { dictExamples } from '../component/key-value/exampleKeyValues.jsx';
import { tabExamples } from '../layout/tab/exampleTabs.jsx';
import { menuExamples } from '../component/menu/exampleMenu.jsx';
import { jsonExamples } from '../layout/json/exampleJson.jsx';
// import { jsonJotaiExamples } from '../layout/json-jotai/exampleJsonJotai.jsx';
import { jsonMobxExamples } from '../layout/json-mobx/exampleJsonMobx.jsx';
import { valueCompExamples } from '../layout/value-comp/exampleValueComp.jsx';
import { buttonExamples } from '../component/button/exampleButton.jsx';
import { panelExamples } from '../layout/panel/examplePanel.jsx';
import { popupExamples } from '../component/popup/examplePopup.jsx';
import { folderExamples } from '../layout/folder/exampleFolder.jsx';
import { treeViewExamples } from '../layout/tree/exampleTreeView.jsx';
import { htmlExamples } from '../dev/exampleHtml.jsx';
import { calendarExamples } from '../component/calendar/exampleCalendar.jsx';
import { statExamples } from '../component/stat/exampleStat.jsx';
import { databaseExamples } from '../database/exampleDatabase.jsx';
import { metadataExamples } from '../app/metadata/exampleMetadata.jsx';
import { sideListExamples } from '../app/side-list/exampleSideList.jsx';
import { idExamples } from '../app/id/exampleId.jsx';
import { colorPickerExamples } from '../app/color-picker/exampleColorPicker.jsx';
import { propEditorExamples } from '../app/property-editor/examplePropEditor.jsx';

// Combine all examples into a single object
export const components = {
  ...folderExamples,
  ...treeViewExamples,
  ...jsonExamples,
  // ...jsonJotaiExamples,
  ...jsonMobxExamples,
  ...layoutExamples,
  ...iconsExamples,
  ...configExamples,
  ...tabExamples,
  ...pathExamples,
  ...messageBarExamples,
  ...dictExamples,
  ...menuExamples,
  ...valueCompExamples,
  ...buttonExamples,
  ...panelExamples,
  ...popupExamples,
  ...authExamples,
  ...calendarExamples,
  ...statExamples,
  ...databaseExamples,
  ...metadataExamples,
  ...sideListExamples,
  ...idExamples,
  ...colorPickerExamples,
  ...propEditorExamples,
  ...htmlExamples,
};
