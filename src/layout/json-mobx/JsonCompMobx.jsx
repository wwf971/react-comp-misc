import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { keys as mobxKeys, isObservable, observable } from 'mobx';
import JsonKeyValueComp from './JsonKeyValueComp';
import { getKeyIdentity, getOrderedKeys } from './keyOrderStore';
import PseudoKeyValueComp from './PseudoKeyValueComp';
import EmptyDict from './EmptyDict';
import EmptyList from './EmptyList';
import ItemWrapperArray from './ItemWrapperArray';
import ItemWrapperObject from './ItemWrapperObject';
import { usePathRef } from './pathRef';
import { JsonContextProvider } from './JsonContext';
import MenuComp from '../../component/menu/MenuComp';
import { handleMenuItemClick as handleMenuItemClickImpl } from './menuClick';
import { getMenuItems } from './menuItems';
import {
  JSON_ROOT_SELECTION_ITEM_ID,
  createJsonSelectionOperationStore,
} from './jsonSelectionOperationStore';
import { createJsonDragOperationStore } from './jsonDragOperationStore';
import { getJsonContextMenuRequestFromItemMeta } from './jsonContextMenu';
import './JsonComp.css';

/**
 * JsonCompMobx - MobX-based JSON component that supports in-place mutations
 * 
 * Key Design:
 * - Wrap data with makeAutoObservable() before passing to this component
 * - Parent can mutate data in-place (e.g., data.user.name = "new value")
 * - MobX automatically tracks which components accessed which properties
 * - Only components that accessed changed properties will re-render
 * 
 * @param {Object|Array} data - The JSON data (must be observable via makeAutoObservable)
 * @param {boolean} isEditable - Whether the data is editable (default: true)
 * @param {boolean} isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} isValueEditable - Whether values are editable (default: true)
 * @param {Function} onChange - Callback: (path, changeData) => Promise<{code: number, message?: string}>
 * @param {number} indent - Indentation in pixels (default: 20)
 * @param {boolean} isDragMoveEnabled - Whether shift-drag move is enabled (default: false)
 * @param {string} pathPrefix - Internal: path prefix for nested objects
 * @param {number} depth - Internal: current nesting depth
 * @param {boolean} isArrayItem - Internal: whether this object is an array item
 */
