
import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DeleteIcon, DragIcon, MinusIcon, PlusIcon } from '../../icon/Icon.jsx';
import KeyValues from '../../component/key-value/KeyValues.jsx';
import PropEditorValueBool from './PropEditorValueBool.jsx';
import PropEditorValueColor from './PropEditorValueColor.jsx';
import PropEditorValueCustom from './PropEditorValueCustom.jsx';
import PropEditorValueEnum from './PropEditorValueEnum.jsx';
import PropEditorValueNum from './PropEditorValueNum.jsx';
import PropEditorValueText from './PropEditorValueText.jsx';
import './PropEditor.css';

const valueTypeList = ['text', 'number', 'bool', 'color', 'enum', 'custom'];

function propertyPathBuild(parentPath, id) {
  return parentPath ? `${parentPath}.${id}` : id;
}

function nodeFindById(nodes, id) {
  return (nodes ?? []).find((node) => node.id === id) ?? null;
}

function propertyRowsBuild(nodes, parentPath = '', propertyById = {}, requestStateByPath = {}, valueConfigByType = {}) {
  return (nodes ?? [])
    .filter((node) => node.type === 'property')
    .map((node) => {
      const propertyId = node.propertyId ?? node.id;
      const propertyMeta = propertyById[propertyId] ?? {};
      const propertyPath = propertyMeta.id ?? propertyId;
      const requestState = requestStateByPath[propertyPath] ?? null;
      const valueType = propertyMeta.valueType ?? propertyMeta.type ?? node.valueType ?? 'text';
      return {
        id: propertyPathBuild(parentPath, node.id),
        keyCompName: 'key',
        key: node.label ?? propertyMeta.label ?? propertyId,
        value: requestState?.status === 'pending' ? requestState.valueNext : propertyMeta.value,
        valueCompName: valueTypeList.includes(valueType) ? valueType : 'text',
        propertyId,
        propertyPath,
        valueType,
        displayType: node.displayType ?? propertyMeta.displayType,
        optionList: propertyMeta.optionList ?? node.optionList ?? [],
        meta: propertyMeta,
        valueConfig: { ...(valueConfigByType[valueType] ?? {}), ...(propertyMeta.valueConfig ?? {}) },
        valueCustomCompName: propertyMeta.valueCompName ?? node.valueCompName,
        uiState: propertyMeta.uiState ?? {},
        requestState,
        isReadOnly: propertyMeta.isReadOnly === true,
        isDisabled: propertyMeta.isDisabled === true,
      };
    });
}

const PropEditorKey = observer(function PropEditorKey({ data }) {
  const valueText = String(data ?? '');
  return <span className="prop-editor-key-text" title={valueText}>{valueText}</span>;
});

const compByName = {
  key: PropEditorKey,
  text: PropEditorValueText,
  number: PropEditorValueNum,
  bool: PropEditorValueBool,
  color: PropEditorValueColor,
  custom: PropEditorValueCustom,
  enum: PropEditorValueEnum,
};

const actionIconByName = {
  delete: DeleteIcon,
};

function directLeadingControlListBuild(node, isDragEnabled) {
  if (Array.isArray(node.leadingControlList)) return node.leadingControlList;

  const controlList = [];
  if (isDragEnabled) {
    controlList.push({ id: 'drag', type: 'drag' });
  }
  if (node.checkboxData) {
    controlList.push({ id: 'checkbox', type: 'checkbox', data: node.checkboxData });
  }
  if (Array.isArray(node.actionList)) {
    node.actionList.forEach((actionData) => {
      controlList.push({ ...actionData, type: 'action' });
    });
  }
  return controlList;
}

function nodeHasDirectLeadingControls(node) {
  return (node.leadingControlList?.length ?? 0) > 0
    || node.checkboxData
    || (node.actionList?.length ?? 0) > 0;
}

const CustomItem = observer(function CustomItem({ node, parentPath, config, onEvent }) {
  const ItemComp = node.compName && typeof config.getComp === 'function'
    ? config.getComp(node.compName, { node, area: 'item' })
    : null;
  if (!ItemComp) return null;
  const itemPath = propertyPathBuild(parentPath, node.id);
  return (
    <div className={`prop-editor-custom-item ${node.className ?? ''}`.trim()}>
      <ItemComp
        data={node.data ?? {}}
        config={{ ...(node.config ?? {}), isReadOnly: config.isReadOnly === true }}
        node={node}
        onEvent={(eventType, eventData = {}) => onEvent?.('customItemEvent', {
          itemId: node.id,
          itemPath,
          eventType,
          eventData,
        })}
      />
    </div>
  );
});

