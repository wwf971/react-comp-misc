import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import EditableValueComp from './EditableValueComp.jsx';
import EditableValueWithInfo from './EditableValueWithInfo.jsx';
import SelectableValueComp from './SelectableValueComp.jsx';
import SearchableValueComp from './SearchableValueComp.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import './example.css';

const renderMatchedText = (rawText, matchText) => {
  const text = String(rawText ?? '');
  const normalizedMatchText = String(matchText ?? '').trim().toLowerCase();
  if (!normalizedMatchText) {
    return text;
  }
  const startIndex = text.toLowerCase().indexOf(normalizedMatchText);
  if (startIndex < 0) {
    return text;
  }
  const endIndex = startIndex + normalizedMatchText.length;
  return (
    <>
      {text.slice(0, startIndex)}
      <span className="value-match-highlight">{text.slice(startIndex, endIndex)}</span>
      {text.slice(endIndex)}
    </>
  );
};

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

const customSelectableOptions = [
  { value: 'fast', label: 'Fast', description: 'Lower latency path', tone: 'ok', compName: 'customSelectableItem' },
  { value: 'balanced', label: 'Balanced', description: 'Default path', tone: 'info', compName: 'customSelectableItem' },
  { value: 'safe', label: 'Safe', description: 'Strict path', tone: 'warn', compName: 'customSelectableItem' }
];

const customSearchItems = [
  { value: 'tokyo', label: 'Tokyo', description: 'Japan', tone: 'ok', compName: 'customDropDownItem' },
  { value: 'seoul', label: 'Seoul', description: 'Korea', tone: 'info', compName: 'customDropDownItem' },
  { value: 'berlin', label: 'Berlin', description: 'Selectable and Searchable with getComp callGermany', tone: 'warn', compName: 'customDropDownItem' },
  { value: 'osaka', label: 'Osaka', description: 'Japan', tone: 'neutral', compName: 'customDropDownItem' }
];

const validCities = mockCities.map((city) => city.value);

const CustomDropdownItem = ({ data, config = {} }) => {
  const item = data;
  const searchText = config.searchText ?? '';
  const tone = item?.tone || 'neutral';
  const labelText = item?.label || item?.value;
  return (
    <div className="value-example-custom-item">
      <span className={`value-example-custom-item-dot tone-${tone}`} />
      <span className="value-example-custom-item-label">{renderMatchedText(labelText, searchText)}</span>
      {item?.description ? (
        <span className="value-example-custom-item-description">{renderMatchedText(item.description, searchText)}</span>
      ) : null}
    </div>
  );
};

const getCustomComp = (name) => {
  if (name === 'customSelectableItem' || name === 'customDropDownItem') {
    return CustomDropdownItem;
  }
  return null;
};

function createStoreEditableValueTextExample() {
  return makeAutoObservable({
    value: 'Hello World',
    messageState: { status: 'idle', messageText: '' },
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      this.messageState = {
        status: 'loading',
        messageText: 'Saving value...',
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (String(newValue).toLowerCase() === 'error') {
        const nextMessageState = {
          status: 'error',
          messageText: 'Server rejected this value',
        };
        runInAction(() => {
          this.messageState = nextMessageState;
        });
        return { code: -1, message: nextMessageState.messageText };
      }

      runInAction(() => {
        this.value = newValue;
        this.messageState = {
          status: 'success',
          messageText: 'Saved successfully',
        };
      });
      setTimeout(() => {
        runInAction(() => {
          this.messageState = { status: 'idle', messageText: '' };
        });
      }, 2500);
      return { code: 0, message: 'Success' };
    },
  }, {}, { autoBind: true });
}

function createStoreEditableValueBooleanExample() {
  return makeAutoObservable({
    value: 'true',
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (newValue === 'rust') {
        return { code: -1, message: 'Rust is rejected in this demo' };
      }
      if (newValue === 'java') {
        return { code: -1, message: 'Request timeout. Keeping original value.' };
      }
      runInAction(() => {
        this.value = newValue;
      });
      return { code: 0, message: 'Success' };
    },
  }, {}, { autoBind: true });
}

