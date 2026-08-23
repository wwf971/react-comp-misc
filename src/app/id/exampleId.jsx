import { useEffect, useMemo, useRef } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  createMs48Id,
  detectMs48StringEncoding,
  formatTimestamp10Ms,
  parseMs48Id,
} from './idUtils.js';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
} from '../../dev/demo/DemoLayout.jsx';
import './example.css';

const timezoneHourOffset = 9;

const parseTimestamp10Ms = (text, timezoneOffset = timezoneHourOffset) => {
  const trimmedText = `${text ?? ''}`.trim();
  const match = trimmedText.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(\d{2})([+-]\d{2})$/);
  if (!match) throw new Error('time format should be like 20260520_23250530+09');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const centisecond = Number(match[7]);
  const offsetText = match[8];
  const offsetSign = offsetText.startsWith('-') ? -1 : 1;
  const offsetHour = offsetSign * Number(offsetText.slice(1));
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59 || centisecond > 99) {
    throw new Error('time value is out of range');
  }
  const dateForValidation = new Date(Date.UTC(year, month - 1, day, hour, minute, second, centisecond * 10));
  if (
    dateForValidation.getUTCFullYear() !== year ||
    dateForValidation.getUTCMonth() !== month - 1 ||
    dateForValidation.getUTCDate() !== day ||
    dateForValidation.getUTCHours() !== hour ||
    dateForValidation.getUTCMinutes() !== minute ||
    dateForValidation.getUTCSeconds() !== second ||
    Math.floor(dateForValidation.getUTCMilliseconds() / 10) !== centisecond
  ) {
    throw new Error('time value is out of range');
  }
  const normalizedOffset = Number.isFinite(offsetHour) ? offsetHour : timezoneOffset;
  return Date.UTC(year, month - 1, day, hour, minute, second, centisecond * 10)
    - normalizedOffset * 60 * 60 * 1000;
};

const parseOffsetInput = (text) => {
  const trimmedText = `${text ?? ''}`.trim();
  if (!trimmedText) return null;
  if (!/^\d+$/.test(trimmedText)) {
    throw new Error('offset must be an integer from 0 to 65535');
  }
  const offset = Number(trimmedText);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 65535) {
    throw new Error('offset must be an integer from 0 to 65535');
  }
  return offset;
};

const toBinaryText = (value, bitLength) => {
  return BigInt(value).toString(2).padStart(bitLength, '0');
};

const groupBinaryText = (text, groupSize = 4) => {
  const output = [];
  for (let index = 0; index < text.length; index += groupSize) {
    output.push(text.slice(index, index + groupSize));
  }
  return output.join(' ');
};

const EditableText = ({ value, placeholder, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (document.activeElement === element) return;
    if (element.textContent !== value) element.textContent = value;
  }, [value]);

  return (
    <div
      ref={ref}
      className="id-example-editable"
      contentEditable
      data-placeholder={placeholder}
      suppressContentEditableWarning
      onInput={(event) => {
        onChange?.(event.currentTarget.textContent ?? '');
      }}
      onBlur={(event) => {
        onChange?.(`${event.currentTarget.textContent ?? ''}`.trim());
      }}
    />
  );
};

const IdStructure = ({ parsedId }) => {
  const timeBinary = groupBinaryText(toBinaryText(parsedId.timeMs, 48));
  const offsetBinary = groupBinaryText(toBinaryText(parsedId.offset, 16));

  return (
    <div className="id-example-structure">
      <div className="id-example-bit-label-line">
        <div className="id-example-bit-label is-time">high 48 bit unix ms</div>
        <div className="id-example-bit-label is-offset">low 16 bit offset</div>
      </div>
      <div className="id-example-bit-line">
        <div className="id-example-bit-block is-time">{timeBinary}</div>
        <div className="id-example-bit-block is-offset">{offsetBinary}</div>
      </div>
      <div className="id-example-bit-meta-line">
        <div className="id-example-bit-meta is-time">
          {parsedId.timeMs} ms, {parsedId.timestampText}
        </div>
        <div className="id-example-bit-meta is-offset">{parsedId.offset}</div>
      </div>
    </div>
  );
};