const CustomArea = observer(function CustomArea({ node, area, config, onEvent }) {
  const Comp = node?.compName && typeof config.getComp === 'function'
    ? config.getComp(node.compName, { node, area })
    : null;
  if (!Comp) return null;
  return (
    <div className={`prop-editor-custom-area is-${area} ${node.className ?? ''}`.trim()}>
      <Comp
        data={node.data ?? {}}
        config={{ ...(node.config ?? {}), isReadOnly: config.isReadOnly === true }}
        node={node}
        onEvent={(eventType, eventData = {}) => onEvent?.('customAreaEvent', {
          area,
          nodeId: node.id ?? '',
          eventType,
          eventData,
        })}
      />
    </div>
  );
});

const KeyValuesForNodes = observer(function KeyValuesForNodes({ nodes, parentPath, onEvent, config, propertyById }) {
  const rows = propertyRowsBuild(nodes, parentPath, propertyById, config.requestStateByPath, config.valueConfigByType);
  const isEditorLocked = rows.some((row) => row.requestState?.status === 'pending');
  const rowsEffective = rows.map((row) => ({
    ...row,
    alignItems: 'center',
    isEditorLocked,
    isReadOnly: config.isReadOnly === true || row.isReadOnly === true || row.isDisabled === true,
    isDisabled: row.isDisabled === true,
    valueComp: row.valueCustomCompName && typeof config.getComp === 'function'
      ? config.getComp(row.valueCustomCompName, { propertyMeta: row.meta, area: 'value' })
      : null,
    onCustomValueEvent: (eventType, eventData = {}) => onEvent?.('propertyCustomValueEvent', {
      propertyId: row.propertyId,
      propertyPath: row.propertyPath,
      eventType,
      eventData,
    }),
    onValueChangeAttempt: (valueNext) => onEvent?.('propertyChangeAttempt', {
      propertyId: row.propertyId,
      propertyPath: row.propertyPath,
      valueNext,
    }),
    valueCellContentAlign: config.valueCellContentAlign ?? 'left',
    onRequestDismiss: config.onRequestDismiss,
    onUiStateChange: (uiStateNext) => onEvent?.('propertyUiStateChange', { propertyId: row.propertyId, propertyPath: row.propertyPath, uiStateNext }),
  }));
  const isValueEditable = config.isReadOnly !== true && config.isEditable !== false && !isEditorLocked;
  return (
    <KeyValues
      data={{ rows: rowsEffective }}
      config={{
        isEditable: isValueEditable,
        isKeyEditable: false,
        isValueEditable,
        alignCol: true,
        keyColWidth: config.keyColWidth ?? 'min',
        keyCellContentAlign: config.keyCellContentAlign ?? 'right',
        valueCellContentAlign: config.valueCellContentAlign ?? 'left',
        isDividerDraggable: config.isDividerDraggable === true,
        compResolveFn: (name) => compByName[name] ?? null,
      }}
      onEvent={(eventType, eventData) => {
        if (eventType !== 'cellUpdate' || eventData.field !== 'value') return;
        const row = rows[eventData.rowIndex];
        if (!row) return;
        return onEvent?.('propertyChangeAttempt', {
          propertyId: row.propertyId,
          propertyPath: row.propertyPath,
          valueNext: eventData.nextValue,
        });
      }}
    />
  );
});

function dragIndexFromEvent(event) {
  const itemElement = event.currentTarget;
  const rect = itemElement.getBoundingClientRect();
  const index = Number(itemElement.dataset.index) || 0;
  return event.clientY < rect.top + rect.height / 2 ? index : index + 1;
}