function createStoreSelectableValueExample() {
  return makeAutoObservable({
    value: 'javascript',
    valuePending: null,
    isSubmitting: false,
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      this.valuePending = newValue;
      this.isSubmitting = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (newValue === 'rust') {
          return { code: -1, message: 'Rust is rejected in this demo' };
        }
        if (newValue === 'java') {
          return { code: -1, message: 'Request timeout. Keeping original value.' };
        }
        runInAction(() => {
          this.value = newValue;
        });
        return { code: 0, message: 'Success' };
      } finally {
        runInAction(() => {
          this.valuePending = null;
          this.isSubmitting = false;
        });
      }
    },
  }, {}, { autoBind: true });
}

function createStoreSearchableValueAnyExample() {
  return makeAutoObservable({
    value: 'new-york',
    async handleSearch(searchValue, version) {
      console.log('Search:', searchValue, 'version:', version);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filtered = mockCities.filter((city) => (
        city.label.toLowerCase().includes(searchValue.toLowerCase())
        || city.value.toLowerCase().includes(searchValue.toLowerCase())
      ));
      return { code: 0, data: filtered };
    },
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      await new Promise((resolve) => setTimeout(resolve, 800));
      runInAction(() => {
        this.value = newValue;
      });
      return { code: 0, message: 'Success' };
    },
  }, {}, { autoBind: true });
}

function createStoreSearchableValueStrictExample() {
  return makeAutoObservable({
    value: 'chicago',
    async handleSearch(searchValue, version) {
      console.log('Search:', searchValue, 'version:', version);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filtered = mockCities.filter((city) => (
        city.label.toLowerCase().includes(searchValue.toLowerCase())
        || city.value.toLowerCase().includes(searchValue.toLowerCase())
      ));
      return { code: 0, data: filtered };
    },
    async handleValidate(searchValue, version) {
      console.log('Validate:', searchValue, 'version:', version);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const isValid = validCities.includes(searchValue);
      return { code: 0, data: isValid };
    },
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!validCities.includes(newValue)) {
        setTimeout(() => {
          runInAction(() => {
            this.value = '';
          });
        }, 1000);
        return { code: -1, message: 'Invalid city. Please select from dropdown.' };
      }
      runInAction(() => {
        this.value = newValue;
      });
      return { code: 0, message: 'Success' };
    },
  }, {}, { autoBind: true });
}

function createStoreSearchableValueRaceExample() {
  return makeAutoObservable({
    value: 'test',
    async handleSearch(searchValue, version) {
      console.log('Search started:', searchValue, 'version:', version);
      const delay = searchValue.length < 3 ? 800 : 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log('Search completed:', searchValue, 'version:', version);
      const filtered = mockCities.filter((city) => (
        city.label.toLowerCase().includes(searchValue.toLowerCase())
      ));
      return { code: 0, data: filtered };
    },
    async handleUpdate(configKey, newValue) {
      console.log('Update:', configKey, newValue);
      await new Promise((resolve) => setTimeout(resolve, 500));
      runInAction(() => {
        this.value = newValue;
      });
      return { code: 0, message: 'Success' };
    },
  }, {}, { autoBind: true });
}

function createStoreValueCompCustomItemExample() {
  return makeAutoObservable({
    selectableValue: 'balanced',
    searchableValue: 'tokyo',
    async handleUpdateSelectable(_configKey, newValue) {
      this.selectableValue = newValue;
      return { code: 0, message: 'Success' };
    },
    async handleUpdateSearchable(_configKey, newValue) {
      this.searchableValue = newValue;
      return { code: 0, message: 'Success' };
    },
    async handleSearch(searchValue) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const lower = (searchValue || '').toLowerCase();
      const filtered = customSearchItems.filter((item) => (
        item.label.toLowerCase().includes(lower) || item.value.toLowerCase().includes(lower)
      ));
      return { code: 0, data: filtered };
    },
  }, {}, { autoBind: true });
}

function createStoreValueCompFixedWidthExample() {
  return makeAutoObservable({
    editableValue: 'A long editable value that exceeds the configured width',
    selectableValue: 'philadelphia',
    searchableValue: 'san-diego',
    editableValueSet(newValue) {
      this.editableValue = String(newValue ?? '');
    },
    selectableValueSet(newValue) {
      this.selectableValue = String(newValue ?? '');
    },
    searchableValueSet(newValue) {
      this.searchableValue = String(newValue ?? '');
    },
    async handleSearch(searchValue) {
      const query = String(searchValue ?? '').toLowerCase();
      const results = mockCities.filter((city) => (
        city.label.toLowerCase().includes(query)
        || city.value.toLowerCase().includes(query)
        || city.description.toLowerCase().includes(query)
      ));
      return { code: 0, data: results };
    },
  }, {}, { autoBind: true });
}

