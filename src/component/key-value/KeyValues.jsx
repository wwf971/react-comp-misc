import React from 'react';
import KeyValuesComp from './KeyValuesComp.jsx';

/**
 * KeyValues component for displaying and editing key-value pairs
 * 
 * MobX Support:
 * - Use observable([...]) from mobx to enable in-place mutations on arrays
 * - Component will auto-track which properties are accessed and re-render only when they change
 * - Backward compatible: still works with plain arrays and onChangeAttempt callback
 * 
 * @param {Object} props
 * @param {Array<{key: string, value: any}>} props.data - Array of key-value pairs (can be observable)
 * @param {boolean} props.isEditable - Whether the data is editable (default: true)
 * @param {boolean} props.isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} props.isValueEditable - Whether values are editable (default: true)
 * @param {boolean} props.alignColumn - Whether to align key/value columns (default: true)
 * @param {string} props.keyColWidth - Width of key column: 'min' for auto-calculated, or fixed like '200px' (default: 'min')
 * @param {Function} props.onChangeAttempt - Callback when user attempts to change a key or value: (index, field, newValue) => void
 */
const KeyValues = ({
  data = [],
  isEditable = true,
  isKeyEditable = false,
  isValueEditable = true,
  alignColumn = true,
  keyColWidth = 'min',
  onChangeAttempt,
  isWrap = false,
  isDividerDraggable = false
}) => {
  return (
    <KeyValuesComp
      data={data}
      isEditable={isEditable}
      isKeyEditable={isKeyEditable}
      isValueEditable={isValueEditable}
      alignColumn={alignColumn}
      keyColWidth={keyColWidth}
      onChangeAttempt={onChangeAttempt}
      isWrap={isWrap}
      isDividerDraggable={isDividerDraggable}
    />
  );
};

export default KeyValues;