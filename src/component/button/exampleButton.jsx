import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import ButtonWithDropDown from './ButtonWithDropDown.jsx';
import BoolSlider from './BoolSlider.jsx';
import NumValue from './NumValue.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import './exampleButton.css';

function createStoreBoolSliderExample() {
  return makeAutoObservable({
    checked1: false,
    checked2: true,
    checked3: false,
    checked1Set(checked) {
      this.checked1 = checked;
    },
    checked2Set(checked) {
      this.checked2 = checked;
    },
    checked3Set(checked) {
      this.checked3 = checked;
    },
  }, {}, { autoBind: true });
}

function createStoreSegmentedControlExample() {
  return makeAutoObservable({
    range: 'week',
    size: 'm',
    preset: 'b',
    view: 'grid',
    section: 'inbox',
    widthModeDemo: 'both',
    rangeSet(value) {
      this.range = value;
    },
    sizeSet(value) {
      this.size = value;
    },
    presetSet(value) {
      this.preset = value;
    },
    viewSet(value) {
      this.view = value;
    },
    sectionSet(value) {
      this.section = value;
    },
    widthModeDemoSet(value) {
      this.widthModeDemo = value;
    },
  }, {}, { autoBind: true });
}

function createStoreButtonWithDropDownExample() {
  return makeAutoObservable({
    selectedActionText: 'No dropdown action selected',
    isDeleteDisabled: true,
    itemSelect(item) {
      this.selectedActionText = `Selected: ${item?.label ?? item?.id}`;
      this.isDeleteDisabled = false;
    },
  }, {}, { autoBind: true });
}

function createStoreNumValueExample() {
  return makeAutoObservable({
    intervalSecond: 10,
    intervalMinute: 5,
    countLocked: 3,
    intervalSecondSet(value) {
      this.intervalSecond = value;
    },
    intervalMinuteSet(value) {
      this.intervalMinute = value;
    },
    countLockedSet(value) {
      this.countLocked = value;
    },
  }, {}, { autoBind: true });
}

const BoolSliderExample = observer(function BoolSliderExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreBoolSliderExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="BoolSlider">
      <Explanation>Toggle switch for boolean values.</Explanation>
      <CompDemoArea>
        <div className="button-example-row">
          <BoolSlider checked={storeUsed.checked1} onChange={storeUsed.checked1Set} />
          <span className="button-example-row-label">Default (shadcn primary)</span>
        </div>
        <div className="button-example-row">
          <BoolSlider checked={storeUsed.checked2} onChange={storeUsed.checked2Set} color="#10b981" />
          <span className="button-example-row-label">Custom green</span>
        </div>
        <div className="button-example-row">
          <BoolSlider checked={storeUsed.checked3} onChange={storeUsed.checked3Set} color="#f59e0b" />
          <span className="button-example-row-label">Custom orange</span>
        </div>
        <div className="button-example-row">
          <BoolSlider checked={true} onChange={() => {}} disabled={true} />
          <span className="button-example-row-label">Disabled</span>
        </div>
      </CompDemoArea>
    </Example>
  );
});

const multiSegList = [
  { value: 'day', labelText: 'Day' },
  { value: 'week', labelText: 'Week' },
  { value: 'month', labelText: 'Month' },
];

const IconText = ({ text, isSelected }) => (
  <span className={`segmented-control-example-icon-text${isSelected ? ' is-selected' : ''}`}>{text}</span>
);

const BadgeItem = ({ labelText, badgeCount, isSelected }) => (
  <span className="segmented-control-example-badge-item">
    <span>{labelText}</span>
    {badgeCount > 0 ? (
      <span className={`segmented-control-example-badge-count${isSelected ? ' is-selected' : ''}`}>
        {badgeCount}
      </span>
    ) : null}
  </span>
);