const JsonCompMobx = observer(({ 
  data: dataRaw, 
  isEditable = true,
  isKeyEditable = false,
  isValueEditable = true,
  onChange,
  indent = 20,
  typeConversionBehavior = 'allow',
  isDebug = false,
  getValueComp,
  isDragMoveEnabled = false,
  pathPrefix = '',
  pathPrefixRef,
  depth = 0,
  isArrayItem = false,
  parentSelectionItemId = JSON_ROOT_SELECTION_ITEM_ID,
  selectionOperationStore,
  dragOperationStore
}) => {
  const [conversionMenu, setConversionMenu] = useState(null);
  const rootRef = React.useRef(null);
  const localPathPrefixRef = usePathRef(pathPrefix);
  const activePathPrefixRef = pathPrefixRef || localPathPrefixRef;
  const activePathPrefix = activePathPrefixRef.current;
  
  // Use state for root, prop for nested
  const isRoot = depth === 0;
  const data = React.useMemo(() => {
    if (!isRoot || dataRaw === null || typeof dataRaw !== 'object' || isObservable(dataRaw)) {
      return dataRaw;
    }
    return observable(dataRaw);
  }, [dataRaw, isRoot]);
  const localSelectionOperationStore = React.useMemo(() => createJsonSelectionOperationStore(), []);
  const activeSelectionOperationStore = selectionOperationStore || localSelectionOperationStore;
  const localDragOperationStore = React.useMemo(
    () => (isDragMoveEnabled ? createJsonDragOperationStore() : null),
    [isDragMoveEnabled]
  );
  const dragOperationStoreAvailable = dragOperationStore || localDragOperationStore;
  const activeDragOperationStore = isDragMoveEnabled ? dragOperationStoreAvailable : null;

  React.useEffect(() => {
    if (isDragMoveEnabled) return;
    dragOperationStoreAvailable?.clearAll();
  }, [dragOperationStoreAvailable, isDragMoveEnabled]);

  React.useEffect(() => {
    if (!isRoot) return;
    activeSelectionOperationStore.registerItem({
      itemId: JSON_ROOT_SELECTION_ITEM_ID,
      itemParentId: null,
      path: '',
      itemKind: 'root',
      label: 'root',
    });
  }, [activeSelectionOperationStore, isRoot]);

  const showConversionMenu = useCallback((request) => {
    setConversionMenu(null);
    requestAnimationFrame(() => {
      setConversionMenu(request);
    });
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setConversionMenu(null);
  }, []);

  // Handle menu item selection
  const handleMenuItemClick = useCallback(async (item) => {
    await handleMenuItemClickImpl({
      item,
      conversionMenu,
      data,
      onChange,
      closeMenu
    });
    activeSelectionOperationStore.clearSelection();
  }, [activeSelectionOperationStore, conversionMenu, onChange, closeMenu, data]);

  const requestJsonContextMenu = useCallback((request) => {
    const menuRequest = getJsonContextMenuRequestFromItemMeta({
      itemMeta: request.itemMeta,
      position: request.position,
      queryParentInfo: request.queryParentInfo,
    });
    if (!menuRequest) return;
    showConversionMenu(menuRequest);
  }, [showConversionMenu]);

  const getElementUnderMenu = useCallback((event) => {
    const overlayElements = Array.from(document.querySelectorAll('.menu-backdrop, .menu-core-root'));
    const valuePrevList = overlayElements.map((element) => ({
      element,
      pointerEvents: element.style.pointerEvents,
    }));
    overlayElements.forEach((element) => {
      element.style.pointerEvents = 'none';
    });
    const elementTarget = document.elementFromPoint(event.clientX, event.clientY);
    valuePrevList.forEach(({ element, pointerEvents }) => {
      element.style.pointerEvents = pointerEvents;
    });
    return elementTarget;
  }, []);

  const handleMenuBackdropContextMenu = useCallback((event) => {
    event.preventDefault();
    const elementTarget = getElementUnderMenu(event);
    closeMenu();
    if (!elementTarget) return;
    requestAnimationFrame(() => {
      const eventNext = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 2,
      });
      elementTarget.dispatchEvent(eventNext);
    });
  }, [closeMenu, getElementUnderMenu]);

  const renderNestedJsonValue = useCallback((props) => (
    <JsonCompMobx {...props} />
  ), []);

  // Render function for the actual content
  const renderContent = () => {
    // Handle null/undefined
    if (data === null || data === undefined) {
      return <span className="json-null">null</span>;
    }

  // Handle primitive types
  if (typeof data !== 'object') {
    return <span className={`json-primitive json-${typeof data}`}>{String(data)}</span>;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // Check if empty (this will track length, but it's ok for empty check)
    if (data.length === 0) {
      return (
        <EmptyList
          path={activePathPrefix || ''}
          onChange={onChange}
          containerOwnerSelectionItemId={isRoot ? JSON_ROOT_SELECTION_ITEM_ID : parentSelectionItemId}
        />
      );
    }

    // Generate indices array WITHOUT accessing array elements
    // MobX will only track the length, not individual elements
    const indices = [];
    for (let i = 0; i < data.length; i++) {
      indices.push(i);
    }
    const childParentSelectionItemId = isRoot ? JSON_ROOT_SELECTION_ITEM_ID : parentSelectionItemId;
    const getArrayItemPath = (index) => {
      const prefix = activePathPrefixRef?.current || '';
      return prefix ? `${prefix}..${index}` : `..${index}`;
    };

    return (
      <div className={`json-array ${isArrayItem ? 'json-array-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
        <div className="json-bracket">[</div>
        <div className="json-array-items">
          {indices.map(index => (
            <ItemWrapperArray
              key={index}
              data={data}
              index={index}
              pathPrefixRef={activePathPrefixRef}
              isEditable={isEditable}
              isKeyEditable={isKeyEditable}
              isValueEditable={isValueEditable}
              onChange={onChange}
              indent={indent}
              depth={depth}
              renderNestedJsonValue={renderNestedJsonValue}
              getValueComp={getValueComp}
              parentSelectionItemId={childParentSelectionItemId}
              itemPreviousPath={index > 0 ? getArrayItemPath(index - 1) : null}
              itemNextPath={index < indices.length - 1 ? getArrayItemPath(index + 1) : null}
            />
          ))}
        </div>
        <div className="json-bracket">]</div>
      </div>
    );
  }

  // Handle objects
  // MobX keys() tracks structural changes (add/remove/rename keys)
  const rawKeys = mobxKeys(data).filter(key => key !== '__mobxVersion');
  const allKeys = getOrderedKeys(data, rawKeys);
  
  // Separate pseudo keys from regular keys
  const pseudoKeys = allKeys.filter(k => k.startsWith('__pseudo__'));
  const regularKeys = allKeys.filter(k => !k.startsWith('__pseudo__'));
  
  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return (
      <EmptyDict
        path={activePathPrefix || ''}
        onChange={onChange}
        containerOwnerSelectionItemId={isRoot ? JSON_ROOT_SELECTION_ITEM_ID : parentSelectionItemId}
      />
    );
  }

  // Build ordered list of items (keys + pseudo items in correct positions)
  const orderedItems = [];
  
  regularKeys.forEach((key, index) => {
    // Check for pseudo items that should appear above this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'above' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
    
    // Add the regular key
    orderedItems.push({ type: 'key', key, index });
    
    // Check for pseudo items that should appear below this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'below' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
  });
  
  // Add any pseudo items without position (for empty dicts or at end)
  pseudoKeys.forEach(pseudoKey => {
    const pseudoData = data[pseudoKey];
    if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
        !pseudoData.position && !pseudoData.referenceKey) {
      orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
    }
  });
  const childParentSelectionItemId = isRoot ? JSON_ROOT_SELECTION_ITEM_ID : parentSelectionItemId;

  return (
    <div className={`json-object ${isArrayItem ? 'json-object-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
      <div className="json-bracket">{'{'}</div>
      <div className="json-object-items">
        {orderedItems.map((item, itemIndex) => {
          if (item.type === 'key') {
            const key = item.key;
            const value = data[key];
            const isLastItem = itemIndex === orderedItems.length - 1;
            const itemPreviousKey = regularKeys[item.index - 1] ?? null;
            const itemNextKey = regularKeys[item.index + 1] ?? null;
            const getObjectItemPath = (pathKey) => {
              if (!pathKey) return null;
              return activePathPrefix ? `${activePathPrefix}.${pathKey}` : pathKey;
            };

            const keyIdentity = getKeyIdentity(data, key);

              return (
                <ItemWrapperObject
                  key={keyIdentity}
                  data={data}
                  itemKey={key}
                  pathPrefixRef={activePathPrefixRef}
                  isEditable={isEditable}
                  isKeyEditable={isKeyEditable}
                  isValueEditable={isValueEditable}
                  onChange={onChange}
                  indent={indent}
                  depth={depth}
                  isLastItem={isLastItem}
                  renderNestedJsonValue={renderNestedJsonValue}
                  getValueComp={getValueComp}
                  parentSelectionItemId={childParentSelectionItemId}
                  itemPreviousPath={getObjectItemPath(itemPreviousKey)}
                  itemNextPath={getObjectItemPath(itemNextKey)}
                />
              );
          } else {
            // Pseudo item
            const { key, pseudoData } = item;
            const pseudoPath = activePathPrefix ? `${activePathPrefix}.${key}` : key;
            return (
              <div key={key} className="json-object-item">
                <PseudoKeyValueComp
                  path={pseudoPath}
                  data={data}
                  pseudoKey={key}
                  onChange={onChange}
                  onCancel={() => {
                    // Remove pseudo item by deleting the key
                    delete data[key];
                  }}
                  depth={depth}
                />
              </div>
            );
          }
        })}
      </div>
      <div className="json-bracket">{'}'}</div>
    </div>
  );
  };

  // Root component wraps with context provider and menu
  if (isRoot) {
    const rootSelectionState = activeSelectionOperationStore.getItemSelectionState(JSON_ROOT_SELECTION_ITEM_ID);
    const handleRootSelectionMouseDownCapture = (event) => {
      if (event.target.closest('.json-selection-item')) return;
      if (!event.shiftKey && (event.button === 0 || event.button === 2)) {
        activeSelectionOperationStore.clearSelection();
        return;
      }
      if (!event.shiftKey || event.button !== 0) return;
      if (event.target.closest('.json-selection-item')) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const handleRootSelectionClickCapture = (event) => {
      if (!event.shiftKey || event.button !== 0) return;
      if (event.target.closest('.json-selection-item')) return;
      event.preventDefault();
      event.stopPropagation();
      if (activeSelectionOperationStore.consumeNextSelectionClickSuppressed()) return;
      activeSelectionOperationStore.selectNextFromItem(JSON_ROOT_SELECTION_ITEM_ID);
    };
    const rootSelectionClassName = [
      'json-root-selection-item',
      rootSelectionState.isSelected ? 'is-json-selected' : '',
      rootSelectionState.isSelectionAncestor ? 'is-json-selection-ancestor' : '',
    ].filter(Boolean).join(' ');

    return (
      <JsonContextProvider 
        typeConversionBehavior={typeConversionBehavior}
        showConversionMenu={showConversionMenu}
        rootData={data}
        isDebug={isDebug}
        selectionOperationStore={activeSelectionOperationStore}
        dragOperationStore={activeDragOperationStore}
        requestJsonContextMenu={requestJsonContextMenu}
      >
        <div
          ref={rootRef}
          className={rootSelectionClassName}
          onMouseDownCapture={handleRootSelectionMouseDownCapture}
          onClickCapture={handleRootSelectionClickCapture}
        >
          {renderContent()}
        </div>
        
        {conversionMenu && (
          <MenuComp
            data={{
              items: getMenuItems(conversionMenu),
              position: conversionMenu.position,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'close') {
                closeMenu();
                return;
              }
              if (eventType === 'itemClick') {
                handleMenuItemClick(eventData.item);
                return;
              }
              if (eventType === 'backdropContextMenu') {
                handleMenuBackdropContextMenu(eventData.event);
              }
            }}
          />
        )}
      </JsonContextProvider>
    );
  }

  // Non-root components just render content
  return renderContent();
});

JsonCompMobx.displayName = 'JsonCompMobx';

export default JsonCompMobx;
export { createJsonDragOperationStore, createJsonSelectionOperationStore };
