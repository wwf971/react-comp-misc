// Import examples from component folders
import { authExamples } from '../component/auth/example.jsx';
import { layoutExamples } from '../layout/master-detail/example.jsx';
import { iconExamples } from '../icon/example.jsx';
import { configExamples } from '../component/config/example.jsx';
import { pathExamples } from '../component/path/example.jsx';
import { dictExamples } from '../component/key-value/example.jsx';
import { tabExamples } from '../layout/tab/example.jsx';
import { menuExamples } from '../component/menu/example.jsx';
import { jsonExamples } from '../layout/json/example.jsx';
// import { jsonJotaiExamples } from '../layout/json-jotai/example.jsx';
import { jsonMobxExamples } from '../layout/json-mobx/example.jsx';
import { valueCompExamples } from '../layout/value-comp/example.jsx';
import { buttonExamples } from '../component/button/example.jsx';
import { panelExamples } from '../layout/panel/example.jsx';
import { popupExamples } from '../component/popup/example.jsx';
import { folderExamples } from '../layout/folder/example.jsx';
import { htmlExamples } from '../dev/example.jsx';
import { calendarExamples } from '../component/calendar/example.jsx';
import { statExamples } from '../component/stat/example.jsx';

// Combine all examples into a single object
export const components = {
  ...folderExamples,
  ...jsonExamples,
  // ...jsonJotaiExamples,
  ...jsonMobxExamples,
  ...layoutExamples,
  ...iconExamples,
  ...configExamples,
  ...tabExamples,
  ...pathExamples,
  ...dictExamples,
  ...menuExamples,
  ...valueCompExamples,
  ...buttonExamples,
  ...panelExamples,
  ...popupExamples,
  ...authExamples,
  ...calendarExamples,
  ...statExamples,
  ...htmlExamples,
};
