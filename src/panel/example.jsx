import React, { useState } from 'react';
import PanelToggle from './PanelToggle.jsx';
import PanelDual from './PanelDual.jsx';
import PanelPopup from './PanelPopup.jsx';
import TabsOnTop from '../layout/tab/TabsOnTop.jsx';
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

const PopupTrigger = ({ label, popupProps, btnStyle }) => {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = (value) => {
    if (popupProps.simulateLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOpen(false);
        setLastAction(value !== undefined ? `Confirmed: "${value}"` : 'Confirmed');
      }, 1500);
    } else {
      setOpen(false);
      setLastAction(value !== undefined ? `Confirmed: "${value}"` : 'Confirmed');
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setLastAction('Cancelled');
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => { setOpen(true); setLastAction(null); }}
        style={{
          padding: '6px 14px',
          fontSize: '13px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          ...btnStyle,
        }}
      >
        {label}
      </button>
      {lastAction && (
        <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>{lastAction}</span>
      )}
      {open && (
        <PanelPopup
          {...popupProps}
          isLoading={popupProps.simulateLoading ? isLoading : popupProps.isLoading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

const PanelPopupExamplesPanel = () => {
  const row = (label, content) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      {content}
    </div>
  );

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ fontSize: '15px', fontWeight: 600 }}>PanelPopup</div>

      {row('Confirm (default)', (
        <PopupTrigger
          label="Open Confirm"
          popupProps={{ type: 'confirm', title: 'Confirm Action', message: 'Are you sure you want to proceed?' }}
        />
      ))}

      {row('Confirm — danger style', (
        <PopupTrigger
          label="Delete Item"
          btnStyle={{ background: '#fff1f0', borderColor: '#ff4d4f', color: '#cf1322' }}
          popupProps={{ type: 'confirm', isDanger: true, title: 'Delete Item', message: 'Delete "my-item"? This cannot be undone.', confirmText: 'Delete' }}
        />
      ))}

      {row('Alert (no cancel button)', (
        <PopupTrigger
          label="Open Alert"
          popupProps={{ type: 'alert', title: 'Notice', message: 'Operation completed successfully.' }}
        />
      ))}

      {row('Input prompt', (
        <PopupTrigger
          label="Rename…"
          popupProps={{
            type: 'input',
            title: 'Rename',
            message: 'Enter a new name:',
            confirmText: 'Rename',
            inputProps: { placeholder: 'New name', defaultValue: 'my-file', required: true },
          }}
        />
      ))}

      {row('isLoading — disables all buttons (shows "Loading...")', (
        <PopupTrigger
          label="Open (simulates loading)"
          popupProps={{ type: 'confirm', title: 'Processing', message: 'Click Confirm to simulate a 1.5 s loading state.', simulateLoading: true }}
        />
      ))}

      {row('isConfirmDisabled — confirm greyed out, cancel still works', (
        <PopupTrigger
          label="Open (confirm disabled)"
          popupProps={{ type: 'confirm', title: 'Confirm', message: 'Confirm button is disabled. Cancel still works.', isConfirmDisabled: true }}
        />
      ))}

      {row('statusMessage — locks all buttons until dismissed', (
        <PopupTrigger
          label="Open with status"
          popupProps={{
            type: 'confirm',
            title: 'With Status',
            message: 'Main message below the status.',
            statusMessage: 'Something went wrong on the server.',
            statusType: 'error',
          }}
        />
      ))}
    </div>
  );
};

const PanelExamplesPanel = () => {
  return (
    <TabsOnTop defaultTab="PanelToggle" defaultKeepMounted={false}>
      <TabsOnTop.Tab label="PanelToggle">
        <PanelToggleExamplesPanel />
      </TabsOnTop.Tab>
      <TabsOnTop.Tab label="PanelDual">
        <SplitExamplesPanel />
      </TabsOnTop.Tab>
      <TabsOnTop.Tab label="PanelPopup">
        <PanelPopupExamplesPanel />
      </TabsOnTop.Tab>
    </TabsOnTop>
  );
};

export const panelExamples = {
  'Panels': {
    component: PanelExamplesPanel,
    description: 'Panel components including toggle, split layouts, and popup dialogs',
    example: PanelExamplesPanel
  }
};
