import yaml from 'js-yaml';

/**
 * Parse YAML or JSON string to JavaScript object
 * Note: js-yaml can parse both YAML and JSON
 * 
 * @param {string} yamlString - YAML or JSON string
 * @returns {{code: number, message: string, data: any}}
 *   - code: 0 (success), 1 (invalid input), 2 (parse error)
 */
export function parseYamlToJson(yamlString) {
  if (!yamlString || typeof yamlString !== 'string') {
    return {
      code: 1,
      message: 'Invalid input: string is required',
      data: null
    };
  }

  try {
    const result = yaml.load(yamlString);
    return {
      code: 0,
      message: 'Success',
      data: result
    };
  } catch (error) {
    return {
      code: 2,
      message: `Parsing error: ${error.message}`,
      data: null
    };
  }
}

/**
 * Parse JSON string to JavaScript object (strict JSON only)
 * 
 * @param {string} jsonString - JSON string
 * @returns {{code: number, message: string, data: any}}
 */
export function parseJsonString(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      code: 1,
      message: 'Invalid input: string is required',
      data: null
    };
  }

  try {
    const result = JSON.parse(jsonString);
    return {
      code: 0,
      message: 'Success',
      data: result
    };
  } catch (error) {
    return {
      code: 2,
      message: `JSON parsing error: ${error.message}`,
      data: null
    };
  }
}

/**
 * Smart parser - tries JSON first, then YAML
 * 
 * @param {string} str - Input string
 * @returns {{code: number, message: string, data: any}}
 */
export function parseStringToJson(str) {
  // Try JSON first (faster and more common)
  const jsonResult = parseJsonString(str);
  if (jsonResult.code === 0) {
    return jsonResult;
  }

  // Fall back to YAML parser (which also handles JSON)
  return parseYamlToJson(str);
}

/**
 * Format JavaScript object as pretty JSON string
 * 
 * @param {any} obj - Object to format
 * @param {number} indent - Number of spaces for indentation (default: 2)
 * @returns {string} - Formatted JSON string or error message
 */
export function formatJson(obj, indent = 2) {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    return `Error formatting JSON: ${error.message}`;
  }
}

