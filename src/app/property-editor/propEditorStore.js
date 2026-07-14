import { makeAutoObservable } from 'mobx';

function nodeClone(node) {
  return {
    ...node,
    children: node.children ? node.children.map(nodeClone) : undefined,
  };
}

function nodesClone(nodes = []) {
  return nodes.map(nodeClone);
}

function propertyByIdClone(propertyById = {}) {
  return Object.fromEntries(Object.entries(propertyById).map(([id, item]) => [id, {
    ...item,
    optionList: item.optionList ? item.optionList.map((option) => ({ ...option })) : undefined,
    uiState: item.uiState ? { ...item.uiState } : undefined,
  }]));
}

function nodeListByPathGet(data, groupPathRaw) {
  const partList = String(groupPathRaw || '').split('.').filter(Boolean);
  let nodeList = data.panelList ?? data.levelTopList ?? [];
  for (const part of partList) {
    const node = nodeList.find((item) => item.id === part);
    if (!node) return null;
    nodeList = node.children ?? [];
  }
  return nodeList;
}

function nodeMoveById(nodeList, itemId, indexDropRaw) {
  const indexFrom = nodeList.findIndex((node) => node.id === itemId);
  if (indexFrom < 0) return false;
  const indexDrop = Math.max(0, Math.min(nodeList.length, Number(indexDropRaw) || 0));
  let indexTo = indexDrop;
  if (indexDrop > indexFrom) indexTo -= 1;
  if (indexTo === indexFrom) return false;
  const [nodeMoved] = nodeList.splice(indexFrom, 1);
  nodeList.splice(indexTo, 0, nodeMoved);
  return true;
}

function nodeRemoveById(nodeList, itemId) {
  const index = nodeList.findIndex((node) => node.id === itemId);
  if (index < 0) return false;
  nodeList.splice(index, 1);
  return true;
}

function propertyRemoveByNode(node, propertyById) {
  if (!node) return;
  if (node.type === 'property') {
    delete propertyById[node.id];
    return;
  }
  for (const child of node.children ?? []) {
    propertyRemoveByNode(child, propertyById);
  }
}

function editorDataClone(data = {}) {
  return {
    ...data,
    levelLeftList: data.levelLeftList ? nodesClone(data.levelLeftList) : undefined,
    levelTopList: data.levelTopList ? nodesClone(data.levelTopList) : undefined,
    panelList: data.panelList ? nodesClone(data.panelList) : undefined,
    dragStateByGroupPath: data.dragStateByGroupPath ? { ...data.dragStateByGroupPath } : undefined,
    propertyById: propertyByIdClone(data.propertyById),
  };
}

function serverSimulationNormalize(config = {}) {
  return {
    delayMinMs: Number(config.delayMinMs ?? 120),
    delayMaxMs: Number(config.delayMaxMs ?? 360),
    errorRate: Number(config.errorRate ?? 0.08),
    timeoutRate: Number(config.timeoutRate ?? 0.03),
  };
}

function randomDelayMs(config = {}) {
  const normalized = serverSimulationNormalize(config);
  const min = Math.max(0, Math.min(normalized.delayMinMs, normalized.delayMaxMs));
  const max = Math.max(min, Math.max(normalized.delayMinMs, normalized.delayMaxMs));
  return min + Math.floor(Math.random() * (max - min + 1));
}

function waitWithSignal(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, ms);
    if (!signal) return;
    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('request aborted'));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function fakeServerUpdate(requestContext = {}) {
  const simulation = serverSimulationNormalize(requestContext.serverSimulation);
  const delayMs = randomDelayMs(simulation);
  const randomValue = Math.random();
  try {
    if (randomValue < simulation.timeoutRate) {
      await waitWithSignal((requestContext.timeoutMs ?? 3500) + 900, requestContext.signal);
      return { code: 0, message: 'late success' };
    }
    await waitWithSignal(delayMs, requestContext.signal);
  } catch (error) {
    return { code: -1, message: `request timeout or aborted after waiting for simulated server response: ${error.message}` };
  }
  if (randomValue < simulation.timeoutRate + simulation.errorRate) {
    return {
      code: -1,
      message: 'simulated server failure: value rejected by validation rule on remote service, hover row and use dismiss to clear this message',
    };
  }
  return { code: 0, message: `server ok (${delayMs}ms)` };
}

