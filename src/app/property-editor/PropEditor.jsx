
import { cloneElement, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DeleteIcon, DragIcon, MinusIcon, PlusIcon } from '../../icon/Icon.jsx';
import KeyValues from '../../component/key-value/KeyValues.jsx';
import PropEditorValueBool from './PropEditorValueBool.jsx';
import PropEditorValueColor from './PropEditorValueColor.jsx';
import PropEditorValueEnum from './PropEditorValueEnum.jsx';
import PropEditorValueNum from './PropEditorValueNum.jsx';
import PropEditorValueText from './PropEditorValueText.jsx';
import './PropEditor.css';

const valueTypeList = ['text', 'number', 'bool', 'color', 'enum'];

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
  enum: PropEditorValueEnum,
};

const actionIconByName = {
  delete: DeleteIcon,
};

const KeyValuesForNodes = observer(function KeyValuesForNodes({ nodes, parentPath, onEvent, config, propertyById }) {
  const rows = propertyRowsBuild(nodes, parentPath, propertyById, config.requestStateByPath, config.valueConfigByType);
  const isEditorLocked = rows.some((row) => row.requestState?.status === 'pending');
  const rowsEffective = rows.map((row) => ({
    ...row,
    alignItems: 'center',
    isEditorLocked,
    isReadOnly: config.isReadOnly === true || row.isReadOnly === true || row.isDisabled === true,
    isDisabled: row.isDisabled === true,
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
        isDividerDraggable: config.isDividerDraggable === true,
        compResolveFn: (name) => compByName[name] ?? null,
      }}
      onEvent={(eventType, eventData) => {
        if (eventType !== 'cellUpdate' || eventData.field !== 'value') return;
        const row = rows[eventData.rowIndex];
        if (!row) return;
        onEvent?.('propertyChangeAttempt', {
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

function dragIndexFromContainerEvent(event, itemCount) {
  const containerElement = event.currentTarget;
  const itemElements = Array.from(containerElement.querySelectorAll(':scope > .prop-editor-direct-drag-item'));
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

const DirectDragControls = observer(function DirectDragControls({
  actionList,
  isReadOnly,
  groupPath,
  nodeId,
  index,
  onEvent,
  onDragHandlePointerDown,
  onDragHandlePointerUp,
}) {
  return (
    <div className={`prop-editor-direct-drag-controls ${actionList.length ? 'has-actions' : ''}`.trim()}>
      <button
        type="button"
        className="prop-editor-direct-drag-handle"
        disabled={isReadOnly === true}
        onPointerDown={(event) => {
          if (isReadOnly === true || event.button !== 0) return;
          onDragHandlePointerDown?.();
        }}
        onPointerUp={() => onDragHandlePointerUp?.()}
        onPointerCancel={() => onDragHandlePointerUp?.()}
        aria-label="Drag item"
      >
        <DragIcon size={13} />
      </button>
      {actionList.length ? (
        <div className="prop-editor-direct-item-actions">
          {actionList.map((actionData) => {
            const IconComp = actionIconByName[actionData.iconName] ?? null;
            return (
              <button
                key={actionData.id}
                type="button"
                className={`prop-editor-direct-item-action ${actionData.kind ? `is-${actionData.kind}` : ''}`.trim()}
                disabled={isReadOnly === true || actionData.isDisabled === true}
                title={actionData.title ?? actionData.label ?? actionData.id}
                aria-label={actionData.ariaLabel ?? actionData.title ?? actionData.label ?? actionData.id}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEvent?.('propertyDirectItemAction', { groupPath, itemId: nodeId, actionId: actionData.id, index });
                }}
              >
                {IconComp ? <IconComp width={13} height={13} /> : <span>{actionData.label ?? actionData.id}</span>}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});

const DirectDragItem = observer(function DirectDragItem({ node, index, count, groupPath, config, onEvent, children }) {
  const isDragHandlePressedRef = useRef(false);
  const dragState = config.dragStateByGroupPath?.[groupPath] ?? null;
  const actionList = Array.isArray(node.actionList) ? node.actionList : [];
  const isDragging = dragState?.isDragging && dragState.itemIdDragged === node.id;
  const isBeforeShown = dragState?.isDragging && dragState.indexDrop === index;
  const isAfterShown = dragState?.isDragging && index === count - 1 && dragState.indexDrop === count;
  const dragPreview = (event) => {
    if (!dragState?.isDragging) return;
    event.preventDefault();
    onEvent?.('propertyDirectDragPreview', { groupPath, indexDrop: dragIndexFromEvent(event) });
  };
  const controls = (
    <DirectDragControls
      actionList={actionList}
      isReadOnly={config.isReadOnly}
      groupPath={groupPath}
      nodeId={node.id}
      index={index}
      onEvent={onEvent}
      onDragHandlePointerDown={() => { isDragHandlePressedRef.current = true; }}
      onDragHandlePointerUp={() => { isDragHandlePressedRef.current = false; }}
    />
  );
  const body = node.type === 'group'
    ? cloneElement(children, { headerLeading: controls })
    : (
      <div className="prop-editor-direct-drag-property-row">
        {controls}
        <div className="prop-editor-direct-drag-content">{children}</div>
      </div>
    );
  return (
    <div
      className={`prop-editor-direct-drag-item ${actionList.length ? 'has-actions' : ''} ${isDragging ? 'is-dragging' : ''}`.trim()}
      data-index={index}
      draggable={!config.isReadOnly}
      onDragStart={(event) => {
        if (config.isReadOnly === true || !isDragHandlePressedRef.current) {
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
      onDragOver={dragPreview}
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

const SectionGroup = observer(function SectionGroup({ node, parentPath, config, onEvent, propertyById, headerLeading = null }) {
  const path = propertyPathBuild(parentPath, node.id);
  const isCollapsible = config.isGroupCollapsible !== false && node.isCollapsible !== false;
  const isCollapsed = Boolean(config.groupCollapsedByPath?.[path]);
  const IconCollapsed = isCollapsed ? PlusIcon : MinusIcon;
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
          <button type="button" className={`prop-editor-group-header ${isCollapsible ? '' : 'is-static'}`.trim()} disabled={!isCollapsible} onClick={toggleGroup}>
            <span className="prop-editor-group-title">{node.label}</span>
            <span className="prop-editor-group-divider" aria-hidden="true" />
          </button>
          {body}
        </div>
      </section>
    );
  }

  return (
    <section className="prop-editor-group">
      <button type="button" className={`prop-editor-group-header ${isCollapsible ? '' : 'is-static'}`.trim()} disabled={!isCollapsible} onClick={toggleGroup}>
        <span className={`prop-editor-group-caret ${isCollapsible ? '' : 'is-static'}`.trim()}><IconCollapsed width={12} height={12} strokeWidth={2} /></span>
        <span className="prop-editor-group-title">{node.label}</span>
        <span className="prop-editor-group-divider" aria-hidden="true" />
      </button>
      {body}
    </section>
  );
});

const NodeList = observer(function NodeList({ nodes, parentPath, config, onEvent, propertyById, isDirectDragEnabled = false, dragGroupPath = '' }) {
  if (isDirectDragEnabled) {
    const dragState = config.dragStateByGroupPath?.[dragGroupPath] ?? null;
    const dragPreview = (event) => {
      if (!dragState?.isDragging) return;
      event.preventDefault();
      onEvent?.('propertyDirectDragPreview', { groupPath: dragGroupPath, indexDrop: dragIndexFromContainerEvent(event, nodes.length) });
    };
    return (
      <div
        className="prop-editor-node-list is-direct-draggable"
        onDragOver={dragPreview}
        onDrop={(event) => {
          if (!dragState?.isDragging) return;
          event.preventDefault();
          onEvent?.('propertyDirectDragPreview', { groupPath: dragGroupPath, indexDrop: dragIndexFromContainerEvent(event, nodes.length) });
          onEvent?.('propertyDirectDragDrop', { groupPath: dragGroupPath });
        }}
      >
        {nodes.map((node, index) => {
          const content = node.type === 'group'
            ? <SectionGroup node={node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />
            : <KeyValuesForNodes nodes={[node]} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />;
          return (
            <DirectDragItem key={node.id} node={node} index={index} count={nodes.length} groupPath={dragGroupPath} config={config} onEvent={onEvent}>
              {content}
            </DirectDragItem>
          );
        })}
      </div>
    );
  }
  const propertyNodes = nodes.filter((node) => node.type === 'property');
  const groupNodes = nodes.filter((node) => node.type === 'group');
  return (
    <div className="prop-editor-node-list">
      {propertyNodes.length ? <KeyValuesForNodes nodes={propertyNodes} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} /> : null}
      {groupNodes.map((node) => <SectionGroup key={node.id} node={node} parentPath={parentPath} config={config} onEvent={onEvent} propertyById={propertyById} />)}
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
  const dragStateByGroupPath = data.dragStateByGroupPath ?? {};

  const requestDismiss = (propertyPath) => {
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
    if (requestStateByPath[propertyPath]?.status === 'pending') return { code: -1, message: 'request already pending' };

    setRequestStateByPath((statePrev) => ({
      ...statePrev,
      [propertyPath]: { status: 'pending', valueNext: eventData.valueNext, message: '' },
    }));

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
    if (resultNormalized.code === 0) {
      requestDismiss(propertyPath);
      return resultNormalized;
    }

    setRequestStateByPath((statePrev) => ({
      ...statePrev,
      [propertyPath]: {
        status: 'error',
        message: String(resultNormalized.message ?? 'Update failed'),
      },
    }));
    return resultNormalized;
  };

  const configEffective = {
    ...config,
    requestStateByPath,
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