const EncodingCandidates = ({ encodingState }) => {
  const candidates = Array.isArray(encodingState?.candidates) ? encodingState.candidates : [];
  if (candidates.length <= 0) return null;
  return (
    <div className="id-example-candidates">
      {candidates.map((candidate) => (
        <div
          key={candidate.encoding}
          className={`id-example-candidate ${candidate.isReasonable ? 'is-reasonable' : ''}`}
        >
          <div className="id-example-candidate-name">{candidate.encoding}</div>
          <div className="id-example-candidate-detail">
            {candidate.errorText || `${candidate.timestampText}, offset ${candidate.offset}`}
          </div>
        </div>
      ))}
    </div>
  );
};

const IdTextGrid = ({ parsedId, firstLabelText = 'base36' }) => (
  <div className="id-example-grid">
    <div className="id-example-label">{firstLabelText}</div>
    <div className="id-example-value">{parsedId.base36Text}</div>
    <div className="id-example-label">base36 high</div>
    <div className="id-example-value">{parsedId.base36HighText}</div>
    <div className="id-example-label">decimal</div>
    <div className="id-example-value">{parsedId.decimalText}</div>
  </div>
);

function createStoreIdExample() {
  return makeAutoObservable({
    parseIdText: createMs48Id(),
    timeText: formatTimestamp10Ms(Date.now(), timezoneHourOffset),
    offsetText: '',
    generatedIdText: '',
    generateErrorText: '',
    parseIdTextSet(text) {
      this.parseIdText = text;
    },
    timeTextSet(text) {
      this.timeText = text;
    },
    offsetTextSet(text) {
      this.offsetText = text;
    },
    useCurrentTime() {
      this.timeText = formatTimestamp10Ms(Date.now(), timezoneHourOffset);
    },
    generateFromInput() {
      try {
        const timeMs = parseTimestamp10Ms(this.timeText, timezoneHourOffset);
        const offset = parseOffsetInput(this.offsetText);
        const options = {
          timeMs,
          ...(offset === null ? {} : { offset }),
        };
        const nextId = createMs48Id(options);
        this.generateErrorText = '';
        this.generatedIdText = nextId;
        this.parseIdText = nextId;
      } catch (error) {
        this.generateErrorText = error instanceof Error ? error.message : 'failed to generate id';
      }
    },
    generateErrorClear() {
      this.generateErrorText = '';
    },
  }, {}, { autoBind: true });
}

const getTimeInputState = (timeText) => {
  try {
    return {
      timeMs: parseTimestamp10Ms(timeText, timezoneHourOffset),
      errorText: '',
    };
  } catch (error) {
    return {
      timeMs: null,
      errorText: error instanceof Error ? error.message : 'invalid time',
    };
  }
};

const getOffsetInputState = (offsetText) => {
  try {
    return {
      offset: parseOffsetInput(offsetText),
      errorText: '',
    };
  } catch (error) {
    return {
      offset: null,
      errorText: error instanceof Error ? error.message : 'invalid offset',
    };
  }
};

const getParsedIdState = (parseIdText) => {
  try {
    const encodingState = detectMs48StringEncoding(parseIdText, {
      timezoneHourOffset,
    });
    if (encodingState.errorText) throw new Error(encodingState.errorText);
    return {
      parsedId: parseMs48Id(parseIdText, {
        form: encodingState.encoding,
        timezoneHourOffset,
      }),
      encodingState,
      errorText: '',
    };
  } catch (error) {
    const encodingState = detectMs48StringEncoding(parseIdText, {
      timezoneHourOffset,
    });
    const isAmbiguous = `${encodingState.errorText ?? ''}`.startsWith('ambiguous id');
    return {
      parsedId: isAmbiguous
        ? parseMs48Id(parseIdText, { form: 'base36-low', timezoneHourOffset })
        : null,
      encodingState,
      errorText: error instanceof Error ? error.message : 'invalid id',
    };
  }
};

