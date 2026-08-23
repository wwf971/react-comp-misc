import { useMemo } from 'react';
import MasterDetail, { Tab, SubTab, Panel } from './MasterDetail.jsx';
import MasterDetailInfiLevel, {
  Tab as ITab,
  SubTab as ISubTab,
  Panel as IPanel,
} from './MasterDetailInfiLevel.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  CompDemoArea,
} from '../../dev/demo/DemoLayout.jsx';
import {
  ExampleGroup,
  ExampleSwitcher,
  ExampleSwitchButtons,
  ExampleJumpLink,
} from '../../dev/demo/ExampleGroup.jsx';
import { createStoreExampleGroup } from '../../dev/demo/demoStores.js';
import './exampleMasterDetail.css';

const TwoLevelExample = () => (
  <Example title="2-Level Layout">
    <Explanation>Optimized 2-level implementation (Tab + SubTab).</Explanation>
    <CompDemoArea>
      <div className="master-detail-example-frame">
        <MasterDetail title="Two Levels" sidebarWidth="200px">
          <Tab label="Tab 1">
            <SubTab label="SubTab 1.1" isDefault>
              <Panel>
                <div className="master-detail-example-panel-body">
                  <div className="master-detail-example-panel-title">Panel 1.1</div>
                  <div className="master-detail-example-panel-text">This uses the optimized 2-level implementation.</div>
                </div>
              </Panel>
            </SubTab>
            <SubTab label="SubTab 1.2">
              <Panel>
                <div className="master-detail-example-panel-body">
                  <div className="master-detail-example-panel-title">Panel 1.2</div>
                  <div className="master-detail-example-panel-text">This is the second panel content.</div>
                </div>
              </Panel>
            </SubTab>
          </Tab>
          <Tab label="Tab 2">
            <SubTab label="SubTab 2.1">
              <Panel>
                <div className="master-detail-example-panel-body">
                  <div className="master-detail-example-panel-title">Panel 2.1</div>
                  <div className="master-detail-example-panel-text">This is panel 2.1 content.</div>
                </div>
              </Panel>
            </SubTab>
          </Tab>
        </MasterDetail>
      </div>
    </CompDemoArea>
  </Example>
);

const AutoDeepExample = () => (
  <Example title="Auto-Detect Deep">
    <Explanation>Auto-switches to infinite levels when depth &gt; 2.</Explanation>
    <CompDemoArea>
      <div className="master-detail-example-frame">
        <MasterDetail title="Auto Deep Mode" sidebarWidth="250px">
          <Tab label="Category A">
            <SubTab label="A-1">
              <SubTab label="A-1-1">
                <SubTab label="A-1-1-1" isDefault>
                  <Panel>
                    <div className="master-detail-example-panel-body">
                      <div className="master-detail-example-panel-title">Deep Nested (Auto)</div>
                      <div className="master-detail-example-panel-text">
                        MasterDetail detected depth {'>'} 2 and automatically delegated to MasterDetailInfiLevel!
                      </div>
                      <div className="master-detail-example-panel-text">
                        Depth: 4 levels (Category → A-1 → A-1-1 → A-1-1-1)
                      </div>
                    </div>
                  </Panel>
                </SubTab>
              </SubTab>
            </SubTab>
          </Tab>
        </MasterDetail>
      </div>
    </CompDemoArea>
  </Example>
);

const InfiniteLevelsExample = () => (
  <Example title="Infinite Levels">
    <Explanation>Explicit infinite nested levels support.</Explanation>
    <CompDemoArea>
      <div className="master-detail-example-frame">
        <MasterDetailInfiLevel title="Infinite Levels" sidebarWidth="250px">
          <ITab label="Level 0: Category A">
            <ISubTab label="Level 1: A-1">
              <ISubTab label="Level 2: A-1-1">
                <ISubTab label="Level 3: A-1-1-1" isDefault>
                  <IPanel>
                    <div className="master-detail-example-panel-body">
                      <div className="master-detail-example-panel-title">Deep Nested Content</div>
                      <div className="master-detail-example-panel-text">This is 4 levels deep (Level 0 → 1 → 2 → 3)</div>
                    </div>
                  </IPanel>
                </ISubTab>
                <ISubTab label="Level 3: A-1-1-2">
                  <IPanel>
                    <div className="master-detail-example-panel-body">
                      <div className="master-detail-example-panel-title">Another Deep Item</div>
                      <div className="master-detail-example-panel-text">Same depth, different branch</div>
                    </div>
                  </IPanel>
                </ISubTab>
              </ISubTab>
              <ISubTab label="Level 2: A-1-2">
                <IPanel>
                  <div className="master-detail-example-panel-body">
                    <div className="master-detail-example-panel-title">Shallower Content</div>
                    <div className="master-detail-example-panel-text">This is only 3 levels deep</div>
                  </div>
                </IPanel>
              </ISubTab>
            </ISubTab>
            <ISubTab label="Level 1: A-2">
              <IPanel>
                <div className="master-detail-example-panel-body">
                  <div className="master-detail-example-panel-title">Simple Content</div>
                  <div className="master-detail-example-panel-text">Just 2 levels deep</div>
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
                      <div className="master-detail-example-panel-body">
                        <div className="master-detail-example-panel-title">Very Deep Content</div>
                        <div className="master-detail-example-panel-text">This is 5 levels deep!</div>
                        <div className="master-detail-example-panel-text">Level 0 → 1 → 2 → 3 → 4</div>
                      </div>
                    </IPanel>
                  </ISubTab>
                </ISubTab>
              </ISubTab>
            </ISubTab>
          </ITab>
        </MasterDetailInfiLevel>
      </div>
    </CompDemoArea>
  </Example>
);

const MasterDetailExamplesPanel = () => {
  const storeGroup = useMemo(() => createStoreExampleGroup({ exampleActiveId: 'two-level' }), []);

  return (
    <DemoPanel>
      <Explanation titleText="Master-Detail Layout">
        Master-detail layouts with 2-level, auto-detect deep, and infinite levels.
      </Explanation>
      <ExampleGroup title="Layout modes" store={storeGroup}>
        <Explanation>
          <ul>
            <li>
              <ExampleJumpLink data={{ exampleId: 'two-level' }}>2-Level Layout</ExampleJumpLink> is the optimized Tab + SubTab implementation.
            </li>
            <li>
              <ExampleJumpLink data={{ exampleId: 'auto-deep' }}>Auto-Detect Deep</ExampleJumpLink> switches to infinite levels when depth is greater than 2.
            </li>
            <li>
              <ExampleJumpLink data={{ exampleId: 'infinite' }}>Infinite Levels</ExampleJumpLink> uses MasterDetailInfiLevel explicitly.
            </li>
          </ul>
        </Explanation>
        <Controls>
          <ExampleSwitchButtons />
        </Controls>
        <ExampleSwitcher>
          <TwoLevelExample exampleId="two-level" labelText="2-Level Layout" />
          <AutoDeepExample exampleId="auto-deep" labelText="Auto-Detect Deep" />
          <InfiniteLevelsExample exampleId="infinite" labelText="Infinite Levels" />
        </ExampleSwitcher>
      </ExampleGroup>
    </DemoPanel>
  );
};

export const layoutExamples = {
  MasterDetail: {
    component: MasterDetail,
    description: 'Master-detail layouts with 2-level, auto-detect deep, and infinite levels',
    example: MasterDetailExamplesPanel,
  },
};

export default MasterDetailExamplesPanel;
