// import all components in this package
import { 
  FileIconDefault, 
  DeleteIcon, 
  SearchIcon, 
  ClearIcon, 
  InfoIcon,
  SuccessIcon,
  ErrorIcon,
  UploadIcon,
  BackIcon,
  ForwardIcon
} from '../icon/Icon.jsx';
import MasterDetail, { Tab, SubTab, Panel } from '../layout/MasterDetail.tsx';
import Login from '../auth/Login.jsx';
import Config from '../config/Config.tsx';
import { useState, useRef } from 'react';

export const components = {
  'Login': {
    component: Login,
    description: 'Reusable login form with timeout error handling',
    example: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', background: '#f5f5f5' }}>
        <Login 
          title="Login"
          loginEndpoint="/api/login"
          timeout={5000}
          onSuccess={(data) => alert('Login successful!')}
          useAuthToken={true}
          authTokenKey="authToken"
          showTokenAtLogin={true}
        />
      </div>
    )
  },
  'MasterDetail': {
    component: MasterDetail,
    description: 'Master-detail layout with tabs and panels',
    example: () => (
      <MasterDetail title="Example" sidebarWidth="200px">
        <Tab label="Tab 1">
          <SubTab label="SubTab 1.1" isDefault>
            <Panel>
              <div style={{padding: '20px'}}>
                <h3>Panel 1.1</h3>
                <p>This is the first panel content.</p>
              </div>
            </Panel>
          </SubTab>
          <SubTab label="SubTab 1.2">
            <Panel>
              <div style={{padding: '20px'}}>
                <h3>Panel 1.2</h3>
                <p>This is the second panel content.</p>
              </div>
            </Panel>
          </SubTab>
        </Tab>
        <Tab label="Tab 2">
          <SubTab label="SubTab 2.1">
            <Panel>
              <div style={{padding: '20px'}}>
                <h3>Panel 2.1</h3>
                <p>This is panel 2.1 content.</p>
              </div>
            </Panel>
          </SubTab>
        </Tab>
      </MasterDetail>
    )
  },
  'FileIconDefault': {
    component: FileIconDefault,
    description: 'Default file icon SVG',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <FileIconDefault width={24} height={24} />
        <FileIconDefault width={48} height={48} />
        <FileIconDefault width={64} height={64} />
      </div>
    )
  },
  'DeleteIcon': {
    component: DeleteIcon,
    description: 'Delete/trash icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <DeleteIcon width={24} height={24} />
        <DeleteIcon width={48} height={48} />
      </div>
    )
  },
  'SearchIcon': {
    component: SearchIcon,
    description: 'Search/magnifying glass icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <SearchIcon width={24} height={24} />
        <SearchIcon width={48} height={48} />
      </div>
    )
  },
  'ClearIcon': {
    component: ClearIcon,
    description: 'Clear/reset icon (clockwise arrow)',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <ClearIcon width={24} height={24} />
        <ClearIcon width={48} height={48} />
      </div>
    )
  },
  'InfoIcon': {
    component: InfoIcon,
    description: 'Information icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <InfoIcon width={24} height={24} />
        <InfoIcon width={48} height={48} />
      </div>
    )
  },
  'SuccessIcon': {
    component: SuccessIcon,
    description: 'Success/checkmark icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: 'green'}}>
        <SuccessIcon width={24} height={24} />
        <SuccessIcon width={48} height={48} />
      </div>
    )
  },
  'ErrorIcon': {
    component: ErrorIcon,
    description: 'Error/X icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: 'red'}}>
        <ErrorIcon width={24} height={24} />
        <ErrorIcon width={48} height={48} />
      </div>
    )
  },
  'UploadIcon': {
    component: UploadIcon,
    description: 'Upload/cloud upload icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <UploadIcon width={24} height={24} />
        <UploadIcon width={48} height={48} />
      </div>
    )
  },
  'BackIcon': {
    component: BackIcon,
    description: 'Back/previous arrow icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <BackIcon width={24} height={24} />
        <BackIcon width={48} height={48} />
      </div>
    )
  },
  'ForwardIcon': {
    component: ForwardIcon,
    description: 'Forward/next arrow icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <ForwardIcon width={24} height={24} />
        <ForwardIcon width={48} height={48} />
      </div>
    )
  },
  'Config': {
    component: Config,
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
              items: [
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
              items: [
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
            <Config
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
};

