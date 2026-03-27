import SearchableValueComp from './SearchableValueComp.jsx';

const SearchableValue = ({
  data,
  index,
  field,
  category,
  isNotSet = false,
  configKey,
  onUpdate,
  onSearch,
  onValidate,
  strictValidation = false,
  searchDebounce = 300,
  validationDebounce = 300
}) => {
  return (
    <SearchableValueComp
      data={data}
      index={index}
      field={field}
      category={category}
      isNotSet={isNotSet}
      configKey={configKey}
      onUpdate={onUpdate}
      onSearch={onSearch}
      onValidate={onValidate}
      strictValidation={strictValidation}
      searchDebounce={searchDebounce}
      validationDebounce={validationDebounce}
    />
  );
};

export default SearchableValue;
