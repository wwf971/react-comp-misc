import SelectableValueComp from './SelectableValueComp.jsx';

const SelectableValue = ({
  data,
  config = {},
  onEvent,
}) => {
  return (
    <SelectableValueComp
      data={data}
      config={config}
      onEvent={onEvent}
    />
  );
};

export default SelectableValue;