function dragIndexFromContainerEl(containerEl, event, itemCount) {
  const itemElements = Array.from(containerEl.querySelectorAll(':scope > .prop-editor-direct-drag-item'));
  if (!itemElements.length) return 0;
  const firstRect = itemElements[0].getBoundingClientRect();
  if (event.clientY <= firstRect.top + firstRect.height / 2) return 0;
  const lastRect = itemElements[itemElements.length - 1].getBoundingClientRect();
  if (event.clientY >= lastRect.top + lastRect.height / 2) return itemCount;
  const itemMatched = itemElements.find((itemElement) => {
    const rect = itemElement.getBoundingClientRect();
    return event.clientY >= rect.top && event.clientY <= rect.bottom;
  });
  if (itemMatched) {
    const rect = itemMatched.getBoundingClientRect();
    const index = Number(itemMatched.dataset.index) || 0;
    return event.clientY < rect.top + rect.height / 2 ? index : index + 1;
  }
  const itemNext = itemElements.find((itemElement) => event.clientY < itemElement.getBoundingClientRect().top);
  return itemNext ? Number(itemNext.dataset.index) || 0 : itemCount;
}

const DirectLeadingControls = observer(function DirectLeadingControls({
  controlList,
  isReadOnly,
  groupPath,
  node,
  index,
  config,
  onEvent,
  onDragHandlePointerDown,
  onDragHandlePointerUp,
}) {
  const nodeId = node.id;
  const customEventForward = (control, eventType, eventData = {}) => onEvent?.('propertyDirectLeadingControlEvent', {
    groupPath,
    itemId: nodeId,
    index,
    controlId: control.id,
    controlType: control.type,
    eventType,
    eventData,
  });
  return (
    <div className={`prop-editor-direct-drag-controls prop-editor-direct-leading-controls ${controlList.length ? 'has-controls' : ''}`.trim()}>
      {controlList.map((control) => {
        if (control.type === 'drag') {
          return (
            <button
              key={control.id}
              type="button"
              className="prop-editor-direct-drag-handle"
              disabled={isReadOnly === true || control.isDisabled === true}
              title={control.title ?? 'Drag item'}
              onPointerDown={(event) => {
                if (isReadOnly === true || control.isDisabled === true || event.button !== 0) return;
                onDragHandlePointerDown?.();
              }}
              onPointerUp={() => onDragHandlePointerUp?.()}
              onPointerCancel={() => onDragHandlePointerUp?.()}
              aria-label={control.ariaLabel ?? control.title ?? 'Drag item'}
            >
              <DragIcon size={13} />
            </button>
          );
        }

        if (control.type === 'checkbox') {
          const checkboxData = control.data ?? control;
          return (
            <label
              key={control.id}
              className={`prop-editor-direct-item-checkbox${checkboxData.isEffectDisabled ? ' is-effect-disabled' : ''}`}
              title={checkboxData.title ?? ''}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={checkboxData.isChecked === true}
                disabled={isReadOnly === true || checkboxData.isDisabled === true}
                aria-label={checkboxData.ariaLabel ?? checkboxData.title ?? `Check ${nodeId}`}
                onChange={(event) => onEvent?.('propertyDirectItemCheckChange', {
                  groupPath,
                  itemId: nodeId,
                  index,
                  controlId: control.id,
                  isChecked: event.target.checked,
                })}
              />
            </label>
          );
        }

        if (control.type === 'custom') {
          const CustomComp = control.compName && typeof config.getComp === 'function'
            ? config.getComp(control.compName, { node, control, area: 'leadingControl' })
            : null;
          if (!CustomComp) return null;
          return (
            <span key={control.id} className={`prop-editor-direct-leading-custom ${control.className ?? ''}`.trim()}>
              <CustomComp
                data={control.data ?? {}}
                config={{ ...(control.config ?? {}), isReadOnly: isReadOnly === true }}
                node={node}
                control={control}
                onEvent={(eventType, eventData = {}) => customEventForward(control, eventType, eventData)}
              />
            </span>
          );
        }

        const IconComp = actionIconByName[control.iconName] ?? (
          control.iconCompName && typeof config.getComp === 'function'
            ? config.getComp(control.iconCompName, { node, control, area: 'leadingIcon' })
            : null
        );
        return (
          <button
            key={control.id}
            type="button"
            className={`prop-editor-direct-item-action ${control.kind ? `is-${control.kind}` : ''}`.trim()}
            disabled={isReadOnly === true || control.isDisabled === true}
            title={control.title ?? control.label ?? control.id}
            aria-label={control.ariaLabel ?? control.title ?? control.label ?? control.id}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEvent?.('propertyDirectItemAction', {
                groupPath,
                itemId: nodeId,
                actionId: control.actionId ?? control.id,
                controlId: control.id,
                index,
              });
            }}
          >
            {IconComp ? <IconComp width={13} height={13} /> : <span>{control.label ?? control.id}</span>}
          </button>
        );
      })}
    </div>
  );
});

