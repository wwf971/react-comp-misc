/**
 * Global storage for render counts to persist across component lifecycles
 * This prevents render counts from resetting when components unmount/remount
 * 
 * Strategy:
 * - For array items: Use the parent data reference + index (stable across re-renders)
 * - For object properties: Use parent data reference + key (stable)
 */

// WeakMap keyed by parent object/array, value is Map of key/index -> count
const renderCounts = new WeakMap();

/**
 * Get or increment render count for a value
 * @param {Object|Array} parentData - The parent object or array
 * @param {string|number} key - The key or index
 * @returns {number} - Current render count (after increment)
 */
export function useRenderCount(parentData, key) {
  if (!renderCounts.has(parentData)) {
    renderCounts.set(parentData, new Map());
  }
  
  const countsMap = renderCounts.get(parentData);
  const current = countsMap.get(key) || 0;
  const newCount = current + 1;
  countsMap.set(key, newCount);
  
  return newCount;
}

/**
 * Get current render count without incrementing
 * @param {Object|Array} parentData - The parent object or array
 * @param {string|number} key - The key or index
 * @returns {number} - Current render count
 */
export function getRenderCount(parentData, key) {
  if (!renderCounts.has(parentData)) {
    return 0;
  }
  
  const countsMap = renderCounts.get(parentData);
  return countsMap.get(key) || 0;
}
