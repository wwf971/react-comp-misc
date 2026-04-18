import React from 'react';
import PanelToggle from './PanelToggle.jsx';
import PanelDual from './PanelDual.jsx';
import TabsOnTop from '../tab/TabsOnTop.jsx';
import './panel.css';

const SplitExamplesPanel = () => {
  return (
    <div className="panel-dual-examples">
      <div className="panel-dual-examples-title">PanelDual</div>
      <div className="panel-dual-examples-desc">
        Drag the split line to adjust the panel ratio.
      </div>

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
    </div>
  );
};

const PanelToggleExamplesPanel = () => (
  <div style={{ padding: '16px' }}>
    <PanelToggle title="PanelToggle.jsx" defaultExpanded={true}>
      <div className="panel-toggle-content">
        <div className="panel-toggle-item">Option 1: Enabled</div>
        <div className="panel-toggle-item">Option 2: Disabled</div>
        <div className="panel-toggle-item">Option 3: Auto</div>
      </div>
    </PanelToggle>
  </div>
);

const PanelExamplesPanel = () => {
  return (
    <TabsOnTop defaultTab="PanelToggle" defaultKeepMounted={false}>
      <TabsOnTop.Tab label="PanelToggle">
        <PanelToggleExamplesPanel />
      </TabsOnTop.Tab>
      <TabsOnTop.Tab label="PanelDual">
        <SplitExamplesPanel />
      </TabsOnTop.Tab>
    </TabsOnTop>
  );
};

export const panelExamples = {
  Panels: {
    component: PanelExamplesPanel,
    description: 'Panel layout components including toggle and split layouts',
    example: PanelExamplesPanel,
  },
};