const DirectDragItem = observer(function DirectDragItem({ node, index, count, groupPath, config, isDragEnabled, onEvent, children, renderGroup }) {
  const isDragHandlePressedRef = useRef(false);
  const dragState = config.dragStateByGroupPath?.[groupPath] ?? null;
  const controlList = directLeadingControlListBuild(node, isDragEnabled);
  const isDragging = dragState?.isDragging && dragState.itemIdDragged === node.id;
  const isBeforeShown = dragState?.isDragging && dragState.indexDrop === index;
  const isAfterShown = dragState?.isDragging && index === count - 1 && dragState.indexDrop === count;
  const dragPreview = (event) => {
    if (!dragState?.isDragging) return;
    event.preventDefault();
    onEvent?.('propertyDirectDragPreview', { groupPath, indexDrop: dragIndexFromEvent(event) });
  };
  const controls = (
    <DirectLeadingControls
      controlList={controlList}
      isReadOnly={config.isReadOnly}
      groupPath={groupPath}
      node={node}
      index={index}
      config={config}
      onEvent={onEvent}
      onDragHandlePointerDown={() => { isDragHandlePressedRef.current = true; }}
      onDragHandlePointerUp={() => { isDragHandlePressedRef.current = false; }}
    />
  );
  const body = node.type === 'group'
    ? renderGroup?.(controls)
    : (
      <div className="prop-editor-direct-drag-property-row">
        {controls}
        <div className="prop-editor-direct-drag-content">{children}</div>
      </div>
    );
  return (
    <div
      className={`prop-editor-direct-drag-item ${controlList.length ? 'has-controls' : ''} ${isDragging ? 'is-dragging' : ''}`.trim()}
      data-index={index}
      draggable={isDragEnabled && !config.isReadOnly}
      onDragStart={(event) => {
        if (!isDragEnabled || config.isReadOnly === true || !isDragHandlePressedRef.current) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', node.id);
        onEvent?.('propertyDirectDragStart', { groupPath, itemId: node.id, indexFrom: index });
      }}
      onDragEnd={() => {
        isDragHandlePressedRef.current = false;
        onEvent?.('propertyDirectDragClear', { groupPath });
      }}
      onDragOver={isDragEnabled ? dragPreview : undefined}
      onDrop={(event) => {
        if (!dragState?.isDragging) return;
        event.preventDefault();
        event.stopPropagation();
        onEvent?.('propertyDirectDragDrop', { groupPath });
      }}
    >
      {isBeforeShown ? <div className="prop-editor-direct-drop-line" /> : null}
      {body}
      {isAfterShown ? <div className="prop-editor-direct-drop-line is-after" /> : null}
    </div>
  );
});

function NodeContent({ node, parentPath, config, onEvent, propertyById, headerLeading = null }) {
  if (node.type === 'group') {
    return <SectionGroup node={node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} headerLeading={headerLeading} />;
  }
  if (node.type === 'custom') {
    return <CustomItem node={node} parentPath={parentPath} config={config} onEvent={onEvent} />;
  }
  return <KeyValuesForNodes nodes={[node]} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />;
}

