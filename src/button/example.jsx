import { useState } from 'react';
import BoolSlider from './BoolSlider.jsx';

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

const ButtonExamplesPanel = () => {
  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>BoolSlider</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Toggle switch for boolean values</div>
        <BoolSliderExample />
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
