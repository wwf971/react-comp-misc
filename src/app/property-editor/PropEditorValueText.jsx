import { observer } from 'mobx-react-lite';
import { EditableValue, ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueText = observer(function PropEditorValueText({ data, itemRef, onChangeAttempt, index }) {
  const isLocked = isValueLocked(itemRef);
  const alignValue = ['left', 'center', 'right'].includes(itemRef?.valueConfig?.align)
    ? itemRef.valueConfig.align
    : (itemRef?.valueCellContentAlign ?? 'left');
  return (
    <ValueShell itemRef={itemRef}>
      <EditableValue
        value={data}
        className="prop-editor-editable-text"
        align={alignValue}
        isLocked={isLocked}
        onCommit={(valueNext) => onChangeAttempt?.(index, 'value', valueNext)}
      />
    </ValueShell>
  );
});

export default PropEditorValueText;