const SectionGroup = observer(function SectionGroup({ node, parentPath, config, onEvent, propertyById, headerLeading = null }) {
  const path = propertyPathBuild(parentPath, node.id);
  const isCollapsible = config.isGroupCollapsible !== false && node.isCollapsible !== false;
  const isCollapsed = Boolean(config.groupCollapsedByPath?.[path]);
  const IconCollapsed = isCollapsed ? PlusIcon : MinusIcon;
  const headerRightNode = node.headerRight ?? null;
  const toggleGroup = () => {
    if (isCollapsible) onEvent?.('groupToggle', { groupId: node.id, groupPath: path });
  };
  const body = !isCollapsed ? (
    <div className="prop-editor-group-body">
      <NodeList nodes={node.children ?? []} parentPath={path} config={config} onEvent={onEvent} propertyById={propertyById} isDirectDragEnabled={node.isChildrenDraggable === true} dragGroupPath={path} />
    </div>
  ) : null;

  if (headerLeading) {
    return (
      <section className="prop-editor-group has-drag-leading">
        <div className="prop-editor-group-leading">{headerLeading}</div>
        <button type="button" className={`prop-editor-group-caret ${isCollapsible ? '' : 'is-static'}`.trim()} disabled={!isCollapsible} onClick={toggleGroup} aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}>
          <IconCollapsed width={12} height={12} strokeWidth={2} />
        </button>
        <div className="prop-editor-group-title-column">
          <div className="prop-editor-group-header-row">
            <button type="button" className={`prop-editor-group-header ${isCollapsible ? '' : 'is-static'}`.trim()} disabled={!isCollapsible} onClick={toggleGroup}>
              <span className="prop-editor-group-title">{node.label}</span>
              <span className="prop-editor-group-divider" aria-hidden="true" />
            </button>
            <CustomArea node={headerRightNode} area="groupTopRight" config={config} onEvent={onEvent} />
          </div>
          {body}
        </div>
      </section>
    );
  }

  return (
    <section className="prop-editor-group">
      <div className="prop-editor-group-header-row">
        <button type="button" className={`prop-editor-group-header ${isCollapsible ? '' : 'is-static'}`.trim()} disabled={!isCollapsible} onClick={toggleGroup}>
          <span className={`prop-editor-group-caret ${isCollapsible ? '' : 'is-static'}`.trim()}><IconCollapsed width={12} height={12} strokeWidth={2} /></span>
          <span className="prop-editor-group-title">{node.label}</span>
          <span className="prop-editor-group-divider" aria-hidden="true" />
        </button>
        <CustomArea node={headerRightNode} area="groupTopRight" config={config} onEvent={onEvent} />
      </div>
      {body}
    </section>
  );
});

