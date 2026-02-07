// Import examples from component folders
import { authExamples } from '../auth/example.jsx';
import { layoutExamples } from '../layout/master-detail/example.jsx';
import { iconExamples } from '../icon/example.jsx';
import { configExamples } from '../config/example.jsx';
import { pathExamples } from '../path/example.jsx';
import { dictExamples } from '../dict/example.jsx';
import { tabExamples } from '../layout/tab/example.jsx';
import { menuExamples } from '../menu/example.tsx';
import { jsonExamples } from '../layout/json/example.jsx';
import { jsonJotaiExamples } from '../layout/json-jotai/example.jsx';
import { jsonMobxExamples } from '../layout/json-mobx/example.jsx';
import { valueCompExamples } from '../layout/value-comp/example.jsx';
import { buttonExamples } from '../button/example.jsx';
import { panelExamples } from '../panel/example.jsx';
import { folderExamples } from '../layout/folder/example.jsx';

// Combine all examples into a single object
export const components = {
  ...folderExamples,
  ...jsonExamples,
  ...layoutExamples,
  ...iconExamples,
  ...configExamples,
  ...tabExamples,
  ...pathExamples,
  ...dictExamples,
  ...menuExamples,
  ...jsonJotaiExamples,
  ...jsonMobxExamples,
  ...valueCompExamples,
  ...buttonExamples,
  ...panelExamples,
  ...authExamples,
};
