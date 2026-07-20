import { useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import ConfigPanel from './Config.jsx';
import ConfigPanelWithTabs from './ConfigTab.jsx';
import ConfigPanelWithTabGroups from './ConfigTabGroup.jsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.jsx';
import styles from './Config.module.css';

const ConfigPermissionMultiControl = observer(({ value, isDisabled, onValueChange, item }) => {
  const optionList = item.options ?? [];
  const valueList = Array.isArray(value) ? value : [];
  const toggleValue = (option) => {
    const valueNext = valueList.includes(option)
      ? valueList.filter((valueItem) => valueItem !== option)
      : [...valueList, option];
    onValueChange(valueNext);
  };
  return (
    <div className={styles.configCustomMultiControl}>
      {optionList.map((option) => (
        <button
          key={option}
          type="button"
          className={`${styles.configCustomMultiButton} ${valueList.includes(option) ? styles.configCustomMultiButtonActive : ''}`}
          disabled={isDisabled}
          onClick={() => toggleValue(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
});

function createConfigExampleConfig(configInput) {
  return makeAutoObservable({
    requestStateByPath: {},
    onRequestDismiss(itemPathText) {
      delete this.requestStateByPath[itemPathText];
    },
    ...configInput
  }, {}, { deep: true, autoBind: true });
}

function waitMs(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function simulateConfigServer(simulationConfig) {
  const meanDelayMs = Math.max(0, Number(simulationConfig.meanDelayMs) || 0);
  const failureChance = Math.max(0, Math.min(100, Number(simulationConfig.failureChance) || 0));
  const delayMs = Math.round(meanDelayMs * (0.5 + Math.random()));
  await waitMs(delayMs);
  if (Math.random() * 100 < failureChance) {
    return {
      code: -1,
      message: `simulated server failure after ${delayMs}ms`
    };
  }
  return {
    code: 0,
    message: `server ok (${delayMs}ms)`
  };
}

// Example 1: Basic ConfigPanel
const BasicConfigPanelExample = observer(({ simulationConfig }) => {
  const [message, setMessage] = useState('');
  
  const [config] = useState(() => createConfigExampleConfig({
    compPath: ['root'],
    operationStateByPath: {
      root: {
        isEditable: true,
        isLocked: false
      }
    },
    items: [
      {
        id: 'basic_group',
        label: 'Basic Settings',
        type: 'group',
        children: [
          {
            id: 'enable_feature',
            label: 'Enable Feature',
            description: 'Turn this feature on or off',
            type: 'boolean',
            defaultValue: true
          },
          {
            id: 'username',
            label: 'Username',
            description: 'Enter your username',
            type: 'string',
            defaultValue: ''
          },
          {
            id: 'accent_tone',
            label: 'Accent Tone',
            description: 'Enum rendered by the built-in segmented control',
            type: 'enum',
            options: ['soft', 'clear', 'strong'],
            defaultValue: 'clear'
          },
          {
            id: 'permission_set',
            label: 'Permissions',
            description: 'Custom multi-select component resolved by compName',
            type: 'custom',
            compName: 'permissionMulti',
            options: ['read', 'write', 'share'],
            defaultValue: ['read']
          }
        ]
      },
      {
        id: 'appearance_group',
        label: 'Appearance',
        type: 'group',
        children: [
          {
            id: 'theme',
            label: 'Theme',
            description: 'Select your preferred theme',
            type: 'select',
            defaultValue: 'light',
            options: ['light', 'dark', 'auto']
          }
        ]
      }
    ],
    getComp: (compName) => (
      compName === 'permissionMulti' ? ConfigPermissionMultiControl : null
    )
  }));

  const [configData] = useState(() => {
    const data = {
      enable_feature: true,
      username: 'john_doe',
        accent_tone: 'clear',
        permission_set: ['read'],
      theme: 'light'
    };
    return makeAutoObservable(data, {}, { deep: true });
  });

  const handleEvent = (eventType, eventData) => {
    return handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData);
  };

  const handleExternalUpdate = () => {
    configData.enable_feature = false;
    setMessage('External update applied: enable_feature = false');
  };

  return (
    <div>
      <ConfigPanel
        data={configData}
        config={config}
        onEvent={handleEvent}
      />
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleExternalUpdate} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          External Update
        </button>
      </div>
      {message && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px' }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
        <strong>Values:</strong> {JSON.stringify(configData)}
      </div>
    </div>
  );
});

const NarrowConfigPanelExample = observer(({ simulationConfig }) => {
  const [message, setMessage] = useState('');
  const [config] = useState(() => createConfigExampleConfig({
    compPath: ['narrow'],
    operationStateByPath: {
      narrow: {
        isEditable: true,
        isLocked: false
      }
    },
    items: [
      {
        id: 'narrow_group',
        label: 'Narrow container settings',
        type: 'group',
        children: [
          {
            id: 'enable_compact_feature',
            label: 'Enable compact extension behavior',
            description: 'A long description that remains available by wheel-scrolling the left region',
            type: 'boolean',
            defaultValue: true
          },
          {
            id: 'account_identifier',
            label: 'Account identifier',
            description: 'Long input control',
            type: 'string',
            defaultValue: 'account-with-a-long-readable-identifier'
          },
          {
            id: 'display_density',
            label: 'Display density',
            description: 'Wide segmented control',
            type: 'enum',
            options: ['comfortable', 'balanced', 'very compact'],
            defaultValue: 'balanced'
          },
          {
            id: 'permission_set_narrow',
            label: 'Permission set',
            description: 'Wide custom multi-control',
            type: 'custom',
            compName: 'permissionMulti',
            options: ['read', 'write', 'share', 'admin'],
            defaultValue: ['read', 'write']
          }
        ]
      }
    ],
    getComp: (compName) => (
      compName === 'permissionMulti' ? ConfigPermissionMultiControl : null
    )
  }));
  const [configData] = useState(() => makeAutoObservable({
    enable_compact_feature: true,
    account_identifier: 'account-with-a-long-readable-identifier',
    display_density: 'balanced',
    permission_set_narrow: ['read', 'write']
  }, {}, { deep: true }));

  return (
    <div>
      <ConfigPanel
        data={configData}
        config={config}
        onEvent={(eventType, eventData) => (
          handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData)
        )}
      />
      {message ? <div className={styles.configDemoMessage}>{message}</div> : null}
      <div className={styles.configDemoValues}>{JSON.stringify(configData, null, 2)}</div>
    </div>
  );
});

// Example 2: ConfigPanel with Tabs
const ConfigPanelWithTabsExample = observer(({ simulationConfig }) => {
  const [message, setMessage] = useState('');
  
  // Reusable config items
  const items = {
    enable_notifications: { id: 'enable_notifications', label: 'Enable Notifications', description: 'Receive notifications for important events', type: 'boolean', defaultValue: true },
    app_name: { id: 'app_name', label: 'Application Name', description: 'Custom name for your application', type: 'string', defaultValue: 'My App' },
    max_connections: { id: 'max_connections', label: 'Max Connections', description: 'Maximum number of concurrent connections', type: 'number', defaultValue: 10 },
    theme: { id: 'theme', label: 'Theme', description: 'Choose your preferred color theme', type: 'select', defaultValue: 'light', options: ['light', 'dark', 'auto'] },
    font_size: { id: 'font_size', label: 'Font Size', description: 'Adjust the default font size', type: 'select', defaultValue: 'medium', options: ['small', 'medium', 'large'] },
    compact_mode: { id: 'compact_mode', label: 'Compact Mode', description: 'Use compact layout to show more content', type: 'boolean', defaultValue: false },
    debug_mode: { id: 'debug_mode', label: 'Debug Mode', description: 'Enable detailed logging for troubleshooting', type: 'boolean', defaultValue: false },
    log_level: { id: 'log_level', label: 'Log Level', description: 'Set the verbosity of logging', type: 'select', defaultValue: 'info', options: ['error', 'warn', 'info', 'debug'] },
    cache_size: { id: 'cache_size', label: 'Cache Size (MB)', description: 'Maximum cache size in megabytes', type: 'number', defaultValue: 100 }
  };

  const groups = {
    general: { id: 'general_group', label: 'General Settings', type: 'group', children: [items.enable_notifications, items.app_name, items.max_connections] },
    ui: { id: 'ui_group', label: 'User Interface', type: 'group', children: [items.theme, items.font_size, items.compact_mode] },
    debug: { id: 'debug_group', label: 'Debug Options', type: 'group', children: [items.debug_mode, items.log_level] },
    performance: { id: 'performance_group', label: 'Performance', type: 'group', children: [items.cache_size] }
  };

  const [config] = useState(() => createConfigExampleConfig({
    compPath: ['root'],
    operationStateByPath: {
      root: {
        activeTabId: 'general_tab'
      }
    },
    items: [
      { id: 'general_tab', name: 'General', type: 'tab', children: [groups.general] },
      { id: 'appearance_tab', name: 'Appearance', type: 'tab', children: [groups.ui] },
      { id: 'advanced_tab', name: 'Advanced', type: 'tab', children: [groups.debug, groups.performance] }
    ]
  }));

  const [configData] = useState(() => {
    const data = {
      enable_notifications: true,
      app_name: 'My App',
      max_connections: 10,
      theme: 'light',
      font_size: 'medium',
      compact_mode: false,
      debug_mode: false,
      log_level: 'info',
      cache_size: 100
    };
    return makeAutoObservable(data, {}, { deep: true });
  });

  const handleEvent = (eventType, eventData) => {
    return handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData);
  };

  return (
    <div>
      <div style={{ height: '500px', maxWidth: '100%' }}>
        <ConfigPanelWithTabs
          data={configData}
          config={config}
          onEvent={handleEvent}
        />
      </div>
      {message && (
        <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px' }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
        <strong>Values:</strong> {JSON.stringify(configData, null, 2)}
      </div>
    </div>
  );
});

// Example 3: ConfigPanel with Tab Groups
const ConfigPanelWithTabGroupsExample = observer(({ simulationConfig }) => {
  const [message, setMessage] = useState('');
  
  // Define reusable config items
  const items = {
    enable_notifications: { id: 'enable_notifications', label: 'Enable Notifications', description: 'Receive notifications for important events', type: 'boolean', defaultValue: true },
    app_name: { id: 'app_name', label: 'Application Name', description: 'Custom name for your application', type: 'string', defaultValue: 'My App' },
    theme: { id: 'theme', label: 'Theme', description: 'Choose your preferred color theme', type: 'select', defaultValue: 'light', options: ['light', 'dark', 'auto'] },
    font_size: { id: 'font_size', label: 'Font Size', type: 'number', defaultValue: 14 },
    compact_mode: { id: 'compact_mode', label: 'Compact Mode', type: 'boolean', defaultValue: false },
    debug_mode: { id: 'debug_mode', label: 'Debug Mode', description: 'Enable detailed logging', type: 'boolean', defaultValue: false },
    log_level: { id: 'log_level', label: 'Log Level', type: 'select', defaultValue: 'info', options: ['error', 'warn', 'info', 'debug'] },
    cache_size: { id: 'cache_size', label: 'Cache Size (MB)', description: 'Maximum cache size', type: 'number', defaultValue: 100 },
    version: { id: 'version', label: 'Version', type: 'string', defaultValue: '1.0.0' }
  };

  // Compose into groups
  const groups = {
    general: { id: 'general_group', label: 'General Settings', type: 'group', children: [items.enable_notifications, items.app_name] },
    ui_basic: { id: 'ui_basic_group', label: 'Basic UI', type: 'group', children: [items.theme] },
    ui_advanced: { id: 'ui_advanced_group', label: 'Advanced UI', type: 'group', children: [items.font_size, items.compact_mode] },
    debug: { id: 'debug_group', label: 'Debug Options', type: 'group', children: [items.debug_mode, items.log_level] },
    performance: { id: 'perf_group', label: 'Performance Settings', type: 'group', children: [items.cache_size] },
    about: { id: 'about_group', label: 'Application Info', type: 'group', children: [items.version] }
  };

  // Compose into subtabs (for tabs that have subtabs)
  const subtabs = {
    ui_basic: { id: 'ui_basic_subtab', name: 'Basic', type: 'subtab', children: [groups.ui_basic] },
    ui_advanced: { id: 'ui_advanced_subtab', name: 'Advanced', type: 'subtab', children: [groups.ui_advanced] }
  };

  // Compose into tabs
  const tabs = {
    general: { id: 'general_tab', name: 'General', type: 'tab', children: [groups.general] },
    appearance: { id: 'appearance_tab', name: 'Appearance', type: 'tab', children: [subtabs.ui_basic, subtabs.ui_advanced] }, // Has subtabs!
    debug: { id: 'debug_tab', name: 'Debug', type: 'tab', children: [groups.debug] },
    performance: { id: 'performance_tab', name: 'Performance', type: 'tab', children: [groups.performance] },
    about: { id: 'about_tab', name: 'About', type: 'tab', children: [groups.about] },
    standalone: { id: 'standalone_tab', name: 'Standalone', type: 'tab', children: [groups.general] }
  };

  // Compose into tab groups
  const [config] = useState(() => createConfigExampleConfig({
    compPath: ['root'],
    operationStateByPath: {
      root: {
        activeTabId: 'general_tab'
      },
      'root.appearance_tab': {
        activeSubtabId: 'ui_basic_subtab'
      }
    },
    items: [
      // First group without name - no divider or name displayed
      { id: 'first_group', type: 'tab-group', children: [tabs.general, tabs.appearance] },
      // Advanced group with name
      { id: 'advanced_group', name: 'Advanced', type: 'tab-group', children: [tabs.debug, tabs.performance] },
      // Unnamed group - shows divider but no name
      { id: 'unnamed_group', name: '', type: 'tab-group', children: [tabs.about] },
      // Simple standalone tab (not in a group)
      tabs.standalone,
      // Invalid entry for testing
      { id: 'invalid_group', name: 'Invalid', type: 'invalid_type', children: [] }
    ]
  }));

  const [configData] = useState(() => {
    const data = {
      enable_notifications: true,
      app_name: 'My App',
      theme: 'light',
      font_size: 14,
      compact_mode: false,
      debug_mode: false,
      log_level: 'info',
      cache_size: 100,
      version: '1.0.0'
    };
    return makeAutoObservable(data, {}, { deep: true });
  });

  const handleEvent = (eventType, eventData) => {
    return handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData);
  };

  return (
    <div>
      <div style={{ height: '600px', maxWidth: '100%' }}>
        <ConfigPanelWithTabGroups
          data={configData}
          config={config}
          onEvent={handleEvent}
        />
      </div>
      {message && (
        <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px' }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
        <strong>Values:</strong> {JSON.stringify(configData, null, 2)}
      </div>
    </div>
  );
});

// Example 4: ConfigPanel with Subtabs
const ConfigPanelWithSubtabsExample = observer(({ simulationConfig }) => {
  const [message, setMessage] = useState('');
  
  // Reusable config items
  const items = {
    app_name: { id: 'app_name', label: 'Application Name', type: 'string', defaultValue: 'My App' },
    enable_notifications: { id: 'enable_notifications', label: 'Enable Notifications', type: 'boolean', defaultValue: true },
    theme: { id: 'theme', label: 'Theme', type: 'select', defaultValue: 'light', options: ['light', 'dark', 'auto'] },
    font_size: { id: 'font_size', label: 'Font Size', type: 'number', defaultValue: 14 },
    debug_mode: { id: 'debug_mode', label: 'Debug Mode', type: 'boolean', defaultValue: false }
  };

  const groups = {
    general: { id: 'general_group', label: 'General Settings', type: 'group', children: [items.app_name, items.enable_notifications] },
    display: { id: 'display_group', label: 'Display Options', type: 'group', children: [items.theme, items.font_size] },
    advanced: { id: 'advanced_group', label: 'Advanced Options', type: 'group', children: [items.debug_mode] }
  };

  const [config] = useState(() => createConfigExampleConfig({
    compPath: ['root'],
    operationStateByPath: {
      root: {
        activeSubtabId: 'general_subtab'
      }
    },
    items: [
      { id: 'general_subtab', name: 'General', type: 'subtab', children: [groups.general] },
      { id: 'display_subtab', name: 'Display', type: 'subtab', children: [groups.display] },
      { id: 'advanced_subtab', name: 'Advanced', type: 'subtab', children: [groups.advanced] }
    ]
  }));

  const [configData] = useState(() => {
    const data = {
      app_name: 'My App',
      enable_notifications: true,
      theme: 'light',
      font_size: 14,
      debug_mode: false
    };
    return makeAutoObservable(data, {}, { deep: true });
  });

  const handleEvent = (eventType, eventData) => {
    return handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData);
  };

  return (
    <div>
      <div style={{ height: '500px', maxWidth: '100%', border: '1px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
        <ConfigPanelWithSubtabs
          data={configData}
          config={config}
          onEvent={handleEvent}
        />
      </div>
      {message && (
        <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px' }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
        <strong>Values:</strong> {JSON.stringify(configData, null, 2)}
      </div>
    </div>
  );
});

// Consolidated examples panel
const ConfigPanelExamplesPanel = observer(() => {
  const [simulationConfig] = useState(() => makeAutoObservable({
    failureChance: 20,
    meanDelayMs: 600
  }));

  return (
    <div className={styles.configDemoPanel}>
      <div className={styles.configDemoTitle}>Config Panel Component Examples</div>

      <div className={styles.configDemoSimulationPanel}>
        <label className={styles.configDemoSimulationLabel}>
          Failure chance (%)
          <input
            className={styles.configDemoSimulationInput}
            type="number"
            min="0"
            max="100"
            value={simulationConfig.failureChance}
            onChange={(event) => { simulationConfig.failureChance = Number(event.target.value); }}
          />
        </label>
        <label className={styles.configDemoSimulationLabel}>
          Mean delay (ms)
          <input
            className={styles.configDemoSimulationInput}
            type="number"
            min="0"
            step="50"
            value={simulationConfig.meanDelayMs}
            onChange={(event) => { simulationConfig.meanDelayMs = Number(event.target.value); }}
          />
        </label>
        <div className={styles.configDemoSimulationHint}>Value changes show pending state, then success or hoverable error.</div>
      </div>

      <div className={styles.configDemoSection}>
        <div className={styles.configDemoSectionTitle}>1. Basic ConfigPanel</div>
        <div className={styles.configDemoSectionDescription}>Simple configuration panel with groups and basic field types.</div>
        <div style={{ maxWidth: '500px' }}>
          <BasicConfigPanelExample simulationConfig={simulationConfig} />
        </div>
      </div>

      <div className={styles.configDemoSection}>
        <div className={styles.configDemoSectionTitle}>2. ConfigPanel with Tabs</div>
        <div className={styles.configDemoSectionDescription}>Configuration panel with vertical tabs for organizing multiple sections.</div>
        <div style={{ maxWidth: '900px' }}>
          <ConfigPanelWithTabsExample simulationConfig={simulationConfig} />
        </div>
      </div>

      <div className={styles.configDemoSection}>
        <div className={styles.configDemoSectionTitle}>3. ConfigPanel with Tab Groups</div>
        <div className={styles.configDemoSectionDescription}>Configuration panel with grouped tabs, supports subtabs and simple tabs.</div>
        <div style={{ maxWidth: '900px' }}>
          <ConfigPanelWithTabGroupsExample simulationConfig={simulationConfig} />
        </div>
      </div>

      <div className={styles.configDemoSection}>
        <div className={styles.configDemoSectionTitle}>4. ConfigPanel with Subtabs</div>
        <div className={styles.configDemoSectionDescription}>Configuration panel with horizontal subtabs at the top.</div>
        <div style={{ maxWidth: '900px' }}>
          <ConfigPanelWithSubtabsExample simulationConfig={simulationConfig} />
        </div>
      </div>

      <div className={styles.configDemoSection}>
        <div className={styles.configDemoSectionTitle}>5. Narrow ConfigPanel</div>
        <div className={styles.configDemoSectionDescription}>Wheel-scroll the clipped text and control regions independently.</div>
        <div className={styles.configDemoNarrow}>
          <NarrowConfigPanelExample simulationConfig={simulationConfig} />
        </div>
      </div>
    </div>
  );
});

async function handleConfigExampleEvent(configData, config, setMessage, simulationConfig, eventType, eventData) {
  if (eventType === 'valueDefaultSetAttempt') {
    configData[eventData.valueId] = eventData.value;
    setMessage(`Changed ${eventData.valueId} to ${JSON.stringify(eventData.value)}`);
    return { code: 0 };
  }

  if (eventType === 'valueChangeAttempt') {
    const itemPathText = eventData.itemPathText ?? eventData.valueId;
    if (config.requestStateByPath[itemPathText]?.status === 'pending') {
      return { code: -1, message: 'request already pending' };
    }
    config.requestStateByPath[itemPathText] = {
      status: 'pending',
      valueNext: eventData.value,
      message: ''
    };
    const result = await simulateConfigServer(simulationConfig);
    if (result.code === 0) {
      configData[eventData.valueId] = eventData.value;
      delete config.requestStateByPath[itemPathText];
      setMessage(`Changed ${eventData.valueId} to ${JSON.stringify(eventData.value)} (${result.message})`);
      return result;
    }
    config.requestStateByPath[itemPathText] = {
      status: 'error',
      message: result.message
    };
    setMessage(`Failed to change ${eventData.valueId}: ${result.message}`);
    return result;
  }

  if (eventType === 'activeTabChange') {
    const operationState = getConfigExampleOperationState(config, eventData.compPathText);
    operationState.activeTabId = eventData.tabId;
    setMessage(`Selected tab ${eventData.tabId}`);
    return { code: 0 };
  }

  if (eventType === 'activeSubtabChange') {
    const operationState = getConfigExampleOperationState(config, eventData.compPathText);
    operationState.activeSubtabId = eventData.subtabId;
    setMessage(`Selected subtab ${eventData.subtabId}`);
    return { code: 0 };
  }

  return { code: 0 };
}

function getConfigExampleOperationState(config, compPathText) {
  if (!config.operationStateByPath[compPathText]) {
    config.operationStateByPath[compPathText] = {};
  }

  return config.operationStateByPath[compPathText];
}

export const configExamples = {
  'ConfigPanel': {
    component: ConfigPanel,
    description: 'Configuration UI components with various layouts: basic, tabs, tab groups, and subtabs',
    example: ConfigPanelExamplesPanel,
    routeAliases: ['config', 'configuration'],
  }
};