const NodeList = observer(function NodeList({ nodes, parentPath, config, onEvent, propertyById, isDirectDragEnabled = false, dragGroupPath = '' }) {
  const listElementRef = useRef(null);
  const isDirectControlsEnabled = isDirectDragEnabled || nodes.some(nodeHasDirectLeadingControls);
  const dragState = config.dragStateByGroupPath?.[dragGroupPath] ?? null;
  const isDirectDragActive = isDirectDragEnabled && dragState?.isDragging === true;
  const dragPreviewByEl = (event, containerEl) => {
    if (!dragState?.isDragging || !containerEl) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    onEvent?.('propertyDirectDragPreview', { groupPath: dragGroupPath, indexDrop: dragIndexFromContainerEl(containerEl, event, nodes.length) });
  };
  const dragDropByEl = (event, containerEl) => {
    if (!dragState?.isDragging || !containerEl) return;
    event.preventDefault();
    event.stopPropagation();
    onEvent?.('propertyDirectDragPreview', { groupPath: dragGroupPath, indexDrop: dragIndexFromContainerEl(containerEl, event, nodes.length) });
    onEvent?.('propertyDirectDragDrop', { groupPath: dragGroupPath });
  };

  useEffect(() => {
    if (!isDirectDragActive) return undefined;
    const dragPreviewWindow = (event) => dragPreviewByEl(event, listElementRef.current);
    const dragDropWindow = (event) => dragDropByEl(event, listElementRef.current);
    window.addEventListener('dragover', dragPreviewWindow, true);
    window.addEventListener('drop', dragDropWindow, true);
    return () => {
      window.removeEventListener('dragover', dragPreviewWindow, true);
      window.removeEventListener('drop', dragDropWindow, true);
    };
  }, [isDirectDragActive, dragGroupPath, nodes.length]);

  if (isDirectControlsEnabled) {
    const dragPreview = (event, containerEl = event.currentTarget) => {
      dragPreviewByEl(event, containerEl);
    };
    const dragDrop = (event, containerEl = event.currentTarget) => {
      dragDropByEl(event, containerEl);
    };
    return (
      <div
        ref={listElementRef}
        className={`prop-editor-node-list is-direct-controlled${isDirectDragEnabled ? ' is-direct-draggable' : ''}`}
        onDragOver={isDirectDragEnabled ? dragPreview : undefined}
        onDrop={isDirectDragEnabled ? dragDrop : undefined}
      >
        {nodes.map((node, index) => {
          const content = <NodeContent node={node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />;
          return (
            <DirectDragItem
              key={node.id}
              node={node}
              index={index}
              count={nodes.length}
              groupPath={dragGroupPath}
              config={config}
              isDragEnabled={isDirectDragEnabled}
              onEvent={onEvent}
              renderGroup={(headerLeading) => (
                <NodeContent node={node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} headerLeading={headerLeading} />
              )}
            >
              {content}
            </DirectDragItem>
          );
        })}
      </div>
    );
  }
  const nodeSegmentList = [];
  nodes.forEach((node) => {
    const segmentLast = nodeSegmentList[nodeSegmentList.length - 1];
    if (node.type === 'property' && segmentLast?.type === 'properties') {
      segmentLast.nodes.push(node);
      return;
    }
    nodeSegmentList.push(node.type === 'property'
      ? { id: `properties-${node.id}`, type: 'properties', nodes: [node] }
      : { id: node.id, type: 'node', node });
  });
  return (
    <div className="prop-editor-node-list">
      {nodeSegmentList.map((segment) => (
        segment.type === 'properties'
          ? <KeyValuesForNodes key={segment.id} nodes={segment.nodes} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />
          : <NodeContent key={segment.id} node={segment.node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />
      ))}
    </div>
  );
});

const TopTabContent = observer(function TopTabContent({ tabNode, parentPath, config, onEvent, propertyById }) {
  const path = propertyPathBuild(parentPath, tabNode.id);
  return <NodeList nodes={tabNode.children ?? []} parentPath={path} config={config} onEvent={onEvent} propertyById={propertyById} />;
});

function LeftTabContent({ node, config }) {
  const IconComp = node.iconCompName && typeof config.getComp === 'function' ? config.getComp(node.iconCompName, { node, area: 'levelLeft' }) : null;
  if (IconComp) {
    return <IconComp width={16} height={16} className="prop-editor-left-tab-icon" />;
  }
  return <span>{node.shortLabel ?? node.label.slice(0, 2)}</span>;
}

const PropEditor = observer(({ data = {}, config = {}, onEvent }) => {
  const [requestStateByPath, setRequestStateByPath] = useState({});
  const [groupCollapsedLocalByPath, setGroupCollapsedLocalByPath] = useState({});
  const leftList = data.levelLeftList ?? [];
  const propertyById = data.propertyById ?? {};
  const isLeftShown = config.isLevelLeftShown !== false && leftList.length > 0;
  const leftSelected = nodeFindById(leftList, data.levelLeftSelectedId) ?? leftList[0] ?? null;
  const topList = isLeftShown ? (leftSelected?.children ?? []) : (data.levelTopList ?? []);
  const isTopShown = config.isLevelTopShown !== false && topList.length > 0;
  const topSelected = nodeFindById(topList, data.levelTopSelectedId) ?? topList[0] ?? null;
  const panelNodes = isTopShown ? (topSelected?.children ?? []) : (leftSelected?.children ?? data.panelList ?? []);
  const parentPath = [isLeftShown ? leftSelected?.id : null, isTopShown ? topSelected?.id : null].filter(Boolean).join('.');
  const requestTimeoutMs = config.requestTimeoutMs ?? 3500;
  const isRequestStateControlled = data.requestStateByPath != null;
  const requestStateByPathEffective = isRequestStateControlled ? data.requestStateByPath : requestStateByPath;
  const dragStateByGroupPath = data.dragStateByGroupPath ?? {};
  const header = data.header ?? null;

  const requestDismiss = (propertyPath) => {
    if (isRequestStateControlled) {
      onEvent?.('propertyRequestDismiss', { propertyPath });
      return;
    }
    setRequestStateByPath((statePrev) => {
      const stateNext = { ...statePrev };
      delete stateNext[propertyPath];
      return stateNext;
    });
  };

  const editorEventHandle = async (eventType, eventData = {}) => {
    if (eventType === 'groupToggle') {
      if (!config.groupCollapsedByPath) {
        const groupPath = eventData.groupPath;
        if (groupPath) {
          setGroupCollapsedLocalByPath((statePrev) => ({
            ...statePrev,
            [groupPath]: !statePrev[groupPath],
          }));
        }
      }
      return onEvent?.(eventType, eventData);
    }
    if (eventType !== 'propertyChangeAttempt') return onEvent?.(eventType, eventData);
    const propertyPath = eventData.propertyPath;
    if (!propertyPath) return onEvent?.(eventType, eventData);
    if (requestStateByPathEffective[propertyPath]?.status === 'pending') return { code: -1, message: 'request already pending' };

    if (!isRequestStateControlled) {
      setRequestStateByPath((statePrev) => ({
        ...statePrev,
        [propertyPath]: { status: 'pending', valueNext: eventData.valueNext, message: '' },
      }));
    }

    const abortController = new AbortController();
    const timeoutMs = Number.isFinite(requestTimeoutMs) ? Math.max(500, Math.floor(requestTimeoutMs)) : 3500;
    let timeoutId = null;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = window.setTimeout(() => {
        abortController.abort();
        resolve({ code: -1, message: `request timeout (${timeoutMs}ms)` });
      }, timeoutMs);
    });

    const result = await Promise.race([
      Promise.resolve(onEvent?.(eventType, { ...eventData, requestContext: { timeoutMs, signal: abortController.signal, serverSimulation: config.serverSimulation } })),
      timeoutPromise,
    ]);
    if (timeoutId) window.clearTimeout(timeoutId);

    const resultNormalized = result ?? { code: 0, message: 'ok' };
    if (resultNormalized.code >= 0) {
      if (!isRequestStateControlled) requestDismiss(propertyPath);
      return resultNormalized;
    }

    if (!isRequestStateControlled) {
      setRequestStateByPath((statePrev) => ({
        ...statePrev,
        [propertyPath]: {
          status: 'error',
          message: String(resultNormalized.message ?? 'Update failed'),
        },
      }));
    }
    return resultNormalized;
  };

  const configEffective = {
    ...config,
    requestStateByPath: requestStateByPathEffective,
    groupCollapsedByPath: config.groupCollapsedByPath ?? groupCollapsedLocalByPath,
    dragStateByGroupPath,
    onRequestDismiss: requestDismiss,
  };

  return (
    <div className={`prop-editor-root ${isLeftShown ? 'has-left' : ''} ${config.isReadOnly === true ? 'is-read-only' : ''}`.trim()} style={{ width: config.width ?? 'min(320px, 100%)' }}>
      {isLeftShown ? (
        <div className="prop-editor-left-tabs">
          {leftList.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`prop-editor-left-tab ${node.id === leftSelected?.id ? 'is-selected' : ''}`}
              onClick={() => editorEventHandle('levelLeftSelect', { levelId: node.id })}
              title={node.label}
            >
              <LeftTabContent node={node} config={configEffective} />
            </button>
          ))}
        </div>
      ) : null}
      <div className="prop-editor-main">
        {header ? (
          <div className="prop-editor-main-header">
            <div className="prop-editor-main-heading">
              {header.label ? <div className="prop-editor-main-title">{header.label}</div> : null}
              {header.hint ? <div className="prop-editor-main-hint">{header.hint}</div> : null}
            </div>
            <CustomArea node={header.right ?? null} area="topRight" config={configEffective} onEvent={editorEventHandle} />
          </div>
        ) : null}
        {isTopShown ? (
          <div className="prop-editor-top-tabs-wrap">
            <div className="prop-editor-top-tabs">
              {topList.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={`prop-editor-top-tab ${node.id === topSelected?.id ? 'is-selected' : ''}`}
                  onClick={() => editorEventHandle('levelTopSelect', { levelId: node.id })}
                >
                  {node.label}
                </button>
              ))}
            </div>
            <div className="prop-editor-top-panel">
              {topSelected ? <TopTabContent tabNode={topSelected} parentPath={isLeftShown ? leftSelected?.id ?? '' : ''} config={configEffective} onEvent={editorEventHandle} propertyById={propertyById} /> : null}
            </div>
          </div>
        ) : (
          <NodeList nodes={panelNodes} parentPath={parentPath} config={configEffective} onEvent={editorEventHandle} propertyById={propertyById} />
        )}
      </div>
    </div>
  );
});

export default PropEditor;