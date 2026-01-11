import { useState } from 'react';
import EditableValueComp from './EditableValueComp.jsx';
import EditableValueWithInfo from './EditableValueWithInfo.jsx';
import SelectableValueComp from './SelectableValueComp.jsx';
import SearchableValueComp from './SearchableValueComp.jsx';

// Mock data for examples
const mockCities = [
  { value: 'new-york', label: 'New York', description: 'The Big Apple' },
  { value: 'los-angeles', label: 'Los Angeles', description: 'City of Angels' },
  { value: 'chicago', label: 'Chicago', description: 'The Windy City' },
  { value: 'houston', label: 'Houston', description: 'Space City' },
  { value: 'phoenix', label: 'Phoenix', description: 'Valley of the Sun' },
  { value: 'philadelphia', label: 'Philadelphia', description: 'City of Brotherly Love' },
  { value: 'san-antonio', label: 'San Antonio', description: 'Alamo City' },
  { value: 'san-diego', label: 'San Diego', description: 'America\'s Finest City' },
  { value: 'dallas', label: 'Dallas', description: 'Big D' },
  { value: 'san-jose', label: 'San Jose', description: 'Capital of Silicon Valley' },
];

const mockLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'rust', label: 'Rust' },
];

// Example 1: Basic EditableValueComp
const EditableValueExample = () => {
  const [value, setValue] = useState('Hello World');

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>EditableValueComp - Text Mode</h4>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>Value:</label>
        <EditableValueComp
          data={value}
          configKey="example.text"
          onUpdate={handleUpdate}
          valueType="text"
        />
      </div>
    </div>
  );
};

// Example 2: EditableValueComp with Boolean
const EditableValueBooleanExample = () => {
  const [value, setValue] = useState('true');

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    await new Promise(resolve => setTimeout(resolve, 800));
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>EditableValueComp - Boolean Mode</h4>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>Enabled:</label>
        <EditableValueComp
          data={value}
          configKey="example.boolean"
          onUpdate={handleUpdate}
          valueType="boolean"
        />
      </div>
    </div>
  );
};

// Example 3: SelectableValueComp
const SelectableValueExample = () => {
  const [value, setValue] = useState('javascript');

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    await new Promise(resolve => setTimeout(resolve, 800));
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>SelectableValueComp</h4>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>Language:</label>
        <SelectableValueComp
          data={value}
          configKey="example.language"
          onUpdate={handleUpdate}
          options={mockLanguages}
        />
      </div>
    </div>
  );
};

// Example 4: SearchableValueComp - Any input valid
const SearchableValueAnyExample = () => {
  const [value, setValue] = useState('new-york');

  const handleSearch = async (searchValue, version) => {
    console.log('Search:', searchValue, 'version:', version);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter cities based on search value
    const filtered = mockCities.filter(city => 
      city.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      city.value.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return { code: 0, data: filtered };
  };

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    await new Promise(resolve => setTimeout(resolve, 800));
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>SearchableValueComp - Any Input Valid</h4>
      <p style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>
        Type to search cities. Any input is valid.
      </p>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>City:</label>
        <SearchableValueComp
          data={value}
          configKey="example.city.any"
          onUpdate={handleUpdate}
          onSearch={handleSearch}
          strictValidation={false}
        />
      </div>
    </div>
  );
};

// Example 5: SearchableValueComp - Strict validation
const SearchableValueStrictExample = () => {
  const [value, setValue] = useState('chicago');
  const validCities = mockCities.map(c => c.value);

  const handleSearch = async (searchValue, version) => {
    console.log('Search:', searchValue, 'version:', version);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtered = mockCities.filter(city => 
      city.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      city.value.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return { code: 0, data: filtered };
  };

  const handleValidate = async (searchValue, version) => {
    console.log('Validate:', searchValue, 'version:', version);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Check if value is in the valid list
    const isValid = validCities.includes(searchValue);
    return { code: 0, data: isValid };
  };

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if value is valid
    if (!validCities.includes(newValue)) {
      // Reject invalid value and schedule clearing after 1 seconds
      setTimeout(() => {
        setValue('');
      }, 1000);
      return { code: -1, message: 'Invalid city. Please select from dropdown.' };
    }
    
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>SearchableValueComp - Strict Validation</h4>
      <p style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>
        Type to search cities. Only values selected from dropdown are valid.
        Watch for validation icon (✓ or ✗) to the left of edit icon.
      </p>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>City:</label>
        <SearchableValueComp
          data={value}
          configKey="example.city.strict"
          onUpdate={handleUpdate}
          onSearch={handleSearch}
          onValidate={handleValidate}
          strictValidation={true}
        />
      </div>
    </div>
  );
};

// Example 6: SearchableValueComp with race condition demo
const SearchableValueRaceConditionExample = () => {
  const [value, setValue] = useState('test');

  const handleSearch = async (searchValue, version) => {
    console.log('Search started:', searchValue, 'version:', version);
    
    // Simulate variable network delays to demonstrate race condition handling
    const delay = searchValue.length < 3 ? 800 : 200;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log('Search completed:', searchValue, 'version:', version);
    
    const filtered = mockCities.filter(city => 
      city.label.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return { code: 0, data: filtered };
  };

  const handleUpdate = async (configKey, newValue) => {
    console.log('Update:', configKey, newValue);
    await new Promise(resolve => setTimeout(resolve, 500));
    setValue(newValue);
    return { code: 0, message: 'Success' };
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>SearchableValueComp - Race Condition Handling</h4>
      <p style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>
        Type quickly to see race condition handling. 
        Short queries have longer delay, but results are correctly ordered by version.
        Check console to see request/response timing.
      </p>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>Query:</label>
        <SearchableValueComp
          data={value}
          configKey="example.race"
          onUpdate={handleUpdate}
          onSearch={handleSearch}
          strictValidation={false}
          searchDebounce={150}
        />
      </div>
    </div>
  );
};

// Example 7: EditableValueWithInfo
const EditableValueWithInfoExample = () => {
  const [value, setValue] = useState('Sample Value');

  const handleChangeAttempt = (index, field, newValue) => {
    console.log('Change attempt:', { index, field, newValue });
    setValue(newValue);
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
      <h4>EditableValueWithInfo</h4>
      <p style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>
        Hover over the info icon to see tooltip.
      </p>
      <div style={{ marginTop: '6px' }}>
        <label style={{ marginRight: '6px', fontWeight: 'bold' }}>Field:</label>
        <EditableValueWithInfo
          data={value}
          onChangeAttempt={handleChangeAttempt}
          isEditable={true}
          field="sampleField"
          index={0}
          tooltipText="This is a sample field with additional information displayed in a tooltip."
        />
      </div>
    </div>
  );
};

// Main component that shows all examples
const ValueCompExamples = () => {
  return (
    <div style={{ padding: '8px', fontFamily: 'sans-serif' }}>
      <h1>Value Component Examples</h1>
      <p style={{ color: '#666', marginBottom: '8px' }}>
        Various examples demonstrating different value component types
      </p>
      
      <EditableValueExample />
      <EditableValueBooleanExample />
      <SelectableValueExample />
      <SearchableValueAnyExample />
      <SearchableValueStrictExample />
      <SearchableValueRaceConditionExample />
      <EditableValueWithInfoExample />
    </div>
  );
};

export const valueCompExamples = {
  'Value Components': {
    component: EditableValueComp,
    description: 'Editable, Selectable, and Searchable value components with various features',
    example: ValueCompExamples,
  },
};

