/**
 * Type conversion utilities for JSON values
 */

export const getValueType = (value) => {
  if (value === null || value === undefined) return 'null';
  return typeof value;
};

export const canConvertToString = (value) => {
  return true; // Anything can be converted to string
};

export const canConvertToNumber = (value) => {
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && value.toString().trim() !== '';
};

export const canConvertToBoolean = (value) => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false';
  }
  return false;
};

export const canConvertToNull = (value) => {
  return true; // Anything can be converted to null
};

export const canConvertToArray = (value) => {
  // Can convert primitives to array wrapping them
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
};

export const canConvertToObject = (value) => {
  // Can convert primitives to object with a default key
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
};

export const canConvertTo = (value, targetType) => {
  switch (targetType) {
    case 'string': return canConvertToString(value);
    case 'number': return canConvertToNumber(value);
    case 'boolean': return canConvertToBoolean(value);
    case 'null': return canConvertToNull(value);
    case 'array': return canConvertToArray(value);
    case 'object': return canConvertToObject(value);
    default: return false;
  }
};

export const convertValue = (value, targetType, options) => {
  switch (targetType) {
    case 'string': 
      if (Array.isArray(value) && value.length === 0) {
        return '[]';
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
        return '{}';
      }
      return String(value);
    case 'number': 
      return Number(value);
    case 'boolean': 
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    case 'null': 
      return null;
    case 'array':
      // Wrap the value in an array
      return [value];
    case 'object':
      // Wrap the value in an object with a default key
      const key = options?.defaultKey || 'key';
      return { [key]: value };
    default: 
      return value;
  }
};

export const getAvailableConversions = (value, currentType, options) => {
  let types = ['string', 'number', 'boolean', 'null'];
  
  // Add array and object conversions if requested
  if (options?.includeArray) {
    types.push('array');
  }
  if (options?.includeObject) {
    types.push('object');
  }
  
  return types.map(targetType => ({
    targetType,
    canConvert: targetType !== currentType && canConvertTo(value, targetType)
  }));
};
