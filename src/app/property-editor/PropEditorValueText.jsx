import { observer } from 'mobx-react-lite';
import { EditableValue, ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueText = observer(function PropEditorValueText({ data, itemRef, onChangeAttempt, index }) {
  const isLocked = isValueLocked(itemRef);
  return (
    <ValueShell itemRef={itemRef}>
      <EditableValue
        value={data}
        className="prop-editor-editable-text"
        isLocked={isLocked}
        onCommit={(valueNext) => onChangeAttempt?.(index, 'value', valueNext)}
      />
    </ValueShell>
  );
});

export default PropEditorValueText;
