import { useState } from 'react';
import ButtonWithDropDown from './ButtonWithDropDown.jsx';
import BoolSlider from './BoolSlider.jsx';
import NumValue from './NumValue.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import './exampleButton.css';

const BoolSliderExample = () => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);

  return (
    <div className="button-example-panel">
      <div className="button-example-row">
        <BoolSlider checked={checked1} onChange={setChecked1} />
        <span className="button-example-row-label">Default blue</span>
      </div>

      <div className="button-example-row">
        <BoolSlider checked={checked2} onChange={setChecked2} color="#10b981" />
        <span className="button-example-row-label">Custom green</span>
      </div>

      <div className="button-example-row">
        <BoolSlider checked={checked3} onChange={setChecked3} color="#f59e0b" />
        <span className="button-example-row-label">Custom orange</span>
      </div>

      <div className="button-example-row">
        <BoolSlider checked={true} onChange={() => {}} disabled={true} />
        <span className="button-example-row-label">Disabled</span>
      </div>
    </div>
  );
};

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

const SegmentedControlExample = () => {
  const [range, setRange] = useState('week');
  const [size, setSize] = useState('m');
  const [preset, setPreset] = useState('b');
  const [view, setView] = useState('grid');
  const [section, setSection] = useState('inbox');
  const [widthModeDemo, setWidthModeDemo] = useState('both');

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
    <div className="segmented-control-example-root">
      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{ valueSelected: range, segList: multiSegList }}
          config={{ widthModeSegment: 'auto' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueSelectedChange') {
              setRange(String(eventData.valueSelected || 'week'));
            }
          }}
        />
        <div className="segmented-control-example-caption">
          Selected: {range}
        </div>
      </div>

      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{
            valueSelected: size,
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
              setSize(String(eventData.valueSelected || 'm'));
            }
          }}
        />
      </div>

      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{
            valueSelected: preset,
            segList: [
              { value: 'a', labelText: 'A' },
              { value: 'b', labelText: 'B' },
              { value: 'c', labelText: 'C' },
            ],
          }}
          config={{ colorHighlight: '#f59e0b', widthModeSegment: 'auto' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueSelectedChange') {
              setPreset(String(eventData.valueSelected || 'b'));
            }
          }}
        />
      </div>

      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{
            valueSelected: view,
            segList: [
              { value: 'grid', compName: 'GridIcon' },
              { value: 'list', compName: 'ListIcon' },
              { value: 'table', compName: 'TableIcon' },
            ],
          }}
          config={{ compResolveFn, widthModeSegment: 'equal' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueSelectedChange') {
              setView(String(eventData.valueSelected || 'grid'));
            }
          }}
        />
        <div className="segmented-control-example-caption">
          View mode: {view}
        </div>
      </div>

      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{
            valueSelected: section,
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
              setSection(String(eventData.valueSelected || 'inbox'));
            }
          }}
        />
        <div className="segmented-control-example-caption">
          Section: {section}
        </div>
      </div>

      <div className="segmented-control-example-block">
        <SegmentedControl
          data={{
            valueSelected: widthModeDemo,
            segList: [
              { value: 'request', labelText: 'Requests' },
              { value: 'plan', labelText: 'Plans' },
              { value: 'both', labelText: 'Show Both' },
            ],
          }}
          config={{ widthModeSegment: 'auto', colorHighlight: '#2d579e' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueSelectedChange') {
              setWidthModeDemo(String(eventData.valueSelected || 'both'));
            }
          }}
        />
        <div className="segmented-control-example-caption">
          widthModeSegment=&quot;auto&quot;: text-driven width, widthModeSegment=&quot;equal&quot;: equal segment width
        </div>
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
    </div>
  );
};

const ButtonWithDropDownExample = () => {
  const [selectedActionText, setSelectedActionText] = useState('No dropdown action selected');
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);

  return (
    <div className="button-with-dropdown-example-root">
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
              { id: 'delete', label: 'Delete', isDisabled: isDeleteDisabled },
            ],
          }}
          onEvent={(eventType, eventData) => {
            if (eventType !== 'itemClick') return;
            setSelectedActionText(`Selected: ${eventData.item?.label ?? eventData.itemId}`);
            setIsDeleteDisabled(false);
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
      <div className="button-with-dropdown-example-status">{selectedActionText}</div>
    </div>
  );
};

const NumValueExample = () => {
  const [intervalSecond, setIntervalSecond] = useState(10);
  const [intervalMinute, setIntervalMinute] = useState(5);
  const [countLocked, setCountLocked] = useState(3);

  return (
    <div className="num-value-example-panel">
      <div className="num-value-example-item">
        <NumValue
          data={{ value: intervalSecond }}
          config={{ min: 1, max: 3600, step: 1, unitText: 'seconds' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueChangeAttempt') setIntervalSecond(Number(eventData.value));
          }}
        />
        <div className="num-value-example-note">
          Click to edit, drag sideways to step, unit suffix
        </div>
      </div>
      <div className="num-value-example-item">
        <NumValue
          data={{ value: intervalMinute }}
          config={{ min: 0.5, max: 1440, step: 0.5, unitText: 'minutes' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueChangeAttempt') setIntervalMinute(Number(eventData.value));
          }}
        />
        <div className="num-value-example-note">
          Half-minute step with minutes unit
        </div>
      </div>
      <div className="num-value-example-item">
        <NumValue
          data={{ value: countLocked }}
          config={{ min: 0, max: 20, step: 1, isDisabled: true, unitText: 'items' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueChangeAttempt') setCountLocked(Number(eventData.value));
          }}
        />
        <div className="num-value-example-note">Disabled</div>
      </div>
    </div>
  );
};

const ButtonExamplesPanel = () => {
  return (
    <div>
      <div className="button-example-section">
        <div className="button-example-section-title">ButtonWithDropDown</div>
        <div className="button-example-section-desc">
          Data-driven dropdown button with disabled item and empty-list states
        </div>
        <ButtonWithDropDownExample />
      </div>
      <div className="button-example-section">
        <div className="button-example-section-title">BoolSlider</div>
        <div className="button-example-section-desc">Toggle switch for boolean values</div>
        <BoolSliderExample />
      </div>
      <div className="button-example-section">
        <div className="button-example-section-title">NumValue</div>
        <div className="button-example-section-desc">
          Number editor with step buttons, contenteditable text, horizontal drag adjust, and unit label
        </div>
        <NumValueExample />
      </div>
      <div className="button-example-section">
        <div className="button-example-section-title">SegmentedControl</div>
        <div className="button-example-section-desc">
          Parent owns valueSelected; sliding highlight moves to the clicked segment
        </div>
        <SegmentedControlExample />
      </div>
    </div>
  );
};

export const buttonExamples = {
  'Buttons': {
    component: null,
    description: 'Button components collection',
    example: () => <ButtonExamplesPanel />
  }
};