function createStoreEditableValueWithInfoExample() {
  return makeAutoObservable({
    value: 'Sample Value',
    handleChangeAttempt(index, field, newValue) {
      console.log('Change attempt:', { index, field, newValue });
      this.value = newValue;
    },
  }, {}, { autoBind: true });
}

const EditableValueExample = observer(function EditableValueExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreEditableValueTextExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="EditableValueComp - Text Mode">
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">Value:</label>
          <EditableValueComp
            data={{
              value: storeUsed.value,
              messageState: storeUsed.messageState,
            }}
            config={{
              configKey: 'example.text',
              valueType: 'text',
              isExternalSubmitting: storeUsed.messageState.status === 'loading',
              messageConfig: {
                textByStatus: {
                  loading: 'Saving value...',
                  success: 'Saved successfully',
                  error: 'Save failed',
                },
                colorByStatus: {
                  success: '#2e7d32',
                  error: '#d32f2f',
                },
              },
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
        {storeUsed.messageState.messageText ? <span>{storeUsed.messageState.messageText}</span> : null}
      </MessageAndOutputs>
    </Example>
  );
});

const EditableValueBooleanExample = observer(function EditableValueBooleanExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreEditableValueBooleanExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="EditableValueComp - Boolean Mode">
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">Enabled:</label>
          <EditableValueComp
            data={{ value: storeUsed.value }}
            config={{
              configKey: 'example.boolean',
              valueType: 'boolean',
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const SelectableValueExample = observer(function SelectableValueExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSelectableValueExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="SelectableValueComp">
      <Explanation>
        Type to filter options; matched text is highlighted in yellow. Selection is shown immediately. Java simulates timeout; Rust simulates rejection.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">Language:</label>
          <SelectableValueComp
            data={{
              value: storeUsed.value,
              valuePending: storeUsed.valuePending,
              options: mockLanguages,
            }}
            config={{
              configKey: 'example.language',
              isExternalSubmitting: storeUsed.isSubmitting,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.valuePending ? `${storeUsed.value} → ${storeUsed.valuePending}` : storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const SearchableValueAnyExample = observer(function SearchableValueAnyExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSearchableValueAnyExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="SearchableValueComp - Any Input Valid">
      <Explanation>
        Type to search cities. Any input is valid.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">City:</label>
          <SearchableValueComp
            data={{ value: storeUsed.value }}
            config={{
              configKey: 'example.city.any',
              strictValidation: false,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              if (eventType === 'searchRequest') {
                return storeUsed.handleSearch(eventData.value, eventData.version);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const SearchableValueStrictExample = observer(function SearchableValueStrictExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSearchableValueStrictExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="SearchableValueComp - Strict Validation">
      <Explanation>
        Type to search cities. Only values selected from dropdown are valid.
        Watch for validation icon (✓ or ✗) to the left of edit icon.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">City:</label>
          <SearchableValueComp
            data={{ value: storeUsed.value }}
            config={{
              configKey: 'example.city.strict',
              strictValidation: true,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              if (eventType === 'searchRequest') {
                return storeUsed.handleSearch(eventData.value, eventData.version);
              }
              if (eventType === 'validateRequest') {
                return storeUsed.handleValidate(eventData.value, eventData.version);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const SearchableValueRaceConditionExample = observer(function SearchableValueRaceConditionExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSearchableValueRaceExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="SearchableValueComp - Race Condition Handling">
      <Explanation>
        Type quickly to see race condition handling.
        Short queries have longer delay, but results are correctly ordered by version.
        Check console to see request/response timing.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">Query:</label>
          <SearchableValueComp
            data={{ value: storeUsed.value }}
            config={{
              configKey: 'example.race',
              strictValidation: false,
              searchDebounce: 150,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                return storeUsed.handleUpdate(eventData.configKey, eventData.valueNext);
              }
              if (eventType === 'searchRequest') {
                return storeUsed.handleSearch(eventData.value, eventData.version);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ValueCompCustomItemExample = observer(function ValueCompCustomItemExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreValueCompCustomItemExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Selectable and Searchable with getComp callback">
      <Explanation>
        Dropdown items are resolved by component name through getComp(name, context), not by storing component instances in data.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-stack">
          <div className="value-example-row">
            <label className="value-example-row-label">Mode:</label>
            <SelectableValueComp
              data={{
                value: storeUsed.selectableValue,
                options: customSelectableOptions,
              }}
              config={{
                configKey: 'example.custom.selectable',
                getComp: getCustomComp,
              }}
              onEvent={(eventType, eventData) => {
                if (eventType === 'valueCommit') {
                  return storeUsed.handleUpdateSelectable(eventData.configKey, eventData.valueNext);
                }
                return { code: 0 };
              }}
            />
          </div>
          <div className="value-example-row">
            <label className="value-example-row-label">City:</label>
            <SearchableValueComp
              data={{ value: storeUsed.searchableValue }}
              config={{
                configKey: 'example.custom.searchable',
                getComp: getCustomComp,
                strictValidation: false,
              }}
              onEvent={(eventType, eventData) => {
                if (eventType === 'valueCommit') {
                  return storeUsed.handleUpdateSearchable(eventData.configKey, eventData.valueNext);
                }
                if (eventType === 'searchRequest') {
                  return storeUsed.handleSearch(eventData.value, eventData.version);
                }
                return { code: 0 };
              }}
            />
          </div>
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Mode: {storeUsed.selectableValue}</span>
        <span>City: {storeUsed.searchableValue}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ValueCompFixedWidthExample = observer(function ValueCompFixedWidthExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreValueCompFixedWidthExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Fixed width and horizontal wheel scrolling">
      <Explanation>
        Each value is 150px wide. Hover a clipped value and use the mouse wheel to scroll it horizontally.
        Search results highlight every matching query segment in yellow.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-stack">
          <EditableValueComp
            data={{ value: storeUsed.editableValue }}
            config={{ configKey: 'example.width.editable', width: 150 }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                storeUsed.editableValueSet(eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
          <SelectableValueComp
            data={{ value: storeUsed.selectableValue, options: mockCities }}
            config={{ configKey: 'example.width.selectable', width: 150 }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                storeUsed.selectableValueSet(eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
          <SearchableValueComp
            data={{ value: storeUsed.searchableValue }}
            config={{
              configKey: 'example.width.searchable',
              width: 150,
              searchDebounce: 0,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                storeUsed.searchableValueSet(eventData.valueNext);
                return { code: 0 };
              }
              if (eventType === 'searchRequest') {
                return storeUsed.handleSearch(eventData.value);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.editableValue}</span>
        <span>{storeUsed.selectableValue}</span>
        <span>{storeUsed.searchableValue}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const EditableValueWithInfoExample = observer(function EditableValueWithInfoExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreEditableValueWithInfoExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="EditableValueWithInfo">
      <Explanation>
        Hover over the info icon to see tooltip.
      </Explanation>
      <CompDemoArea>
        <div className="value-example-row">
          <label className="value-example-row-label">Field:</label>
          <EditableValueWithInfo
            data={{
              value: storeUsed.value,
              tooltipText: 'This is a sample field with additional information displayed in a tooltip.',
            }}
            config={{
              isEditable: true,
              field: 'sampleField',
              index: 0,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'valueCommit') {
                storeUsed.handleChangeAttempt(eventData.index, eventData.field, eventData.valueNext);
              }
              return { code: 0 };
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.value}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ValueCompExamples = () => (
  <DemoPanel>
    <Explanation titleText="Value Components">
      Various examples demonstrating different value component types
    </Explanation>
    <ExampleGroup title="Variants">
      <ExampleStackVertical>
        <EditableValueExample />
        <EditableValueBooleanExample />
        <SelectableValueExample />
        <SearchableValueAnyExample />
        <SearchableValueStrictExample />
        <SearchableValueRaceConditionExample />
        <ValueCompCustomItemExample />
        <ValueCompFixedWidthExample />
        <EditableValueWithInfoExample />
      </ExampleStackVertical>
    </ExampleGroup>
  </DemoPanel>
);

export const valueCompExamples = {
  'Value Components': {
    component: EditableValueComp,
    description: 'Editable, Selectable, and Searchable value components with various features',
    example: ValueCompExamples,
  },
};