const regionOptions = [
  { id: 'tohoku', label: 'Tohoku' },
  { id: 'kanto', label: 'Kanto' },
  { id: 'kansai', label: 'Kansai' },
  { id: 'kyushu', label: 'Kyushu' },
];

const axisOptions = [
  { id: 'axis-1', label: '1. Preparation' },
  { id: 'axis-2', label: '2. Trust' },
  { id: 'axis-3', label: '3. Role Needs' },
  { id: 'axis-4', label: '4. Business Logistics' },
  { id: 'axis-5', label: '5. Trigger Validation' },
  { id: 'axis-6', label: '6. Next Action' },
];

const editorDataFull = {
  levelLeftSelectedId: 'material',
  levelTopSelectedId: 'basic',
  levelLeftList: [
    {
      id: 'material',
      label: 'Material',
      shortLabel: 'Mt',
      iconCompName: 'folder',
      children: [
        {
          id: 'basic',
          label: 'Basic',
          children: [
            {
              id: 'identity',
              label: 'Identity',
              type: 'group',
              children: [
                { id: 'material.basic.identity.label', type: 'property', label: 'Extremely Long Key String For Left Edge Clipping Preview' },
                { id: 'material.basic.identity.visible', type: 'property' },
              ],
            },
            {
              id: 'appearance',
              label: 'Appearance',
              type: 'group',
              children: [
                { id: 'material.basic.appearance.color', type: 'property' },
                { id: 'material.basic.appearance.opacity', type: 'property' },
                { id: 'material.basic.appearance.weight', type: 'property' },
              ],
            },
          ],
        },
        {
          id: 'binding',
          label: 'Binding',
          children: [
            {
              id: 'resource',
              label: 'Resource',
              type: 'group',
              children: [
                { id: 'material.binding.resource.groupId', type: 'property' },
                { id: 'material.binding.resource.prefectureId', type: 'property' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'object',
      label: 'Object',
      shortLabel: 'Ob',
      iconCompName: 'file',
      children: [
        {
          id: 'basic',
          label: 'Basic',
          children: [
            {
              id: 'transform',
              label: 'Transform',
              type: 'group',
              children: [
                { id: 'object.basic.transform.row', type: 'property' },
                { id: 'object.basic.transform.col', type: 'property' },
              ],
            },
          ],
        },
      ],
    },
  ],
  propertyById: {
    'material.basic.identity.label': { id: 'material.basic.identity.label', label: 'Text', valueType: 'text', value: 'Kanto' },
    'material.basic.identity.visible': { id: 'material.basic.identity.visible', label: 'Visible', valueType: 'bool', value: true },
    'material.basic.appearance.color': { id: 'material.basic.appearance.color', label: 'Color', valueType: 'color', value: '#FF0000CC' },
    'material.basic.appearance.opacity': { id: 'material.basic.appearance.opacity', label: 'Opacity', valueType: 'number', displayType: 'slider', min: 0, max: 100, step: 1, value: 82 },
    'material.basic.appearance.weight': { id: 'material.basic.appearance.weight', label: 'Weight', valueType: 'number', min: 1, max: 12, step: 0.5, value: 4 },
    'material.binding.resource.groupId': { id: 'material.binding.resource.groupId', label: 'Group', valueType: 'enum', value: 'kanto', optionList: regionOptions },
    'material.binding.resource.prefectureId': { id: 'material.binding.resource.prefectureId', label: 'Prefecture', valueType: 'text', value: 'tokyo' },
    'object.basic.transform.row': { id: 'object.basic.transform.row', label: 'Row', valueType: 'number', min: 0, step: 1, value: 4 },
    'object.basic.transform.col': { id: 'object.basic.transform.col', label: 'Col', valueType: 'number', max: 20, step: 1, value: 8 },
  },
};

const editorDataSimple = {
  panelList: [
    { id: 'simple.label', type: 'property' },
    { id: 'simple.color', type: 'property' },
    { id: 'simple.size', type: 'property' },
    { id: 'simple.mode', type: 'property' },
  ],
  propertyById: {
    'simple.label': { id: 'simple.label', label: 'Text', valueType: 'text', value: 'Tokyo' },
    'simple.color': { id: 'simple.color', label: 'Color', valueType: 'color', value: '#00FFFFFF' },
    'simple.size': { id: 'simple.size', label: 'Size', valueType: 'number', min: 8, max: 48, step: 1, value: 18 },
    'simple.mode': { id: 'simple.mode', label: 'Mode', valueType: 'enum', value: 'display', optionList: [
      { id: 'select', label: 'Select' },
      { id: 'display', label: 'Display' },
      { id: 'edit', label: 'Edit' },
    ] },
  },
};

const editorDataDraggable = {
  dragStateByGroupPath: {},
  panelList: [
    {
      id: 'axis',
      label: 'Axis Blocks',
      type: 'group',
      isChildrenDraggable: true,
      children: [
        {
          id: 'axisA',
          label: 'Axis A',
          type: 'group',
          children: [
            { id: 'axis.a.name', type: 'property' },
            { id: 'axis.a.value', type: 'property' },
          ],
        },
        {
          id: 'axisB',
          label: 'Axis B',
          type: 'group',
          children: [
            { id: 'axis.b.name', type: 'property' },
            { id: 'axis.b.value', type: 'property' },
          ],
        },
        {
          id: 'axisC',
          label: 'Axis C',
          type: 'group',
          children: [
            { id: 'axis.c.name', type: 'property' },
            { id: 'axis.c.value', type: 'property' },
          ],
        },
      ],
    },
  ],
  propertyById: {
    'axis.a.name': { id: 'axis.a.name', label: 'Name', valueType: 'text', value: 'Speed' },
    'axis.a.value': { id: 'axis.a.value', label: 'Value', valueType: 'number', min: 0, max: 100, step: 1, value: 72 },
    'axis.b.name': { id: 'axis.b.name', label: 'Name', valueType: 'text', value: 'Quality' },
    'axis.b.value': { id: 'axis.b.value', label: 'Value', valueType: 'number', min: 0, max: 100, step: 1, value: 88 },
    'axis.c.name': { id: 'axis.c.name', label: 'Name', valueType: 'text', value: 'Cost' },
    'axis.c.value': { id: 'axis.c.value', label: 'Value', valueType: 'number', min: 0, max: 100, step: 1, value: 46 },
  },
};

const editorDataDeletable = {
  dragStateByGroupPath: {},
  panelList: [
    {
      id: 'blocks',
      label: 'Removable Blocks',
      type: 'group',
      isChildrenDraggable: true,
      children: [
        {
          id: 'blockA',
          label: 'Block A',
          type: 'group',
          actionList: [
            { id: 'delete', iconName: 'delete', kind: 'danger', title: 'Delete block' },
          ],
          children: [
            { id: 'block.a.name', type: 'property' },
            { id: 'block.a.enabled', type: 'property' },
          ],
        },
        {
          id: 'blockB',
          label: 'Block B',
          type: 'group',
          actionList: [
            { id: 'delete', iconName: 'delete', kind: 'danger', title: 'Delete block' },
          ],
          children: [
            { id: 'block.b.name', type: 'property' },
            { id: 'block.b.enabled', type: 'property' },
          ],
        },
        {
          id: 'blockC',
          label: 'Block C',
          type: 'group',
          actionList: [
            { id: 'delete', iconName: 'delete', kind: 'danger', title: 'Delete block' },
          ],
          children: [
            { id: 'block.c.name', type: 'property' },
            { id: 'block.c.enabled', type: 'property' },
          ],
        },
      ],
    },
  ],
  propertyById: {
    'block.a.name': { id: 'block.a.name', label: 'Name', valueType: 'text', value: 'Alpha' },
    'block.a.enabled': { id: 'block.a.enabled', label: 'Enabled', valueType: 'bool', value: true },
    'block.b.name': { id: 'block.b.name', label: 'Name', valueType: 'text', value: 'Beta' },
    'block.b.enabled': { id: 'block.b.enabled', label: 'Enabled', valueType: 'bool', value: true },
    'block.c.name': { id: 'block.c.name', label: 'Name', valueType: 'text', value: 'Gamma' },
    'block.c.enabled': { id: 'block.c.enabled', label: 'Enabled', valueType: 'bool', value: false },
  },
};

const editorDataEnumViews = {
  panelList: [
    { id: 'enum.vertical', type: 'property' },
    { id: 'enum.horizontal', type: 'property' },
  ],
  propertyById: {
    'enum.vertical': { id: 'enum.vertical', label: 'Vertical', valueType: 'enum', displayType: 'radio-vertical', value: 'axis-2', optionList: axisOptions },
    'enum.horizontal': { id: 'enum.horizontal', label: 'Scroll', valueType: 'enum', displayType: 'radio-horizontal', value: 'axis-4', optionList: axisOptions, uiState: { offsetX: 0 } },
  },
};

const editorDataAlignment = {
  panelList: [
    { id: 'alignment.longKey', type: 'property' },
    { id: 'alignment.longValue', type: 'property' },
    { id: 'alignment.longBoth', type: 'property' },
  ],
  propertyById: {
    'alignment.longKey': {
      id: 'alignment.longKey',
      label: 'Very Long Key Label That Starts With Important Prefix And Ends With Important Suffix',
      valueType: 'text',
      value: 'short value',
    },
    'alignment.longValue': {
      id: 'alignment.longValue',
      label: 'Value',
      valueType: 'text',
      value: 'this-is-a-very-long-single-line-value-that-can-be-inspected-by-using-the-mouse-wheel-while-hovering',
    },
    'alignment.longBoth': {
      id: 'alignment.longBoth',
      label: 'Another Long Key Label Used To Demonstrate Hidden Overflow',
      valueType: 'text',
      value: 'another-long-value-without-line-breaks-so-the-row-height-stays-stable-while-horizontal-wheel-scroll-reveals-more',
    },
  },
};

const editorDataTopOnly = {
  levelTopSelectedId: 'basic',
  levelTopList: [
    {
      id: 'basic',
      label: 'Basic',
      children: [
        { id: 'block.basic.label', type: 'property' },
        { id: 'block.basic.color', type: 'property' },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      children: [
        {
          id: 'layout',
          label: 'Layout',
          type: 'group',
          children: [
            { id: 'block.advanced.layout.rowSpan', type: 'property' },
            { id: 'block.advanced.layout.colSpan', type: 'property' },
          ],
        },
      ],
    },
  ],
  propertyById: {
    'block.basic.label': { id: 'block.basic.label', label: 'Text', valueType: 'text', value: 'Region block' },
    'block.basic.color': { id: 'block.basic.color', label: 'Color', valueType: 'color', value: '#FFFF00FF' },
    'block.advanced.layout.rowSpan': { id: 'block.advanced.layout.rowSpan', label: 'Row Span', valueType: 'number', min: 1, max: 6, step: 1, value: 2 },
    'block.advanced.layout.colSpan': { id: 'block.advanced.layout.colSpan', label: 'Col Span', valueType: 'number', displayType: 'slider', min: 1, max: 8, step: 1, value: 3 },
  },
};

const exampleListDefault = [
  {
    id: 'full',
    label: 'Left + Top + Groups',
    description: 'Display structure is panel/group/property ids; propertyById stores type, value, min/max, display type, and enum options.',
    data: editorDataFull,
    config: { titleText: 'Kanto Material', width: 'min(320px, 100%)', embeddedWidth: 340, popupWidth: 320, isLevelLeftShown: true, isLevelTopShown: true, keyColWidth: 'min', keyColMinWidth: '54px', keyColMaxWidth: '92px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
  {
    id: 'topOnly',
    label: 'Top Tabs Only',
    description: 'A block popup style with top tabs and the same propertyById data format.',
    data: editorDataTopOnly,
    config: { titleText: 'Region Block', width: 'min(310px, 100%)', embeddedWidth: 330, popupWidth: 310, isLevelLeftShown: false, isLevelTopShown: true, keyColWidth: 'min', keyColMinWidth: '54px', keyColMaxWidth: '90px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
  {
    id: 'simple',
    label: 'Embedded Simple',
    description: 'No left tabs, no top tabs, just compact property rows backed by keyed property data.',
    data: editorDataSimple,
    config: { titleText: 'Tokyo Object', width: 'min(300px, 100%)', embeddedWidth: 320, popupWidth: 300, isLevelLeftShown: false, isLevelTopShown: false, keyColWidth: 'min', keyColMinWidth: '48px', keyColMaxWidth: '82px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
  {
    id: 'draggable',
    label: 'Draggable Groups',
    description: 'A collapsible group can opt in to direct child drag. The drag state and final order are owned by the MobX demo store.',
    data: editorDataDraggable,
    config: { titleText: 'Axis Order', width: 'min(330px, 100%)', embeddedWidth: 360, popupWidth: 330, isLevelLeftShown: false, isLevelTopShown: false, keyColWidth: 'min', keyColMinWidth: '48px', keyColMaxWidth: '82px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
    secondaryDescription: 'Draggable child rows can expose action buttons through actionList. Click delete to remove a block and its property data.',
    secondaryData: editorDataDeletable,
    secondaryConfig: { titleText: 'Removable Blocks', width: 'min(330px, 100%)', embeddedWidth: 360, popupWidth: 330, isLevelLeftShown: false, isLevelTopShown: false, keyColWidth: 'min', keyColMinWidth: '48px', keyColMaxWidth: '82px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
  {
    id: 'enumViews',
    label: 'Enum Radio Views',
    description: 'Enum values can render as vertical radio lists or horizontal wheel-scrolled radio groups. The horizontal offset is owned by MobX data.',
    data: editorDataEnumViews,
    config: { titleText: 'Enum Views', width: 'min(340px, 100%)', embeddedWidth: 370, popupWidth: 340, isLevelLeftShown: false, isLevelTopShown: false, keyColWidth: 'min', keyColMinWidth: '58px', keyColMaxWidth: '90px', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
  {
    id: 'alignment',
    label: 'Alignment + Overflow',
    description: 'Keys default to right alignment, values default to left alignment, and clipped cells can be inspected with the mouse wheel while hovering.',
    data: editorDataAlignment,
    config: { titleText: 'Alignment', width: 'min(300px, 100%)', embeddedWidth: 320, popupWidth: 300, isLevelLeftShown: false, isLevelTopShown: false, keyColWidth: '96px', keyCellContentAlign: 'right', valueCellContentAlign: 'left', requestTimeoutMs: 1800, serverSimulation: { delayMinMs: 120, delayMaxMs: 360, errorRate: 0.08, timeoutRate: 0.03 } },
  },
];

class PropEditorDemoStore {
  exampleList = exampleListDefault.map((example) => ({
    ...example,
    data: editorDataClone(example.data),
    secondaryData: example.secondaryData ? editorDataClone(example.secondaryData) : undefined,
    secondaryConfig: example.secondaryConfig ? { ...example.secondaryConfig, groupCollapsedByPath: {} } : undefined,
    config: { ...example.config, groupCollapsedByPath: {} },
  }));
  exampleSelectedId = 'full';
  messageText = 'Ready';
  isPopupShown = false;
  popupPos = { x: 260, y: 120 };
  dragState = { isDragging: false, xStart: 0, yStart: 0, xOrigin: 0, yOrigin: 0 };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get exampleSelected() {
    return this.exampleList.find((example) => example.id === this.exampleSelectedId) ?? this.exampleList[0];
  }

  selectExample(exampleId) {
    if (this.exampleList.some((example) => example.id === exampleId)) this.exampleSelectedId = exampleId;
  }

  propertySet(data, propertyId, propertyPath, valueNext) {
    const property = data.propertyById?.[propertyPath] ?? data.propertyById?.[propertyId];
    if (!property) return false;
    property.value = valueNext;
    this.messageText = `${property.id ?? propertyPath} = ${valueNext}`;
    return true;
  }

  async handleEditorEvent(eventType, eventData = {}, editorTarget = 'primary') {
    const example = this.exampleSelected;
    const data = editorTarget === 'secondary' ? example.secondaryData : example.data;
    const config = editorTarget === 'secondary' ? example.secondaryConfig : example.config;
    if (!data || !config) return { code: -1, message: 'Editor data not found.' };

    if (eventType === 'levelLeftSelect') {
      data.levelLeftSelectedId = eventData.levelId;
      const left = data.levelLeftList?.find((node) => node.id === eventData.levelId);
      data.levelTopSelectedId = left?.children?.[0]?.id ?? data.levelTopSelectedId;
      return { code: 0 };
    }

    if (eventType === 'levelTopSelect') {
      data.levelTopSelectedId = eventData.levelId;
      return { code: 0 };
    }

    if (eventType === 'groupToggle') {
      const path = eventData.groupPath;
      const collapsed = config.groupCollapsedByPath;
      collapsed[path] = !collapsed[path];
      return { code: 0 };
    }

    if (eventType === 'propertyChangeAttempt') {
      const serverResult = await fakeServerUpdate(eventData.requestContext);
      if (serverResult.code !== 0) return serverResult;
      this.propertySet(data, eventData.propertyId, eventData.propertyPath, eventData.valueNext);
      return serverResult;
    }

    if (eventType === 'propertyUiStateChange') {
      const property = data.propertyById?.[eventData.propertyPath] ?? data.propertyById?.[eventData.propertyId];
      if (!property) return { code: -1, message: 'Property not found.' };
      property.uiState = { ...(property.uiState || {}), ...(eventData.uiStateNext || {}) };
      return { code: 0 };
    }

    if (eventType === 'propertyDirectDragStart') {
      if (!data.dragStateByGroupPath) data.dragStateByGroupPath = {};
      data.dragStateByGroupPath[eventData.groupPath] = {
        isDragging: true,
        itemIdDragged: eventData.itemId,
        indexFrom: Number(eventData.indexFrom) || 0,
        indexDrop: Number(eventData.indexFrom) || 0,
      };
      return { code: 0 };
    }

    if (eventType === 'propertyDirectDragPreview') {
      const dragState = data.dragStateByGroupPath?.[eventData.groupPath];
      if (dragState?.isDragging) dragState.indexDrop = Number(eventData.indexDrop) || 0;
      return { code: 0 };
    }

    if (eventType === 'propertyDirectDragDrop') {
      const dragState = data.dragStateByGroupPath?.[eventData.groupPath];
      const nodeList = nodeListByPathGet(data, eventData.groupPath);
      if (dragState?.isDragging && nodeList) nodeMoveById(nodeList, dragState.itemIdDragged, dragState.indexDrop);
      if (data.dragStateByGroupPath) delete data.dragStateByGroupPath[eventData.groupPath];
      this.messageText = `reordered ${eventData.groupPath}`;
      return { code: 0 };
    }

    if (eventType === 'propertyDirectDragClear') {
      if (data.dragStateByGroupPath) delete data.dragStateByGroupPath[eventData.groupPath];
      return { code: 0 };
    }

    if (eventType === 'propertyDirectItemAction') {
      if (eventData.actionId !== 'delete') return { code: 1, message: `Unsupported action: ${eventData.actionId}` };
      const nodeList = nodeListByPathGet(data, eventData.groupPath);
      const node = nodeList?.find((item) => item.id === eventData.itemId);
      if (!nodeList || !node) return { code: -1, message: 'Item not found.' };
      propertyRemoveByNode(node, data.propertyById);
      nodeRemoveById(nodeList, eventData.itemId);
      this.messageText = `deleted ${eventData.itemId}`;
      return { code: 0 };
    }

    return { code: 1, message: `Unsupported event: ${eventType}` };
  }

  handleSecondaryEditorEvent(eventType, eventData = {}) {
    return this.handleEditorEvent(eventType, eventData, 'secondary');
  }

  popupOpen() {
    this.isPopupShown = true;
  }

  popupClose() {
    this.isPopupShown = false;
    this.dragState.isDragging = false;
  }

  dragBegin(x, y) {
    this.dragState = { isDragging: true, xStart: x, yStart: y, xOrigin: this.popupPos.x, yOrigin: this.popupPos.y };
  }

  dragMove(x, y) {
    if (!this.dragState.isDragging) return;
    this.popupPos.x = this.dragState.xOrigin + x - this.dragState.xStart;
    this.popupPos.y = this.dragState.yOrigin + y - this.dragState.yStart;
  }

  dragEnd() {
    this.dragState.isDragging = false;
  }
}

function createPropEditorDemoStore() {
  return new PropEditorDemoStore();
}

export { createPropEditorDemoStore };
export default PropEditorDemoStore;