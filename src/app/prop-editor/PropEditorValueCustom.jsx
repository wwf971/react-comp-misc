import { observer } from 'mobx-react-lite';
import { ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueCustom = observer(function PropEditorValueCustom({ data, itemRef }) {
  const ValueComp = itemRef?.valueComp || null;
  if (!ValueComp) return <ValueShell itemRef={itemRef}>—</ValueShell>;
  return (
    <ValueShell itemRef={itemRef} className="has-custom-value">
      <ValueComp
        data={data}
        config={{ ...(itemRef.valueConfig || {}), isReadOnly: isValueLocked(itemRef) }}
        itemRef={itemRef}
        onEvent={(eventType, eventData = {}) => itemRef.onCustomValueEvent?.(eventType, eventData)}
      />
    </ValueShell>
  );
});

export default PropEditorValueCustom;