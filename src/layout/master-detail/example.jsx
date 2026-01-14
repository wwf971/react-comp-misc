import { useState } from 'react';
import MasterDetail, { Tab, SubTab, Panel } from './MasterDetail.tsx';
import MasterDetailInfiLevel, { 
  Tab as ITab, 
  SubTab as ISubTab, 
  Panel as IPanel 
} from './MasterDetailInfiLevel.tsx';

// Example 1: 2-level layout
const TwoLevelExample = () => (
  <MasterDetail title="Two Levels" sidebarWidth="200px">
    <Tab label="Tab 1">
      <SubTab label="SubTab 1.1" isDefault>
        <Panel>
          <div style={{padding: '20px'}}>
            <h3>Panel 1.1</h3>
            <p>This uses the optimized 2-level implementation.</p>
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
);

// Example 2: Auto-detect deep nesting
const AutoDeepExample = () => (
  <MasterDetail title="Auto Deep Mode" sidebarWidth="250px">
    <Tab label="Category A">
      <SubTab label="A-1">
        <SubTab label="A-1-1">
          <SubTab label="A-1-1-1" isDefault>
            <Panel>
              <div style={{padding: '20px'}}>
                <h3>Deep Nested (Auto)</h3>
                <p>MasterDetail detected depth {'>'} 2 and automatically delegated to MasterDetailInfiLevel!</p>
                <p>Depth: 4 levels (Category → A-1 → A-1-1 → A-1-1-1)</p>
              </div>
            </Panel>
          </SubTab>
        </SubTab>
      </SubTab>
    </Tab>
  </MasterDetail>
);

// Example 3: Infinite levels
const InfiniteLevelsExample = () => (
  <MasterDetailInfiLevel title="Infinite Levels" sidebarWidth="250px">
    <ITab label="Level 0: Category A">
      <ISubTab label="Level 1: A-1">
        <ISubTab label="Level 2: A-1-1">
          <ISubTab label="Level 3: A-1-1-1" isDefault>
            <IPanel>
              <div style={{padding: '20px'}}>
                <h3>Deep Nested Content</h3>
                <p>This is 4 levels deep (Level 0 → 1 → 2 → 3)</p>
              </div>
            </IPanel>
          </ISubTab>
          <ISubTab label="Level 3: A-1-1-2">
            <IPanel>
              <div style={{padding: '20px'}}>
                <h3>Another Deep Item</h3>
                <p>Same depth, different branch</p>
              </div>
            </IPanel>
          </ISubTab>
        </ISubTab>
        <ISubTab label="Level 2: A-1-2">
          <IPanel>
            <div style={{padding: '20px'}}>
              <h3>Shallower Content</h3>
              <p>This is only 3 levels deep</p>
            </div>
          </IPanel>
        </ISubTab>
      </ISubTab>
      <ISubTab label="Level 1: A-2">
        <IPanel>
          <div style={{padding: '20px'}}>
            <h3>Simple Content</h3>
            <p>Just 2 levels deep</p>
          </div>
        </IPanel>
      </ISubTab>
    </ITab>
    <ITab label="Level 0: Category B">
      <ISubTab label="Level 1: B-1">
        <ISubTab label="Level 2: B-1-1">
          <ISubTab label="Level 3: B-1-1-1">
            <ISubTab label="Level 4: B-1-1-1-1">
              <IPanel>
                <div style={{padding: '20px'}}>
                  <h3>Very Deep Content</h3>
                  <p>This is 5 levels deep!</p>
                  <p>Level 0 → 1 → 2 → 3 → 4</p>
                </div>
              </IPanel>
            </ISubTab>
          </ISubTab>
        </ISubTab>
      </ISubTab>
    </ITab>
  </MasterDetailInfiLevel>
);

// Consolidated panel with radio buttons
const MasterDetailExamplesPanel = () => {
  const [selectedExample, setSelectedExample] = useState('two-level');

  const examples = [
    { id: 'two-level', label: '2-Level Layout', description: 'Optimized 2-level implementation (Tab + SubTab)' },
    { id: 'auto-deep', label: 'Auto-Detect Deep', description: 'Auto-switches to infinite levels when depth > 2' },
    { id: 'infinite', label: 'Infinite Levels', description: 'Explicit infinite nested levels support' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Master-Detail Layout Examples</h2>
      
      {/* Radio button group */}
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
        {examples.map(example => (
          <label 
            key={example.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <input
              type="radio"
              name="master-detail-example"
              value={example.id}
              checked={selectedExample === example.id}
              onChange={(e) => setSelectedExample(e.target.value)}
              style={{ marginRight: '8px', marginTop: '2px' }}
            />
            <div>
              <span style={{ fontWeight: selectedExample === example.id ? 'bold' : 'normal' }}>
                {example.label}
              </span>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                {example.description}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Example content */}
      <div style={{ flex: 1, minHeight: 0, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        {selectedExample === 'two-level' && <TwoLevelExample />}
        {selectedExample === 'auto-deep' && <AutoDeepExample />}
        {selectedExample === 'infinite' && <InfiniteLevelsExample />}
      </div>
    </div>
  );
};

export const layoutExamples = {
  'MasterDetail': {
    component: MasterDetail,
    description: 'Master-detail layouts with 2-level, auto-detect deep, and infinite levels',
    example: MasterDetailExamplesPanel
  }
};

