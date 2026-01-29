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
import { valueCompExamples } from '../layout/value-comp/example.jsx';
import { buttonExamples } from '../button/example.jsx';

// Combine all examples into a single object
export const components = {
  ...authExamples,
  ...layoutExamples,
  ...iconExamples,
  ...configExamples,
  ...tabExamples,
  ...pathExamples,
  ...dictExamples,
  ...menuExamples,
  ...jsonExamples,
  ...jsonJotaiExamples,
  ...valueCompExamples,
  ...buttonExamples,
};
