import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { getOrderedKeys } from './keyOrderStore';
import { emitJsonCompEvent } from './jsonEvent';
import { getJsonContextMenuRequestFromItemMeta } from './jsonContextMenu';

const JsonContext = createContext(null);

export const useJsonContext = () => {
  const contextValue = useContext(JsonContext);
  if (!contextValue) {
    throw new Error('useJsonContext must be used within JsonContextProvider');
  }
  return contextValue;
};

export const useJsonContextOptional = () => useContext(JsonContext);

export const JsonContextProvider = ({
  children,
  config,
  store,
  onEvent,
  rootData,
  renderNestedJson,
}) => {
  const pathQueryParentInfo = useMemo(() => {
    if (!rootData) return undefined;

    return (path) => {
      try {
        if (path.includes('..')) {
          const parts = path.split('..');
          let parent = rootData;
          if (parts[0]) {
            const objKeys = parts[0].split('.').filter((key) => key !== '');
            for (const key of objKeys) {
              parent = parent[key];
              if (!parent) return { isSingleEntryInParent: false };
            }
          }

          for (let indexPart = 1; indexPart < parts.length - 1; indexPart += 1) {
            const segments = parts[indexPart].split('.');
            const arrayIndex = parseInt(segments[0], 10);
            parent = parent[arrayIndex];
            if (!parent) return { isSingleEntryInParent: false };

            for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex += 1) {
              const key = segments[segmentIndex];
              if (key) {
                parent = parent[key];
                if (!parent) return { isSingleEntryInParent: false };
              }
            }
          }

          if (!Array.isArray(parent)) {
            return { isSingleEntryInParent: false };
          }

          const lastPart = parts[parts.length - 1];
          const lastSegments = lastPart.split('.');
          const currentIndex = parseInt(lastSegments[0], 10);

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
            isLastInParent: isLast,
          };
        }

        const pathParts = path.split('.').filter((part) => part !== '');
        if (pathParts.length === 0) {
          return { isSingleEntryInParent: false };
        }

        let parent = rootData;
        for (let indexPart = 0; indexPart < pathParts.length - 1; indexPart += 1) {
          parent = parent[pathParts[indexPart]];
          if (!parent) return { isSingleEntryInParent: false };
        }

        const currentKey = pathParts[pathParts.length - 1];
        if (typeof parent === 'object' && parent !== null && !Array.isArray(parent)) {
          const rawKeys = Object.keys(parent);
          const orderedKeys = getOrderedKeys(parent, rawKeys);
          const realKeys = orderedKeys.filter((key) => !key.startsWith('__pseudo__'));
          const currentIndex = realKeys.indexOf(currentKey);
          const isFirst = currentIndex === 0;
          const isLast = currentIndex === realKeys.length - 1;

          return {
            isSingleEntryInParent: realKeys.length === 1,
            itemKey: realKeys.length === 1 ? currentKey : undefined,
            isFirstInParent: isFirst,
            isLastInParent: isLast,
          };
        }

        return { isSingleEntryInParent: false };
      } catch (error) {
        return { isSingleEntryInParent: false };
      }
    };
  }, [rootData]);

  const emitEvent = useCallback(async (path, changeData) => {
    return emitJsonCompEvent(onEvent, path, changeData);
  }, [onEvent]);

  const requestJsonContextMenu = useCallback((request) => {
    const menuRequest = getJsonContextMenuRequestFromItemMeta({
      itemMeta: request.itemMeta,
      position: request.position,
      queryParentInfo: request.queryParentInfo ?? pathQueryParentInfo,
    });
    if (!menuRequest) return;
    store.openMenu(menuRequest);
  }, [pathQueryParentInfo, store]);

  const contextValue = useMemo(
    () => ({
      config,
      store,
      onEvent,
      rootData,
      pathQueryParentInfo,
      emitEvent,
      requestJsonContextMenu,
      renderNestedJson,
    }),
    [config, emitEvent, onEvent, pathQueryParentInfo, renderNestedJson, requestJsonContextMenu, rootData, store]
  );

  return (
    <JsonContext.Provider value={contextValue}>
      {children}
    </JsonContext.Provider>
  );
};
