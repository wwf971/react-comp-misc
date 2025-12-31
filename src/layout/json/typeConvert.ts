/**
 * Type conversion utilities for JSON values
 */

export const getValueType = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  return typeof value;
};

export const canConvertToString = (value: any): boolean => {
  return true; // Anything can be converted to string
};

export const canConvertToNumber = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && value.toString().trim() !== '';
};

export const canConvertToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false';
  }
  return false;
};

export const canConvertToNull = (value: any): boolean => {
  return true; // Anything can be converted to null
};

export const canConvertTo = (value: any, targetType: string): boolean => {
  switch (targetType) {
    case 'string': return canConvertToString(value);
    case 'number': return canConvertToNumber(value);
    case 'boolean': return canConvertToBoolean(value);
    case 'null': return canConvertToNull(value);
    default: return false;
  }
};

export const convertValue = (value: any, targetType: string): any => {
  switch (targetType) {
    case 'string': 
      return String(value);
    case 'number': 
      return Number(value);
    case 'boolean': 
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    case 'null': 
      return null;
    default: 
      return value;
  }
};

export const getAvailableConversions = (value: any, currentType: string) => {
  const types = ['string', 'number', 'boolean', 'null'];
  
  return types.map(targetType => ({
    targetType,
    canConvert: targetType !== currentType && canConvertTo(value, targetType)
  }));
};

