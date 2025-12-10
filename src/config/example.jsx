import { useState } from 'react';
import ConfigPanel from './Config.tsx';
import ConfigPanelWithTabs from './ConfigTab.tsx';
import ConfigPanelWithTabGroups from './ConfigTabGroup.tsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.tsx';

export const configExamples = {
  'ConfigPanel': {
    component: ConfigPanel,
    description: 'General-purpose configuration UI component with separated struct and values',
    example: () => {
      const ConfigTest = () => {
        const [message, setMessage] = useState('');
        
        const configStruct = {
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
          ]
        };

        const [configValue, setConfigValue] = useState({
          enable_feature: true,
          username: 'john_doe',
          theme: 'light'
        });

        const handleChange = (id, newValue) => {
          console.log('Config changed:', id, '=', newValue);
          setConfigValue(prev => ({ ...prev, [id]: newValue }));
          setMessage(`Changed ${id} to ${JSON.stringify(newValue)}`);
        };

        const handleExternalUpdate = () => {
          setConfigValue(prev => ({ ...prev, enable_feature: false }));
          setMessage('External update applied: enable_feature = false');
        };

        return (
          <div style={{ padding: '20px', maxWidth: '500px' }}>
            <ConfigPanel
              configStruct={configStruct}
              configValue={configValue}
              onInternalChange={handleChange}
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
              <strong>Values:</strong> {JSON.stringify(configValue)}
            </div>
          </div>
        );
      };
      return <ConfigTest />;
    }
  },
  'ConfigPanelWithTabs': {
    component: ConfigPanelWithTabs,
    description: 'Configuration UI with tab-based layout for organizing multiple sections',
    example: () => {
      const ConfigPanelWithTabsTest = () => {
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

        const configStruct = {
          items: [
            { id: 'general_tab', name: 'General', type: 'tab', children: [groups.general] },
            { id: 'appearance_tab', name: 'Appearance', type: 'tab', children: [groups.ui] },
            { id: 'advanced_tab', name: 'Advanced', type: 'tab', children: [groups.debug, groups.performance] },
            { id: 'invalid_tab', name: 'Invalid Tab', type: 'invalid_type', children: [] }
          ]
        };

        const [configValue, setConfigValue] = useState({
          enable_notifications: true,
          app_name: 'My App',
          max_connections: 10,
          theme: 'light',
          font_size: 'medium',
          compact_mode: false,
          debug_mode: false,
          log_level: 'info',
          cache_size: 100
        });

        const handleChange = (id, newValue) => {
          console.log('ConfigTab changed:', id, '=', newValue);
          setConfigValue(prev => ({ ...prev, [id]: newValue }));
          setMessage(`Changed ${id} to ${JSON.stringify(newValue)}`);
        };

        return (
          <div style={{ padding: '20px' }}>
            <div style={{ height: '500px', maxWidth: '900px' }}>
              <ConfigPanelWithTabs
                configStruct={configStruct}
                configValue={configValue}
                onInternalChange={handleChange}
              />
            </div>
            {message && (
              <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px', maxWidth: '900px' }}>
                {message}
              </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px', maxWidth: '900px' }}>
              <strong>Values:</strong> {JSON.stringify(configValue, null, 2)}
            </div>
          </div>
        );
      };
      return <ConfigPanelWithTabsTest />;
    }
  },
  'ConfigPanelWithTabGroups': {
    component: ConfigPanelWithTabGroups,
    description: 'Configuration UI with grouped tabs, supports subtabs and simple tabs',
    example: () => {
      const ConfigPanelWithTabGroupsTest = () => {
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
        const configStruct = {
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
        };

        const [configValue, setConfigValue] = useState({
          enable_notifications: true,
          app_name: 'My App',
          theme: 'light',
          font_size: 14,
          compact_mode: false,
          debug_mode: false,
          log_level: 'info',
          cache_size: 100,
          version: '1.0.0'
        });

        const handleChange = (id, newValue) => {
          console.log('ConfigTabGroups changed:', id, '=', newValue);
          setConfigValue(prev => ({ ...prev, [id]: newValue }));
          setMessage(`Changed ${id} to ${JSON.stringify(newValue)}`);
        };

        return (
          <div style={{ padding: '20px' }}>
            <div style={{ height: '600px', maxWidth: '900px' }}>
              <ConfigPanelWithTabGroups
                configStruct={configStruct}
                configValue={configValue}
                onInternalChange={handleChange}
              />
            </div>
            {message && (
              <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px', maxWidth: '900px' }}>
                {message}
              </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px', maxWidth: '900px' }}>
              <strong>Values:</strong> {JSON.stringify(configValue, null, 2)}
            </div>
          </div>
        );
      };
      return <ConfigPanelWithTabGroupsTest />;
    }
  },
  'ConfigPanelWithSubtabs': {
    component: ConfigPanelWithSubtabs,
    description: 'Configuration UI with horizontal subtabs (like browser tabs) at the top',
    example: () => {
      const ConfigPanelWithSubtabsTest = () => {
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

        const configStruct = {
          items: [
            { id: 'general_subtab', name: 'General', type: 'subtab', children: [groups.general] },
            { id: 'display_subtab', name: 'Display', type: 'subtab', children: [groups.display] },
            { id: 'advanced_subtab', name: 'Advanced', type: 'subtab', children: [groups.advanced] }
          ]
        };

        const [configValue, setConfigValue] = useState({
          app_name: 'My App',
          enable_notifications: true,
          theme: 'light',
          font_size: 14,
          debug_mode: false
        });

        const handleChange = (id, newValue) => {
          console.log('ConfigPanelWithSubtabs changed:', id, '=', newValue);
          setConfigValue(prev => ({ ...prev, [id]: newValue }));
          setMessage(`Changed ${id} to ${JSON.stringify(newValue)}`);
        };

        return (
          <div style={{ padding: '20px' }}>
            <div style={{ height: '500px', maxWidth: '900px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <ConfigPanelWithSubtabs
                configStruct={configStruct}
                configValue={configValue}
                onInternalChange={handleChange}
              />
            </div>
            {message && (
              <div style={{ marginTop: '20px', padding: '8px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '13px', maxWidth: '900px' }}>
                {message}
              </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px', maxWidth: '900px' }}>
              <strong>Values:</strong> {JSON.stringify(configValue, null, 2)}
            </div>
          </div>
        );
      };
      return <ConfigPanelWithSubtabsTest />;
    }
  },
};

