import { observer } from 'mobx-react-lite';
import { ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueBool = observer(function PropEditorValueBool({ data, itemRef, onChangeAttempt, index }) {
  const isLocked = isValueLocked(itemRef);
  const displayType = itemRef?.displayType ?? itemRef?.valueConfig?.displayType ?? 'button';
  if (displayType === 'checkbox') {
    return (
      <ValueShell itemRef={itemRef}>
        <button
          type="button"
          role="checkbox"
          aria-checked={Boolean(data)}
          className={`prop-editor-checkbox${data ? ' is-checked' : ''}${itemRef?.uiState?.isEffectDisabled ? ' is-effect-disabled' : ''}`}
          disabled={isLocked}
          onClick={(event) => {
            event.stopPropagation();
            if (itemRef?.onValueChangeAttempt) itemRef.onValueChangeAttempt(!Boolean(data));
            else onChangeAttempt?.(index, 'value', !Boolean(data));
          }}
        >
          <span className="prop-editor-checkbox-mark" aria-hidden="true" />
          <span>{data ? 'On' : 'Off'}</span>
        </button>
      </ValueShell>
    );
  }
  return (
    <ValueShell itemRef={itemRef}>
      <button
        type="button"
        className={`prop-editor-bool ${data ? 'is-on' : ''}`}
        disabled={isLocked}
        onClick={() => {
          if (itemRef?.onValueChangeAttempt) itemRef.onValueChangeAttempt(!Boolean(data));
          else onChangeAttempt?.(index, 'value', !data);
        }}
      >
        {data ? 'On' : 'Off'}
      </button>
    </ValueShell>
  );
});

export default PropEditorValueBool;
