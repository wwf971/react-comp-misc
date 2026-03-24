import { useState } from 'react';
import BoolSlider from './BoolSlider.jsx';
import SegmentedControl from './SegmentedControl.jsx';

const BoolSliderExample = () => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
        <BoolSlider checked={checked1} onChange={setChecked1} />
        <span style={{ fontSize: '14px' }}>Default blue</span>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
        <BoolSlider checked={checked2} onChange={setChecked2} color="#10b981" />
        <span style={{ fontSize: '14px' }}>Custom green</span>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
        <BoolSlider checked={checked3} onChange={setChecked3} color="#f59e0b" />
        <span style={{ fontSize: '14px' }}>Custom orange</span>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
        <BoolSlider checked={true} onChange={() => {}} disabled={true} />
        <span style={{ fontSize: '14px' }}>Disabled</span>
      </div>
    </div>
  );
};

const multiOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const IconText = ({ icon, text, isSelected, color }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

const BadgeItem = ({ label, badge, isSelected, color }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
      <span>{label}</span>
      {badge > 0 && (
        <span style={{
          fontSize: '10px',
          padding: '1px 4px',
          borderRadius: '8px',
          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(239, 68, 68, 0.8)',
          color: '#ffffff',
          minWidth: '16px',
          textAlign: 'center',
        }}>
          {badge}
        </span>
      )}
    </div>
  );
};

const SegmentedControlExample = () => {
  const [range, setRange] = useState('week');
  const [size, setSize] = useState('m');
  const [preset, setPreset] = useState('b');
  const [view, setView] = useState('grid');
  const [section, setSection] = useState('inbox');

  const notificationCounts = {
    inbox: 5,
    sent: 0,
    archive: 12,
  };

  const getComponent = (compName) => {
    if (compName === 'GridIcon') {
      return (props) => <IconText icon="⊞" text="Grid" {...props} />;
    }
    if (compName === 'ListIcon') {
      return (props) => <IconText icon="☰" text="List" {...props} />;
    }
    if (compName === 'TableIcon') {
      return (props) => <IconText icon="⊟" text="Table" {...props} />;
    }
    if (compName === 'InboxBadge') {
      return (props) => <BadgeItem label="Inbox" badge={notificationCounts.inbox} {...props} />;
    }
    if (compName === 'SentBadge') {
      return (props) => <BadgeItem label="Sent" badge={notificationCounts.sent} {...props} />;
    }
    if (compName === 'ArchiveBadge') {
      return (props) => <BadgeItem label="Archive" badge={notificationCounts.archive} {...props} />;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '420px' }}>
      <div style={{ marginBottom: '12px' }}>
        <SegmentedControl
          data={range}
          onChange={setRange}
          options={multiOptions}
        />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
          Selected: {range}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <SegmentedControl
          data={size}
          onChange={setSize}
          options={[
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
            { value: 'xl', label: 'XL' },
          ]}
          color="#10b981"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <SegmentedControl
          data={preset}
          onChange={setPreset}
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
            { value: 'c', label: 'C' },
          ]}
          color="#f59e0b"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <SegmentedControl
          data={view}
          onChange={setView}
          options={[
            { value: 'grid', component: 'GridIcon' },
            { value: 'list', component: 'ListIcon' },
            { value: 'table', component: 'TableIcon' },
          ]}
          getComp={getComponent}
        />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
          View mode: {view}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <SegmentedControl
          data={section}
          onChange={setSection}
          options={[
            { value: 'inbox', component: 'InboxBadge' },
            { value: 'sent', component: 'SentBadge' },
            { value: 'archive', component: 'ArchiveBadge' },
          ]}
          getComp={getComponent}
          color="#8b5cf6"
        />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
          Section: {section}
        </div>
      </div>

      <div>
        <SegmentedControl
          data="on"
          onChange={() => {}}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'On' },
          ]}
          disabled
        />
      </div>
    </div>
  );
};

const ButtonExamplesPanel = () => {
  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>BoolSlider</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Toggle switch for boolean values</div>
        <BoolSliderExample />
      </div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>SegmentedControl</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          Parent owns value; sliding highlight moves to the clicked option (radio-group behavior)
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
