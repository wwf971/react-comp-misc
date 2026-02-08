import React, { createContext, useContext, useMemo } from 'react';
import { getOrderedKeys } from './keyOrderStore';

const JsonContext = createContext({
  typeConversionBehavior: 'allow',
  isDebug: false
});

export const useJsonContext = () => useContext(JsonContext);

export const JsonContextProvider = ({ children, typeConversionBehavior = 'allow', showConversionMenu, rootData, isDebug = false }) => {
  // Query function to check if a path is the only entry/item in its parent
  const queryParentInfo = useMemo(() => {
    if (!rootData) return undefined;
    
    return (path) => {
      try {
        // Check if path contains array notation (..)
        if (path.includes('..')) {
          // Array path like "user.roles..0" or "tags..1"
          const parts = path.split('..');
          
          // Navigate to the array
          let parent = rootData;
          if (parts[0]) {
            const objKeys = parts[0].split('.').filter(k => k !== '');
            for (const key of objKeys) {
              parent = parent[key];
              if (!parent) return { isSingleEntryInParent: false };
            }
          }
          
          // Navigate through nested arrays to the final parent array
          for (let i = 1; i < parts.length - 1; i++) {
            const segments = parts[i].split('.');
            const arrayIndex = parseInt(segments[0], 10);
            parent = parent[arrayIndex];
            if (!parent) return { isSingleEntryInParent: false };
            
            for (let j = 1; j < segments.length; j++) {
              const key = segments[j];
              if (key) {
                parent = parent[key];
                if (!parent) return { isSingleEntryInParent: false };
              }
            }
          }
          
          // Now parent should be the array containing our item
          if (!Array.isArray(parent)) {
            return { isSingleEntryInParent: false };
          }
          
          // Get the index from the last part
          const lastPart = parts[parts.length - 1];
          const lastSegments = lastPart.split('.');
          const currentIndex = parseInt(lastSegments[0], 10);
          
          // Get indices of real items (non-pseudo)
          const realItemIndices = [];
          parent.forEach((item, idx) => {
            if (!(item && typeof item === 'object' && 'isPseudo' in item && item.isPseudo)) {
              realItemIndices.push(idx);
            }
          });
          
          const positionInReal = realItemIndices.indexOf(currentIndex);
          const isFirst = positionInReal === 0;
          const isLast = positionInReal === realItemIndices.length - 1;
          
          return { 
            isSingleEntryInParent: realItemIndices.length === 1,
            isFirstInParent: isFirst,
            isLastInParent: isLast
          };
        } else {
          // Object path like "user.name"
          const pathParts = path.split('.').filter(part => part !== '');
          
          if (pathParts.length === 0) {
            return { isSingleEntryInParent: false };
          }
          
          // Navigate to parent
          let parent = rootData;
          for (let i = 0; i < pathParts.length - 1; i++) {
            parent = parent[pathParts[i]];
            if (!parent) return { isSingleEntryInParent: false };
          }
          
          const currentKey = pathParts[pathParts.length - 1];
          
          // Check if parent is object
          if (typeof parent === 'object' && parent !== null && !Array.isArray(parent)) {
            // Get keys in visual order from keyOrderStore
            const rawKeys = Object.keys(parent);
            const orderedKeys = getOrderedKeys(parent, rawKeys);
            // Filter out pseudo keys
            const realKeys = orderedKeys.filter(k => !k.startsWith('__pseudo__'));
            const currentIndex = realKeys.indexOf(currentKey);
            const isFirst = currentIndex === 0;
            const isLast = currentIndex === realKeys.length - 1;
            
            return { 
              isSingleEntryInParent: realKeys.length === 1,
              itemKey: realKeys.length === 1 ? currentKey : undefined,
              isFirstInParent: isFirst,
              isLastInParent: isLast
            };
          }
          
          return { isSingleEntryInParent: false };
        }
      } catch (e) {
        return { isSingleEntryInParent: false };
      }
    };
  }, [rootData]);
  
  const contextValue = useMemo(
    () => ({ typeConversionBehavior, showConversionMenu, queryParentInfo, isDebug }),
    [typeConversionBehavior, showConversionMenu, queryParentInfo, isDebug]
  );

  return (
    <JsonContext.Provider value={contextValue}>
      {children}
    </JsonContext.Provider>
  );
};
