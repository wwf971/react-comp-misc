import MasterDetail, { Tab, SubTab, Panel } from './MasterDetail.tsx';
import MasterDetailInfiLevel, { 
  Tab as ITab, 
  SubTab as ISubTab, 
  Panel as IPanel 
} from './MasterDetailInfiLevel.tsx';

export const layoutExamples = {
  'MasterDetail (2-level)': {
    component: MasterDetail,
    description: 'Master-detail layout with 2 levels (Tab + SubTab)',
    example: () => (
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
    )
  },
  'MasterDetail (auto-detect deep)': {
    component: MasterDetail,
    description: 'Same component, auto-switches to infinite levels when depth > 2',
    example: () => (
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
    )
  },
  'MasterDetailInfiLevel': {
    component: MasterDetailInfiLevel,
    description: 'Master-detail with infinite nested levels',
    example: () => (
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
    )
  },
};

