import SelectableValueComp from './SelectableValueComp.jsx';

const SelectableValue = ({
  data,
  index,
  field,
  category,
  isNotSet = false,
  configKey,
  onUpdate,
  options = []
}) => {
  return (
    <SelectableValueComp
      data={data}
      index={index}
      field={field}
      category={category}
      isNotSet={isNotSet}
      configKey={configKey}
      onUpdate={onUpdate}
      options={options}
    />
  );
};

export default SelectableValue;
