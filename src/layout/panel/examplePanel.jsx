import { useMemo } from 'react';
import PanelToggle from './PanelToggle.jsx';
import PanelDual from './PanelDual.jsx';
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
import './panel.css';

const ExamplePanelToggle = () => (
  <Example title="PanelToggle">
    <Explanation>Collapsible panel with a title row and expand/collapse control.</Explanation>
    <CompDemoArea>
      <PanelToggle title="PanelToggle.jsx" defaultExpanded={true}>
        <div className="panel-toggle-content">
          <div className="panel-toggle-item">Option 1: Enabled</div>
          <div className="panel-toggle-item">Option 2: Disabled</div>
          <div className="panel-toggle-item">Option 3: Auto</div>
        </div>
      </PanelToggle>
    </CompDemoArea>
  </Example>
);

const ExamplePanelDual = () => (
  <Example title="PanelDual">
    <Explanation>Drag the split line to adjust the panel ratio.</Explanation>
    <CompDemoArea>
      <div className="panel-dual-example-section">
        <div className="panel-dual-example-label">Vertical split</div>
        <div className="panel-dual-example-frame">
          <PanelDual orientation="vertical" initialRatio={0.35}>
            <div className="panel-dual-example-pane panel-dual-example-pane-a">
              Left panel
            </div>
            <div className="panel-dual-example-pane panel-dual-example-pane-b">
              Right panel
            </div>
          </PanelDual>
        </div>
      </div>
      <div className="panel-dual-example-section">
        <div className="panel-dual-example-label">Horizontal split</div>
        <div className="panel-dual-example-frame panel-dual-example-frame-tall">
          <PanelDual orientation="horizontal" initialRatio={0.6}>
            <div className="panel-dual-example-pane panel-dual-example-pane-c">
              Top panel
            </div>
            <div className="panel-dual-example-pane panel-dual-example-pane-d">
              Bottom panel
            </div>
          </PanelDual>
        </div>
      </div>
    </CompDemoArea>
  </Example>
);

const PanelExamplesPanel = () => {
  const storeGroup = useMemo(() => createStoreExampleGroup({ exampleActiveId: 'toggle' }), []);

  return (
    <DemoPanel>
      <Explanation titleText="Panels">
        Panel layout components including toggle and split layouts.
      </Explanation>
      <ExampleGroup title="Panel types" store={storeGroup}>
        <Explanation>
          <ul>
            <li>
              <ExampleJumpLink data={{ exampleId: 'toggle' }}>PanelToggle</ExampleJumpLink> is a collapsible section.
            </li>
            <li>
              <ExampleJumpLink data={{ exampleId: 'dual' }}>PanelDual</ExampleJumpLink> is a resizable split of two panes, vertical or horizontal.
            </li>
          </ul>
        </Explanation>
        <Controls>
          <ExampleSwitchButtons />
        </Controls>
        <ExampleSwitcher>
          <ExamplePanelToggle exampleId="toggle" labelText="PanelToggle" />
          <ExamplePanelDual exampleId="dual" labelText="PanelDual" />
        </ExampleSwitcher>
      </ExampleGroup>
    </DemoPanel>
  );
};

export const panelExamples = {
  Panels: {
    component: PanelExamplesPanel,
    description: 'Panel layout components including toggle and split layouts',
    example: PanelExamplesPanel,
  },
};

export default PanelExamplesPanel;
