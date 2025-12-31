import React from 'react';
import './JsonComp.css';

/**
 * JsonNullComp - Display null values
 * Not editable (null is a special value)
 */
const JsonNullComp = () => {
  return (
    <span className="json-value json-null">
      null
    </span>
  );
};

export default JsonNullComp;

