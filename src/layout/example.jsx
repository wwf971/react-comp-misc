import MasterDetail, { Tab, SubTab, Panel } from './MasterDetail.tsx';

export const layoutExamples = {
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
};