const SegmentedControlExample = observer(function SegmentedControlExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSegmentedControlExample()), [store]);
  const storeUsed = store || storeLocal;

  const notificationCountBySection = {
    inbox: 5,
    sent: 0,
    archive: 12,
  };

  const compResolveFn = (compName) => {
    if (compName === 'GridIcon') {
      return (props) => <IconText text="Grid" {...props} />;
    }
    if (compName === 'ListIcon') {
      return (props) => <IconText text="List" {...props} />;
    }
    if (compName === 'TableIcon') {
      return (props) => <IconText text="Table" {...props} />;
    }
    if (compName === 'InboxBadge') {
      return (props) => <BadgeItem labelText="Inbox" badgeCount={notificationCountBySection.inbox} {...props} />;
    }
    if (compName === 'SentBadge') {
      return (props) => <BadgeItem labelText="Sent" badgeCount={notificationCountBySection.sent} {...props} />;
    }
    if (compName === 'ArchiveBadge') {
      return (props) => <BadgeItem labelText="Archive" badgeCount={notificationCountBySection.archive} {...props} />;
    }
    return null;
  };

  return (
    <Example title="SegmentedControl">
      <Explanation>
        <ul>
          <li>Parent owns valueSelected; sliding highlight moves to the clicked segment.</li>
          <li>
            <strong>widthModeSegment=&quot;auto&quot;</strong>: text-driven width;
            <strong> widthModeSegment=&quot;equal&quot;</strong>: equal segment width.
          </li>
        </ul>
      </Explanation>
      <CompDemoArea>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{ valueSelected: storeUsed.range, segList: multiSegList }}
            config={{ widthModeSegment: 'auto' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.rangeSet(String(eventData.valueSelected || 'week'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: storeUsed.size,
              segList: [
                { value: 's', labelText: 'S' },
                { value: 'm', labelText: 'M' },
                { value: 'l', labelText: 'L' },
                { value: 'xl', labelText: 'XL' },
              ],
            }}
            config={{ colorHighlight: '#10b981', widthModeSegment: 'auto' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.sizeSet(String(eventData.valueSelected || 'm'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: storeUsed.preset,
              segList: [
                { value: 'a', labelText: 'A' },
                { value: 'b', labelText: 'B' },
                { value: 'c', labelText: 'C' },
              ],
            }}
            config={{ colorHighlight: '#f59e0b', widthModeSegment: 'auto' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.presetSet(String(eventData.valueSelected || 'b'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: storeUsed.view,
              segList: [
                { value: 'grid', compName: 'GridIcon' },
                { value: 'list', compName: 'ListIcon' },
                { value: 'table', compName: 'TableIcon' },
              ],
            }}
            config={{ compResolveFn, widthModeSegment: 'auto' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.viewSet(String(eventData.valueSelected || 'grid'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: storeUsed.section,
              segList: [
                { value: 'inbox', compName: 'InboxBadge' },
                { value: 'sent', compName: 'SentBadge' },
                { value: 'archive', compName: 'ArchiveBadge' },
              ],
            }}
            config={{
              compResolveFn,
              colorHighlight: '#8b5cf6',
              widthModeSegment: 'auto',
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.sectionSet(String(eventData.valueSelected || 'inbox'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: storeUsed.widthModeDemo,
              segList: [
                { value: 'request', labelText: 'Requests' },
                { value: 'plan', labelText: 'Plans' },
                { value: 'both', labelText: 'Show Both' },
              ],
            }}
            config={{ widthModeSegment: 'auto', colorHighlight: '#2d579e' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueSelectedChange') {
                storeUsed.widthModeDemoSet(String(eventData.valueSelected || 'both'));
              }
            }}
          />
        </div>
        <div className="segmented-control-example-block">
          <SegmentedControl
            data={{
              valueSelected: 'on',
              segList: [
                { value: 'off', labelText: 'Off' },
                { value: 'on', labelText: 'On' },
              ],
            }}
            config={{ isDisabled: true }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Selected: {storeUsed.range}</span>
        <span>Size: {storeUsed.size}</span>
        <span>Preset: {storeUsed.preset}</span>
        <span>View mode: {storeUsed.view}</span>
        <span>Section: {storeUsed.section}</span>
        <span>Width demo: {storeUsed.widthModeDemo}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ButtonWithDropDownExample = observer(function ButtonWithDropDownExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreButtonWithDropDownExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="ButtonWithDropDown">
      <Explanation>Data-driven dropdown button with disabled item and empty-list states.</Explanation>
      <CompDemoArea>
        <div className="button-with-dropdown-example-row">
          <ButtonWithDropDown
            data={{
              label: 'Actions',
              items: [
                { id: 'create', label: 'Create' },
                { id: 'rename', label: 'Rename' },
                {
                  id: 'export',
                  label: 'Export',
                  children: [
                    { id: 'exportJson', label: 'Export JSON' },
                    { id: 'exportCsv', label: 'Export CSV' },
                  ],
                },
                { id: 'delete', label: 'Delete', isDisabled: storeUsed.isDeleteDisabled },
              ],
            }}
            onEvent={(eventType, eventData) => {
              if (eventType !== 'itemClick') return;
              storeUsed.itemSelect(eventData.item ?? { id: eventData.itemId });
            }}
          />
          <ButtonWithDropDown
            data={{
              label: 'Empty',
              items: [],
              emptyText: 'No actions',
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.selectedActionText}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const NumValueExample = observer(function NumValueExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreNumValueExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="NumValue">
      <Explanation>
        Number editor with step buttons, contenteditable text, horizontal drag adjust, and unit label.
      </Explanation>
      <CompDemoArea>
        <div className="num-value-example-item">
          <NumValue
            data={{ value: storeUsed.intervalSecond }}
            config={{ min: 1, max: 3600, step: 1, unitText: 'seconds' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueChangeAttempt') storeUsed.intervalSecondSet(Number(eventData.value));
            }}
          />
          <div className="num-value-example-note">
            Click to edit, drag sideways to step, unit suffix
          </div>
        </div>
        <div className="num-value-example-item">
          <NumValue
            data={{ value: storeUsed.intervalMinute }}
            config={{ min: 0.5, max: 1440, step: 0.5, unitText: 'minutes' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueChangeAttempt') storeUsed.intervalMinuteSet(Number(eventData.value));
            }}
          />
          <div className="num-value-example-note">
            Half-minute step with minutes unit
          </div>
        </div>
        <div className="num-value-example-item">
          <NumValue
            data={{ value: storeUsed.countLocked }}
            config={{ min: 0, max: 20, step: 1, isDisabled: true, unitText: 'items' }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueChangeAttempt') storeUsed.countLockedSet(Number(eventData.value));
            }}
          />
          <div className="num-value-example-note">Disabled</div>
        </div>
      </CompDemoArea>
    </Example>
  );
});

const ButtonExamplesPanel = () => (
  <DemoPanel>
    <Explanation titleText="Buttons">
      Button helpers: dropdown actions, boolean slider, number editor, and segmented control.
    </Explanation>
    <ExampleGroup title="Variants">
      <ExampleStackVertical>
        <ButtonWithDropDownExample />
        <BoolSliderExample />
        <NumValueExample />
        <SegmentedControlExample />
      </ExampleStackVertical>
    </ExampleGroup>
  </DemoPanel>
);

export const buttonExamples = {
  Buttons: {
    component: null,
    description: 'Button components collection',
    example: ButtonExamplesPanel,
  },
};

export default ButtonExamplesPanel;
