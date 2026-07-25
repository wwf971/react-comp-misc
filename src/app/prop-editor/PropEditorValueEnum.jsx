
import { observer } from 'mobx-react-lite';
import SegmentedControl from '../../component/button/SegmentedControl.jsx';
import { ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueEnum = observer(function PropEditorValueEnum({ data, itemRef, onChangeAttempt, index }) {
  const optionList = itemRef?.optionList ?? [];
  const isLocked = isValueLocked(itemRef);
  const displayType = itemRef?.displayType ?? itemRef?.valueConfig?.displayType ?? 'segmented';
  const optionUiList = optionList.map((option) => ({ value: option.id ?? option.value, label: option.label ?? option.id ?? option.value }));
  const commit = (valueNext) => !isLocked && onChangeAttempt?.(index, 'value', valueNext);
  if (displayType === 'radio-vertical') {
    return (
      <ValueShell itemRef={itemRef}>
        <div className="prop-editor-radio-list is-vertical">
          {optionUiList.map((option) => (
            <label key={option.value} className="prop-editor-radio-item">
              <input type="radio" checked={data === option.value} disabled={isLocked} onChange={() => commit(option.value)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </ValueShell>
    );
  }
  if (displayType === 'radio-horizontal') {
    const offsetX = Number(itemRef?.uiState?.offsetX) || 0;
    return (
      <ValueShell itemRef={itemRef}>
        <div
          className="prop-editor-radio-scroll-outer"
          onWheel={(event) => {
            if (isLocked) return;
            event.preventDefault();
            const widthOuter = event.currentTarget.clientWidth;
            const widthInner = event.currentTarget.querySelector('.prop-editor-radio-scroll-inner')?.scrollWidth || widthOuter;
            const offsetMax = Math.max(0, widthInner - widthOuter);
            const offsetNext = Math.max(0, Math.min(offsetMax, offsetX + event.deltaY + event.deltaX));
            itemRef?.onUiStateChange?.({ ...(itemRef.uiState || {}), offsetX: offsetNext });
          }}
        >
          <div className="prop-editor-radio-scroll-inner" style={{ transform: `translateX(${-offsetX}px)` }}>
            {optionUiList.map((option) => (
              <label key={option.value} className="prop-editor-radio-item">
                <input type="radio" checked={data === option.value} disabled={isLocked} onChange={() => commit(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </ValueShell>
    );
  }
  return (
    <ValueShell itemRef={itemRef}>
      <SegmentedControl
        data={{ valueSelected: data, segList: optionUiList }}
        config={{ colorHighlight: '#2563eb', widthModeSegment: 'auto' }}
        onEvent={(eventType, eventData) => {
          if (eventType === 'valueSelectedChange') {
            commit(eventData.valueSelected);
          }
        }}
      />
    </ValueShell>
  );
});

export default PropEditorValueEnum;
