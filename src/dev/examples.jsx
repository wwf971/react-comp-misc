// Import examples from component folders
import { authExamples } from '../auth/example.jsx';
import { layoutExamples } from '../layout/example.jsx';
import { iconExamples } from '../icon/example.jsx';
import { configExamples } from '../config/example.jsx';
import { pathExamples } from '../path/example.jsx';
import { dictExamples } from '../dict/example.jsx';

// Combine all examples into a single object
export const components = {
  ...authExamples,
  ...layoutExamples,
  ...iconExamples,
  ...configExamples,
  ...pathExamples,
  ...dictExamples,
};
