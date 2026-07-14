import React from 'react';
import { observer } from 'mobx-react-lite';
import ConfigRenderer from './ConfigRenderer.jsx';
import { normalizeConfigPanelProps, useConfigRuntime } from './ConfigUtils.jsx';

const ConfigPanelWithTabGroups = observer((props) => {
  const runtime = useConfigRuntime();
  const normalized = normalizeConfigPanelProps(props, runtime);
  return <ConfigRenderer {...normalized} mode="tab-groups" />;
});

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;