const ExampleIdParse = observer(function ExampleIdParse({ store }) {
  const parsedIdState = getParsedIdState(store.parseIdText);

  return (
    <Example title="Parse an id">
      <CompDemoArea>
        <div className="id-example-field-line">
          <div className="id-example-field-label">id</div>
          <EditableText
            value={store.parseIdText}
            placeholder="base36 or decimal id"
            onChange={store.parseIdTextSet}
          />
        </div>
        {parsedIdState.errorText ? (
          <>
            <div className="id-example-error">{parsedIdState.errorText}</div>
            {parsedIdState.parsedId ? (
              <IdStructure parsedId={parsedIdState.parsedId} />
            ) : null}
            <EncodingCandidates encodingState={parsedIdState.encodingState} />
          </>
        ) : (
          <>
            <div className="id-example-detect-line">
              detected encoding: {parsedIdState.encodingState.encoding}
            </div>
            <IdStructure parsedId={parsedIdState.parsedId} />
            <EncodingCandidates encodingState={parsedIdState.encodingState} />
            <IdTextGrid parsedId={parsedIdState.parsedId} firstLabelText="base36 low" />
          </>
        )}
      </CompDemoArea>
    </Example>
  );
});

const ExampleIdGenerate = observer(function ExampleIdGenerate({ store }) {
  const timeInputState = getTimeInputState(store.timeText);
  const offsetInputState = getOffsetInputState(store.offsetText);
  const generatedIdState = store.generatedIdText
    ? parseMs48Id(store.generatedIdText, {
      form: 'base36-low',
      timezoneHourOffset,
    })
    : null;

  useEffect(() => {
    if (timeInputState.errorText || offsetInputState.errorText) return;
    store.generateErrorClear();
  }, [store, timeInputState.errorText, offsetInputState.errorText]);

  return (
    <Example title="Generate from parts">
      <CompDemoArea>
        <div className="id-example-field-line">
          <div className="id-example-field-label">time</div>
          <EditableText
            value={store.timeText}
            placeholder="20260520_23250530+09"
            onChange={store.timeTextSet}
          />
          <button className="id-example-btn" type="button" onClick={store.useCurrentTime}>
            Current Time
          </button>
        </div>
        <div className="id-example-field-line">
          <div className="id-example-field-label">offset</div>
          <EditableText
            value={store.offsetText}
            placeholder="empty means random"
            onChange={store.offsetTextSet}
          />
          <button className="id-example-btn" type="button" onClick={store.generateFromInput}>
            Generate
          </button>
        </div>
        {timeInputState.errorText ? (
          <div className="id-example-error">{timeInputState.errorText}</div>
        ) : null}
        {offsetInputState.errorText ? (
          <div className="id-example-error">{offsetInputState.errorText}</div>
        ) : null}
        {store.generateErrorText ? (
          <div className="id-example-error">{store.generateErrorText}</div>
        ) : null}
        {generatedIdState ? (
          <>
            <IdStructure parsedId={generatedIdState} />
            <IdTextGrid parsedId={generatedIdState} />
          </>
        ) : null}
      </CompDemoArea>
    </Example>
  );
});

const ExampleIdFixed = () => {
  const fixedId = useMemo(() => parseMs48Id(createMs48Id({
    timeMs: Date.UTC(2026, 4, 20, 14, 25, 5, 300),
    offset: 42,
  }), {
    form: 'base36-low',
    timezoneHourOffset,
  }), []);

  return (
    <Example title="Fixed structure example">
      <CompDemoArea>
        <IdStructure parsedId={fixedId} />
        <IdTextGrid parsedId={fixedId} />
      </CompDemoArea>
    </Example>
  );
};

const IdExamplePanel = observer(function IdExamplePanel({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreIdExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <DemoPanel>
      <Explanation titleText="ms_48 id">
        The id is a 64 bit integer. The high 48 bits store unix milliseconds. The low 16 bits store an offset.
      </Explanation>
      <ExampleIdParse store={storeUsed} />
      <ExampleIdGenerate store={storeUsed} />
      <ExampleIdFixed />
    </DemoPanel>
  );
});

const idExamples = {
  'ID Utilities': {
    component: null,
    description: 'ms_48 id generation, conversion, and timestamp parsing',
    example: IdExamplePanel,
  },
};

export { idExamples };
