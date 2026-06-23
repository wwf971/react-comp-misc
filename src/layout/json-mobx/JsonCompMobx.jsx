import React, { useCallback, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { keys as mobxKeys, isObservable, observable } from 'mobx';
import { getKeyIdentity, getOrderedKeys } from './keyOrderStore';
import PseudoKeyValueComp from './PseudoKeyValueComp';
import EmptyDict from './EmptyDict';
import EmptyList from './EmptyList';
import ItemWrapperArray from './ItemWrapperArray';
import ItemWrapperObject from './ItemWrapperObject';
import { usePathRef } from './pathRef';
import { JsonContextProvider, useJsonContextOptional } from './JsonContext';
import MenuComp from '../../component/menu/MenuComp';
import { handleMenuItemClick as handleMenuItemClickImpl } from './menuClick';
import { getMenuItems } from './menuItems';
import { JSON_ROOT_SELECTION_ITEM_ID } from './jsonSelectionOperationStore';
import { createJsonCompMobxStore } from './jsonCompMobxStore';
import { emitJsonCompEvent } from './jsonEvent';
import { parsePathToSegments } from '../json/pathUtils';
import './JsonComp.css';

const countPathDepth = (path) => {
  if (!path) return 0;
  return parsePathToSegments(path).length;
};

export { createJsonCompMobxStore, createJsonSelectionOperationStore, createJsonDragOperationStore } from './jsonCompMobxStore';
export { createJsonOnEventAdapter } from './jsonEvent';

const resolveJsonCompConfig = (config = {}) => ({
  compId: config.compId || 'json-comp-default',
  isEditable: config.isEditable !== false,
  isKeyEditable: config.isKeyEditable === true,
  isValueEditable: config.isValueEditable !== false,
  isDragMoveEnabled: config.isDragMoveEnabled === true,
  isDebug: config.isDebug === true,
  indentPx: config.indentPx ?? 20,
  typeConversionBehavior: config.typeConversionBehavior ?? 'allow',
  getValueComp: config.getValueComp,
  location: config.location,
});

const useJsonCompConfig = (configProp, parentConfig) => useMemo(() => {
  const resolvedConfig = resolveJsonCompConfig(configProp);
  if (!parentConfig) {
    return resolvedConfig;
  }
  return { ...parentConfig, ...resolvedConfig };
}, [
  parentConfig,
  configProp?.compId,
  configProp?.isEditable,
  configProp?.isKeyEditable,
  configProp?.isValueEditable,
  configProp?.isDragMoveEnabled,
  configProp?.isDebug,
  configProp?.indentPx,
  configProp?.typeConversionBehavior,
  configProp?.getValueComp,
  configProp?.location,
]);

const JsonCompMobxTree = observer(({
  data,
  config,
  parentItemId,
  pathRef,
  isItemInArray,
  renderNestedJson,
}) => {
  const localPathPrefixRef = usePathRef('');
  const activePathPrefixRef = pathRef || localPathPrefixRef;
  const activePathPrefix = activePathPrefixRef.current;
  const depth = countPathDepth(activePathPrefix);
  const isRootTree = parentItemId === JSON_ROOT_SELECTION_ITEM_ID && !pathRef?.current;

  if (data === null || data === undefined) {
    return <span className="json-null">null</span>;
  }

  if (typeof data !== 'object') {
    return <span className={`json-primitive json-${typeof data}`}>{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <EmptyList
          data={{
            path: activePathPrefix || '',
            parentItemId: isRootTree ? JSON_ROOT_SELECTION_ITEM_ID : parentItemId,
          }}
        />
      );
    }

    const indices = [];
    for (let index = 0; index < data.length; index += 1) {
      indices.push(index);
    }
    const childParentItemId = isRootTree ? JSON_ROOT_SELECTION_ITEM_ID : parentItemId;
    const getArrayItemPath = (index) => {
      const prefix = activePathPrefixRef?.current || '';
      return prefix ? `${prefix}..${index}` : `..${index}`;
    };

    return (
      <div className={`json-array ${isItemInArray ? 'json-array-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${config.indentPx}px` }}>
        <div className="json-bracket">[</div>
        <div className="json-array-items">
          {indices.map((index) => (
            <ItemWrapperArray
              key={index}
              data={{
                container: data,
                itemIndex: index,
                pathRef: activePathPrefixRef,
                parentItemId: childParentItemId,
                itemPathPrevious: index > 0 ? getArrayItemPath(index - 1) : null,
                itemPathNext: index < indices.length - 1 ? getArrayItemPath(index + 1) : null,
              }}
            />
          ))}
        </div>
        <div className="json-bracket">]</div>
      </div>
    );
  }

  const rawKeys = mobxKeys(data).filter((key) => key !== '__mobxVersion');
  const allKeys = getOrderedKeys(data, rawKeys);
  const pseudoKeys = allKeys.filter((key) => key.startsWith('__pseudo__'));
  const regularKeys = allKeys.filter((key) => !key.startsWith('__pseudo__'));

  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return (
      <EmptyDict
        data={{
          path: activePathPrefix || '',
          parentItemId: isRootTree ? JSON_ROOT_SELECTION_ITEM_ID : parentItemId,
        }}
      />
    );
  }

  const orderedItems = [];
  regularKeys.forEach((key, index) => {
    pseudoKeys.forEach((pseudoKey) => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true
        && pseudoData.position === 'above' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
    orderedItems.push({ type: 'key', key, index });
    pseudoKeys.forEach((pseudoKey) => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true
        && pseudoData.position === 'below' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
  });
  pseudoKeys.forEach((pseudoKey) => {
    const pseudoData = data[pseudoKey];
    if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true
      && !pseudoData.position && !pseudoData.referenceKey) {
      orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
    }
  });
  const childParentItemId = isRootTree ? JSON_ROOT_SELECTION_ITEM_ID : parentItemId;

  return (
    <div className={`json-object ${isItemInArray ? 'json-object-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${config.indentPx}px` }}>
      <div className="json-bracket">{'{'}</div>
      <div className="json-object-items">
        {orderedItems.map((item, itemIndex) => {
          if (item.type === 'key') {
            const key = item.key;
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
                data={{
                  container: data,
                  itemKey: key,
                  pathRef: activePathPrefixRef,
                  parentItemId: childParentItemId,
                  itemPathPrevious: getObjectItemPath(itemPreviousKey),
                  itemPathNext: getObjectItemPath(itemNextKey),
                  isLastItem,
                }}
              />
            );
          }

          const { key, pseudoData } = item;
          const pseudoPath = activePathPrefix ? `${activePathPrefix}.${key}` : key;
          return (
            <div key={key} className="json-object-item">
              <PseudoKeyValueComp
                data={{
                  container: data,
                  itemKey: key,
                  path: pseudoPath,
                  pseudoData,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="json-bracket">{'}'}</div>
    </div>
  );
});

JsonCompMobxTree.displayName = 'JsonCompMobxTree';

const areJsonCompMobxTreePropsEqual = (prev, next) => (
  prev.data === next.data
  && prev.config === next.config
  && prev.parentItemId === next.parentItemId
  && prev.pathRef === next.pathRef
  && prev.isItemInArray === next.isItemInArray
  && prev.renderNestedJson === next.renderNestedJson
);

const JsonCompMobxTreeMemo = React.memo(JsonCompMobxTree, areJsonCompMobxTreePropsEqual);

const JsonCompMobx = ({
  data: dataRaw,
  config: configProp = {},
  onEvent,
  store: storeProp,
}) => {
  const parentContext = useJsonContextOptional();
  const isRoot = !parentContext;
  const config = useJsonCompConfig(configProp, parentContext?.config);
  const location = config.location || {};
  const {
    pathRef: pathRefProp,
    parentItemId = JSON_ROOT_SELECTION_ITEM_ID,
    isItemInArray = false,
  } = location;
  const localPathPrefixRef = usePathRef('');
  const activePathPrefixRef = pathRefProp || localPathPrefixRef;

  const localStore = useMemo(
    () => createJsonCompMobxStore({ compId: config.compId }),
    [config.compId]
  );
  const store = storeProp || parentContext?.store || localStore;

  React.useEffect(() => {
    if (!isRoot) return;
    if (!config.isDragMoveEnabled) {
      store.clearDragState();
    }
  }, [config.isDragMoveEnabled, isRoot, store]);

  React.useEffect(() => {
    if (!isRoot) return;
    store.selection.registerItem({
      itemId: JSON_ROOT_SELECTION_ITEM_ID,
      itemParentId: null,
      path: '',
      itemKind: 'root',
      label: 'root',
    });
  }, [isRoot, store]);

  const data = useMemo(() => {
    if (!isRoot || dataRaw === null || typeof dataRaw !== 'object' || isObservable(dataRaw)) {
      return dataRaw;
    }
    return observable(dataRaw);
  }, [dataRaw, isRoot]);

  const renderNestedJsonRef = useRef(null);
  renderNestedJsonRef.current = (nestedData, nestedLocation) => (
    <JsonCompMobxTreeMemo
      data={nestedData}
      config={config}
      parentItemId={nestedLocation.parentItemId ?? JSON_ROOT_SELECTION_ITEM_ID}
      pathRef={nestedLocation.pathRef}
      isItemInArray={nestedLocation.isItemInArray === true}
      renderNestedJson={renderNestedJsonRef.current}
    />
  );
  const renderNestedJson = useCallback((nestedData, nestedLocation) => (
    renderNestedJsonRef.current(nestedData, nestedLocation)
  ), []);

  if (isRoot) {
    return (
      <JsonCompMobxRoot
        config={config}
        store={store}
        onEvent={onEvent}
        data={data}
        renderNestedJson={renderNestedJson}
      >
        <JsonCompMobxTreeMemo
          data={data}
          config={config}
          parentItemId={JSON_ROOT_SELECTION_ITEM_ID}
          pathRef={activePathPrefixRef}
          isItemInArray={false}
          renderNestedJson={renderNestedJson}
        />
      </JsonCompMobxRoot>
    );
  }

  return (
    <JsonCompMobxTreeMemo
      data={data}
      config={config}
      parentItemId={parentItemId}
      pathRef={activePathPrefixRef}
      isItemInArray={isItemInArray}
      renderNestedJson={parentContext.renderNestedJson}
    />
  );
};

const JsonCompMobxRootSelection = observer(({ store, children }) => {
  const rootSelectionState = store.selection.getItemSelectionState(JSON_ROOT_SELECTION_ITEM_ID);

  const handleRootSelectionMouseDownCapture = (event) => {
    if (event.target.closest('.json-selection-item')) return;
    if (!event.shiftKey && (event.button === 0 || event.button === 2)) {
      store.selection.clearSelection();
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
    if (store.selection.consumeNextSelectionClickSuppressed()) return;
    store.selection.selectNextFromItem(JSON_ROOT_SELECTION_ITEM_ID);
  };

  const rootSelectionClassName = [
    'json-root-selection-item',
    rootSelectionState.isSelected ? 'is-json-selected' : '',
    rootSelectionState.isSelectionAncestor ? 'is-json-selection-ancestor' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rootSelectionClassName}
      onMouseDownCapture={handleRootSelectionMouseDownCapture}
      onClickCapture={handleRootSelectionClickCapture}
    >
      {children}
    </div>
  );
});

JsonCompMobxRootSelection.displayName = 'JsonCompMobxRootSelection';

const JsonCompMobxRootMenu = observer(({
  store,
  onEvent,
  data,
}) => {
  const menuOpen = store.menuOpen;

  const handleMenuItemClick = useCallback(async (item) => {
    await handleMenuItemClickImpl({
      item,
      menuOpen,
      data,
      emitEvent: (path, changeData) => emitJsonCompEvent(onEvent, path, changeData),
      closeMenu: () => store.closeMenu(),
    });
    store.selection.clearSelection();
  }, [data, menuOpen, onEvent, store]);

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
    store.closeMenu();
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
  }, [getElementUnderMenu, store]);

  if (!menuOpen) {
    return null;
  }

  return (
    <MenuComp
      data={{
        items: getMenuItems(menuOpen),
      }}
      config={{
        isOpen: true,
        posOpen: menuOpen.position,
      }}
      onEvent={(eventType, eventData) => {
        if (eventType === 'closeRequest') {
          store.closeMenu();
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
  );
});

JsonCompMobxRootMenu.displayName = 'JsonCompMobxRootMenu';

const JsonCompMobxRoot = ({
  config,
  store,
  onEvent,
  data,
  renderNestedJson,
  children,
}) => (
  <JsonContextProvider
    config={config}
    store={store}
    onEvent={onEvent}
    rootData={data}
    renderNestedJson={renderNestedJson}
  >
    <JsonCompMobxRootSelection store={store}>
      {children}
    </JsonCompMobxRootSelection>
    <JsonCompMobxRootMenu store={store} onEvent={onEvent} data={data} />
  </JsonContextProvider>
);

JsonCompMobx.displayName = 'JsonCompMobx';

export default JsonCompMobx;
