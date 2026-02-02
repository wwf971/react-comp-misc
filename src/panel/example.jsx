import React from 'react';
import PanelToggle from './PanelToggle.jsx';

const PanelGallery = () => {
  return (
    <div>
      <PanelToggle title="PanelToggle.jsx" defaultExpanded={true}>
        <div style={{ padding: '12px' }}>
          <div style={{ marginBottom: '8px' }}>Option 1: Enabled</div>
          <div style={{ marginBottom: '8px' }}>Option 2: Disabled</div>
          <div>Option 3: Auto</div>
        </div>
      </PanelToggle>
    </div>
  );
};

export const panelExamples = {
  'Panels': {
    component: PanelGallery,
    description: 'Collapsible panel components',
    example: () => <PanelGallery />
  }
};
