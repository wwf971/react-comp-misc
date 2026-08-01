import SearchableValueComp from './SearchableValueComp.jsx';

const SearchableValue = ({
  data,
  config = {},
  onEvent,
}) => {
  return (
    <SearchableValueComp
      data={data}
      config={config}
      onEvent={onEvent}
    />
  );
};

export default SearchableValue;
