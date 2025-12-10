import { useState } from 'react';
import ConfigPanel from './Config.tsx';
import ConfigPanelWithTabs from './ConfigTab.tsx';
import ConfigPanelWithTabGroups from './ConfigTabGroup.tsx';

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
        
        const configStruct = {
          items: [
            {
              id: 'general_tab',
              name: 'General',
              type: 'tab',
              children: [
                {
                  id: 'general_group',
                  label: 'General Settings',
                  type: 'group',
                  children: [
                    {
                      id: 'enable_notifications',
                      label: 'Enable Notifications',
                      description: 'Receive notifications for important events',
                      type: 'boolean',
                      defaultValue: true
                    },
                    {
                      id: 'app_name',
                      label: 'Application Name',
                      description: 'Custom name for your application',
                      type: 'string',
                      defaultValue: 'My App'
                    },
                    {
                      id: 'max_connections',
                      label: 'Max Connections',
                      description: 'Maximum number of concurrent connections',
                      type: 'number',
                      defaultValue: 10
                    }
                  ]
                }
              ]
            },
            {
              id: 'appearance_tab',
              name: 'Appearance',
              type: 'tab',
              children: [
                {
                  id: 'ui_group',
                  label: 'User Interface',
                  type: 'group',
                  children: [
                    {
                      id: 'theme',
                      label: 'Theme',
                      description: 'Choose your preferred color theme',
                      type: 'select',
                      defaultValue: 'light',
                      options: ['light', 'dark', 'auto']
                    },
                    {
                      id: 'font_size',
                      label: 'Font Size',
                      description: 'Adjust the default font size',
                      type: 'select',
                      defaultValue: 'medium',
                      options: ['small', 'medium', 'large']
                    },
                    {
                      id: 'compact_mode',
                      label: 'Compact Mode',
                      description: 'Use compact layout to show more content',
                      type: 'boolean',
                      defaultValue: false
                    }
                  ]
                }
              ]
            },
            {
              id: 'advanced_tab',
              name: 'Advanced',
              type: 'tab',
              children: [
                {
                  id: 'debug_group',
                  label: 'Debug Options',
                  type: 'group',
                  children: [
                    {
                      id: 'debug_mode',
                      label: 'Debug Mode',
                      description: 'Enable detailed logging for troubleshooting',
                      type: 'boolean',
                      defaultValue: false
                    },
                    {
                      id: 'log_level',
                      label: 'Log Level',
                      description: 'Set the verbosity of logging',
                      type: 'select',
                      defaultValue: 'info',
                      options: ['error', 'warn', 'info', 'debug']
                    }
                  ]
                },
                {
                  id: 'performance_group',
                  label: 'Performance',
                  type: 'group',
                  children: [
                    {
                      id: 'cache_size',
                      label: 'Cache Size (MB)',
                      description: 'Maximum cache size in megabytes',
                      type: 'number',
                      defaultValue: 100
                    }
                  ]
                }
              ]
            },
            {
              id: 'invalid_tab',
              name: 'Invalid Tab',
              type: 'invalid_type',
              children: [
                {
                  id: 'dummy',
                  label: 'This should show error',
                  type: 'boolean',
                  defaultValue: true
                }
              ]
            }
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
    description: 'Configuration UI with grouped tabs for organizing complex settings',
    example: () => {
      const ConfigPanelWithTabGroupsTest = () => {
        const [message, setMessage] = useState('');
        
        const configStruct = {
          items: [
            {
              id: 'first_group',
              // No name for first group - should not show divider or name
              type: 'tab-group',
              children: [
                {
                  id: 'general_tab',
                  name: 'General',
                  type: 'tab',
                  children: [
                    {
                      id: 'general_group',
                      label: 'General Settings',
                      type: 'group',
                      children: [
                        {
                          id: 'enable_notifications',
                          label: 'Enable Notifications',
                          description: 'Receive notifications for important events',
                          type: 'boolean',
                          defaultValue: true
                        },
                        {
                          id: 'app_name',
                          label: 'Application Name',
                          description: 'Custom name for your application',
                          type: 'string',
                          defaultValue: 'My App'
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'appearance_tab',
                  name: 'Appearance',
                  type: 'tab',
                  children: [
                    {
                      id: 'ui_group',
                      label: 'User Interface',
                      type: 'group',
                      children: [
                        {
                          id: 'theme',
                          label: 'Theme',
                          description: 'Choose your preferred color theme',
                          type: 'select',
                          defaultValue: 'light',
                          options: ['light', 'dark', 'auto']
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'advanced_group',
              name: 'Advanced',
              type: 'tab-group',
              children: [
                {
                  id: 'debug_tab',
                  name: 'Debug',
                  type: 'tab',
                  children: [
                    {
                      id: 'debug_group',
                      label: 'Debug Options',
                      type: 'group',
                      children: [
                        {
                          id: 'debug_mode',
                          label: 'Debug Mode',
                          description: 'Enable detailed logging',
                          type: 'boolean',
                          defaultValue: false
                        },
                        {
                          id: 'log_level',
                          label: 'Log Level',
                          type: 'select',
                          defaultValue: 'info',
                          options: ['error', 'warn', 'info', 'debug']
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'performance_tab',
                  name: 'Performance',
                  type: 'tab',
                  children: [
                    {
                      id: 'perf_group',
                      label: 'Performance Settings',
                      type: 'group',
                      children: [
                        {
                          id: 'cache_size',
                          label: 'Cache Size (MB)',
                          description: 'Maximum cache size',
                          type: 'number',
                          defaultValue: 100
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'unnamed_group',
              // Empty name - should show divider but no name
              name: '',
              type: 'tab-group',
              children: [
                {
                  id: 'about_tab',
                  name: 'About',
                  type: 'tab',
                  children: [
                    {
                      id: 'about_group',
                      label: 'Application Info',
                      type: 'group',
                      children: [
                        {
                          id: 'version',
                          label: 'Version',
                          type: 'string',
                          defaultValue: '1.0.0'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'invalid_group',
              name: 'Invalid Group',
              type: 'invalid_type',
              children: [
                {
                  id: 'dummy_tab',
                  name: 'Dummy',
                  type: 'tab',
                  children: []
                }
              ]
            }
          ]
        };

        const [configValue, setConfigValue] = useState({
          enable_notifications: true,
          app_name: 'My App',
          theme: 'light',
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
};

