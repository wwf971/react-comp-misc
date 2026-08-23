import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import PanelPopup from './PanelPopup.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import './example.css';

function createStorePopupTrigger() {
  return makeAutoObservable({
    isOpen: false,
    lastAction: null,
    isLoading: false,
    open() {
      this.isOpen = true;
      this.lastAction = null;
    },
    confirm(value, { simulateLoading = false } = {}) {
      if (simulateLoading) {
        this.isLoading = true;
        window.setTimeout(() => {
          runInAction(() => {
            this.isLoading = false;
            this.isOpen = false;
            this.lastAction = value !== undefined ? `Confirmed: "${value}"` : 'Confirmed';
          });
        }, 1500);
        return { code: 0 };
      }
      this.isOpen = false;
      this.lastAction = value !== undefined ? `Confirmed: "${value}"` : 'Confirmed';
      return { code: 0 };
    },
    cancel() {
      this.isOpen = false;
      this.lastAction = 'Cancelled';
      return { code: 0 };
    },
  }, {}, { autoBind: true });
}

const ExamplePopupVariant = observer(function ExamplePopupVariant({
  title,
  label,
  popupProps,
  buttonClassName = '',
  store,
}) {
  const storeLocal = useMemo(() => (store ? null : createStorePopupTrigger()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title={title}>
      <CompDemoArea>
        <button
          type="button"
          className={`demo-button${buttonClassName ? ` ${buttonClassName}` : ''}`}
          onClick={() => storeUsed.open()}
        >
          {label}
        </button>
        {storeUsed.isOpen ? (
          <PanelPopup
            {...popupProps}
            isLoading={popupProps.simulateLoading ? storeUsed.isLoading : popupProps.isLoading}
            onConfirm={(value) => storeUsed.confirm(value, { simulateLoading: popupProps.simulateLoading })}
            onCancel={() => storeUsed.cancel()}
          />
        ) : null}
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.lastAction || 'No action yet'}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const PopupExamplesPanel = () => (
  <DemoPanel>
    <Explanation titleText="PanelPopup">
      Popup dialogs for confirm, alert, and input, including danger, loading, disabled confirm, and status message.
    </Explanation>
    <ExampleGroup title="Variants">
      <ExampleStackVertical>
        <ExamplePopupVariant
          title="Confirm (default)"
          label="Open Confirm"
          popupProps={{ type: 'confirm', title: 'Confirm Action', message: 'Are you sure you want to proceed?' }}
        />
        <ExamplePopupVariant
          title="Confirm — danger style"
          label="Delete Item"
          buttonClassName="popup-example-button-danger"
          popupProps={{ type: 'confirm', isDanger: true, title: 'Delete Item', message: 'Delete "my-item"? This cannot be undone.', confirmText: 'Delete' }}
        />
        <ExamplePopupVariant
          title="Alert (no cancel button)"
          label="Open Alert"
          popupProps={{ type: 'alert', title: 'Notice', message: 'Operation completed successfully.' }}
        />
        <ExamplePopupVariant
          title="Input prompt"
          label="Rename…"
          popupProps={{
            type: 'input',
            title: 'Rename',
            message: 'Enter a new name:',
            confirmText: 'Rename',
            inputProps: { placeholder: 'New name', defaultValue: 'my-file', required: true },
          }}
        />
        <ExamplePopupVariant
          title="isLoading — disables all buttons (shows &quot;Loading...&quot;)"
          label="Open (simulates loading)"
          popupProps={{ type: 'confirm', title: 'Processing', message: 'Click Confirm to simulate a 1.5 s loading state.', simulateLoading: true }}
        />
        <ExamplePopupVariant
          title="isConfirmDisabled — confirm greyed out, cancel still works"
          label="Open (confirm disabled)"
          popupProps={{ type: 'confirm', title: 'Confirm', message: 'Confirm button is disabled. Cancel still works.', isConfirmDisabled: true }}
        />
        <ExamplePopupVariant
          title="statusMessage — locks all buttons until dismissed"
          label="Open with status"
          popupProps={{
            type: 'confirm',
            title: 'With Status',
            message: 'Main message below the status.',
            statusMessage: 'Something went wrong on the server.',
            statusType: 'error',
          }}
        />
      </ExampleStackVertical>
    </ExampleGroup>
  </DemoPanel>
);

export const popupExamples = {
  Popup: {
    component: PopupExamplesPanel,
    description: 'Popup component for confirm, alert, and input dialogs',
    example: PopupExamplesPanel,
  },
};

export default PopupExamplesPanel;
