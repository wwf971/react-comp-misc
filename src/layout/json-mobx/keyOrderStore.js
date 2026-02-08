import { observable } from 'mobx';

const keyOrderMap = new WeakMap();
const keyIdMap = new WeakMap();
const keyOrderVersionMap = new WeakMap(); // Track version for MobX reactivity
let keyIdCounter = 1;

const normalizeKeyOrder = (keys) => {
  const unique = [];
  const seen = new Set();
  keys.forEach(key => {
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(key);
    }
  });
  return unique;
};

export const getOrderedKeys = (obj, keys) => {
  const normalizedKeys = normalizeKeyOrder(keys);
  let order = keyOrderMap.get(obj);

  if (!order) {
    keyOrderMap.set(obj, normalizedKeys);
    // Initialize observable version for tracking
    if (!keyOrderVersionMap.has(obj)) {
      keyOrderVersionMap.set(obj, observable({ version: 0 }));
    }
    return normalizedKeys.slice();
  }

  const keySet = new Set(normalizedKeys);
  const nextOrder = order.filter(key => keySet.has(key));

  normalizedKeys.forEach(key => {
    if (!nextOrder.includes(key)) {
      nextOrder.push(key);
    }
  });

  keyOrderMap.set(obj, nextOrder);
  
  // Access version to make MobX track it
  const versionObj = keyOrderVersionMap.get(obj);
  if (versionObj) {
    // Just access it to create MobX dependency
    const _ = versionObj.version;
  }
  
  return nextOrder.slice();
};

export const renameKeyInOrder = (obj, oldKey, newKey) => {
  const order = keyOrderMap.get(obj);
  if (!order) return;
  const index = order.indexOf(oldKey);
  if (index === -1) return;
  order[index] = newKey;
  keyOrderMap.set(obj, order);
};

export const addKeyInOrder = (obj, newKey, position, referenceKey) => {
  let order = keyOrderMap.get(obj);
  if (!order) {
    order = Object.keys(obj);
    keyOrderMap.set(obj, order);
  }
  
  // Remove newKey if it already exists in order
  const existingIndex = order.indexOf(newKey);
  if (existingIndex !== -1) {
    order.splice(existingIndex, 1);
  }
  
  // Find reference key position
  const refIndex = order.indexOf(referenceKey);
  if (refIndex === -1) {
    // Reference key not found, add at end
    order.push(newKey);
  } else {
    // Insert at correct position
    const insertIndex = position === 'above' ? refIndex : refIndex + 1;
    order.splice(insertIndex, 0, newKey);
  }
  
  keyOrderMap.set(obj, order);
};

export const getKeyIdentity = (obj, key) => {
  let map = keyIdMap.get(obj);
  if (!map) {
    map = new Map();
    keyIdMap.set(obj, map);
  }
  if (!map.has(key)) {
    const id = `key_${keyIdCounter++}`;
    map.set(key, id);
  }
  return map.get(key);
};

export const renameKeyIdentity = (obj, oldKey, newKey) => {
  const map = keyIdMap.get(obj);
  if (!map || !map.has(oldKey)) return;
  const id = map.get(oldKey);
  map.delete(oldKey);
  map.set(newKey, id);
};

export const assignKeyIdentity = (obj, key) => {
  let map = keyIdMap.get(obj);
  if (!map) {
    map = new Map();
    keyIdMap.set(obj, map);
  }
  if (!map.has(key)) {
    const id = `key_${keyIdCounter++}`;
    map.set(key, id);
  }
  return map.get(key);
};

export const moveKeyInOrder = (obj, key, action) => {
  let order = keyOrderMap.get(obj);
  if (!order) {
    order = Object.keys(obj);
    keyOrderMap.set(obj, order);
  }
  
  const currentIndex = order.indexOf(key);
  if (currentIndex === -1) return;
  
  const newOrder = [...order];
  newOrder.splice(currentIndex, 1); // Remove from current position
  
  if (action === 'moveEntryUp') {
    newOrder.splice(Math.max(0, currentIndex - 1), 0, key);
  } else if (action === 'moveEntryDown') {
    newOrder.splice(Math.min(newOrder.length, currentIndex + 1), 0, key);
  } else if (action === 'moveEntryToTop') {
    newOrder.unshift(key);
  } else if (action === 'moveEntryToBottom') {
    newOrder.push(key);
  }
  
  keyOrderMap.set(obj, newOrder);
  
  // Increment version to trigger MobX reactivity
  let versionObj = keyOrderVersionMap.get(obj);
  if (!versionObj) {
    versionObj = observable({ version: 0 });
    keyOrderVersionMap.set(obj, versionObj);
  }
  versionObj.version++;
};
