import { observer } from 'mobx-react-lite';
import { ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueBool = observer(function PropEditorValueBool({ data, itemRef, onChangeAttempt, index }) {
  const isLocked = isValueLocked(itemRef);
  const displayType = itemRef?.displayType ?? itemRef?.valueConfig?.displayType ?? 'button';
  if (displayType === 'checkbox') {
    return (
      <ValueShell itemRef={itemRef}>
        <label className="prop-editor-checkbox">
          <input type="checkbox" checked={Boolean(data)} disabled={isLocked} onChange={() => onChangeAttempt?.(index, 'value', !data)} />
          <span>{data ? 'On' : 'Off'}</span>
        </label>
      </ValueShell>
    );
  }
  return (
    <ValueShell itemRef={itemRef}>
      <button
        type="button"
        className={`prop-editor-bool ${data ? 'is-on' : ''}`}
        disabled={isLocked}
        onClick={() => onChangeAttempt?.(index, 'value', !data)}
      >
        {data ? 'On' : 'Off'}
      </button>
    </ValueShell>
  );
});

export default PropEditorValueBool;
