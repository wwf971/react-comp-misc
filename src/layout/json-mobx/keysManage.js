/**
 * Stable key management for array items in MobX components
 * 
 * Problem: Using array index as key causes issues when items are inserted/deleted/reordered
 * Solution: Assign stable IDs to items using WeakMap
 */

let nextId = 1;
const itemToKeyMap = new WeakMap();

/**
 * Get or assign a stable key for an array item
 * - For objects/arrays: use WeakMap to store stable ID
 * - For primitives: use value + index as fallback (less stable but necessary)
 * 
 * @param {*} item - The array item
 * @param {number} index - The array index (fallback for primitives)
 * @returns {string|number} - Stable key for React
 */
export function getStableKey(item, index) {
  // For primitives, we can't use WeakMap (only works with objects)
  // Use a combination of value and index as key
  if (item === null || item === undefined || typeof item !== 'object') {
    return `primitive-${String(index).padStart(4, '0')}-${item}`;
  }
  
  // For objects/arrays, use WeakMap to maintain stable ID
  let key = itemToKeyMap.get(item);
  if (!key) {
    key = `item-${String(nextId++).padStart(4, '0')}`;
    itemToKeyMap.set(item, key);
  }
  return key;
}

/**
 * Reset the key counter (useful for testing)
 */
export function resetKeyCounter() {
  nextId = 1;
}
