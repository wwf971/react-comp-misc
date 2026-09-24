import { makeAutoObservable } from 'mobx';

const fieldKeyList = ['sourceRow', 'orderName', 'detailRows', 'chartPayload'];

const fieldLabelByKey = {
  sourceRow: 'Source row',
  orderName: 'Order name',
  detailRows: 'Detail rows',
  chartPayload: 'Chart payload',
};

const recordDataDone = {
  tableLabelText: 'Table',
  tableName: 'order',
  recordIdLabelText: 'Record ID',
  recordId: 'order-1001',
  fieldList: [
    { key: 'name', label: 'name', value: 'Sample order A' },
    { key: 'customer', label: 'customer', value: 'Sample customer' },
  ],
};

const cardDataByKey = {
  sourceRow: {
    titleText: 'Source row loaded',
    subtitleText: 'order_source',
    statusKind: 'running',
    messageText: 'Fetching the selected row from the order source table...',
    metaList: [
      { key: 'table', label: 'Table', value: 'order_source' },
      { key: 'lookup', label: 'Lookup', value: 'order_lookup' },
    ],
  },
  orderRow: {
    titleText: 'Order row resolved',
    subtitleText: 'order',
    statusKind: 'running',
    messageText: 'Resolving the lookup target row...',
  },
  detailQuery: {
    titleText: 'Detail rows requested',
    subtitleText: 'order_line',
    statusKind: 'running',
    contentType: 'query',
    contentData: {
      descriptionText: 'Query options for this sample.',
      queryData: {
        filter: "order_id eq 'order-1001'",
        select: 'line_name, line_qty, line_note',
      },
    },
  },
  fieldStatusTable: {
    titleText: 'Independent field requests',
    subtitleText: 'custom card renderer',
    statusKind: 'running',
    contentType: 'fieldStatusTable',
  },
  chartPayload: {
    titleText: 'Chart payload normalized',
    subtitleText: 'chart payload',
    statusKind: 'done',
    messageText: 'The chart payload is ready for rendering.',
    rowList: [
      { key: 'axisCount', label: 'Axis count', value: 4 },
      { key: 'fallbackCount', label: 'Fallback count', value: 0 },
    ],
  },
  failureExit: {
    titleText: 'Workflow exited with exception',
    subtitleText: 'failure branch',
    statusKind: 'error',
    contentType: 'exception',
    contentData: {
      errorName: 'DetailFetchTimeout',
      messageText: 'Detail rows did not arrive before the timeout, so normalization did not run.',
      detailText: "GET order_line?order_id=order-1001",
    },
  },
  substepAll: {
    titleText: 'All substeps visible',
    subtitleText: 'built-in substep card',
    statusKind: 'running',
    contentType: 'substepList',
    contentData: {
      mode: 'all',
      stepList: [
        { id: 'source', text: 'Fetch source row', statusKind: 'running' },
        { id: 'order', text: 'Resolve order row', statusKind: 'waiting' },
        { id: 'detail', text: 'Fetch detail rows', statusKind: 'waiting' },
      ],
    },
  },
  substepReveal: {
    titleText: 'Substeps revealed as they run',
    subtitleText: 'built-in substep card',
    statusKind: 'running',
    contentType: 'substepList',
    contentData: {
      mode: 'reveal',
      stepList: [
        { id: 'metadata', text: 'Read table metadata', statusKind: 'running', isVisible: true },
        { id: 'columns', text: 'Compare required columns', statusKind: 'hidden', isVisible: false },
        { id: 'summary', text: 'Build setup summary', statusKind: 'hidden', isVisible: false },
      ],
    },
  },
};

function dataCloneGet(data) {
  return JSON.parse(JSON.stringify(data));
}

function timeTextGet() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function fieldListGet(dataByKey) {
  return fieldKeyList.map((fieldKey) => ({
    key: fieldKey,
    label: fieldLabelByKey[fieldKey],
    ...dataCloneGet(dataByKey[fieldKey]),
  }));
}

function eventAppend(atMs, cardId, cardKey, data = {}) {
  return { atMs, type: 'cardAppend', cardId, cardKey, data };
}

function eventCardUpdate(atMs, cardId, data) {
  return { atMs, type: 'cardUpdate', cardId, data };
}

function eventFieldUpdate(atMs, cardId, fieldKey, data) {
  return { atMs, type: 'fieldUpdate', cardId, fieldKey, data };
}

function eventSubstepUpdate(atMs, cardId, substepId, data) {
  return { atMs, type: 'substepUpdate', cardId, substepId, data };
}

function eventDone(atMs, modeDone) {
  return { atMs, type: 'playbackDone', modeDone };
}

const fieldDataInitial = {
  sourceRow: { statusKind: 'done', value: '1 row loaded', messageText: '' },
  orderName: { statusKind: 'done', value: 'Sample order A', messageText: '' },
  detailRows: { statusKind: 'running', value: '', messageText: 'fetching detail rows...' },
  chartPayload: { statusKind: 'waiting', value: '', messageText: 'waiting for detail rows' },
};

const eventListSuccess = [
  eventAppend(0, 'source', 'sourceRow'),
  eventCardUpdate(1400, 'source', { statusKind: 'done', messageText: 'Loaded the row selected from the order source table.' }),
  eventAppend(1800, 'order', 'orderRow'),
  eventCardUpdate(3200, 'order', { statusKind: 'done', messageText: '', contentType: 'record', contentData: recordDataDone }),
  eventAppend(3600, 'query', 'detailQuery'),
  eventCardUpdate(5000, 'query', { statusKind: 'done' }),
  eventAppend(5400, 'fields', 'fieldStatusTable', { contentData: { fieldList: fieldListGet(fieldDataInitial) } }),
  eventFieldUpdate(6800, 'fields', 'detailRows', { statusKind: 'done', value: '6 rows loaded', messageText: '' }),
  eventFieldUpdate(6800, 'fields', 'chartPayload', { statusKind: 'running', value: '', messageText: 'normalizing payload...' }),
  eventFieldUpdate(8200, 'fields', 'chartPayload', { statusKind: 'done', value: '4 axes ready', messageText: '' }),
  eventCardUpdate(8200, 'fields', { statusKind: 'done', messageText: '' }),
  eventAppend(9000, 'payload', 'chartPayload'),
  eventDone(10000, 'successDone'),
];

const eventListFailure = [
  ...eventListSuccess.slice(0, 7),
  eventFieldUpdate(7000, 'fields', 'detailRows', { statusKind: 'error', value: '', messageText: 'request timed out' }),
  eventFieldUpdate(7000, 'fields', 'chartPayload', { statusKind: 'error', value: '', messageText: 'skipped after upstream failure' }),
  eventCardUpdate(7000, 'fields', { statusKind: 'error', messageText: 'Detail row request timed out. The downstream payload step was skipped.' }),
  eventAppend(7800, 'failure', 'failureExit'),
  eventDone(8800, 'failureDone'),
];

const eventListBurst = [
  eventAppend(0, 'source', 'sourceRow'),
  eventCardUpdate(1100, 'source', { statusKind: 'done', messageText: 'Loaded the source row.' }),
  eventAppend(1400, 'order', 'orderRow'),
  eventCardUpdate(2500, 'order', { statusKind: 'done', messageText: '', contentType: 'record', contentData: recordDataDone }),
  eventAppend(2800, 'query', 'detailQuery'),
  eventCardUpdate(3900, 'query', { statusKind: 'done' }),
  eventAppend(4200, 'fields', 'fieldStatusTable', { contentData: { fieldList: fieldListGet(fieldDataInitial) } }),
  eventFieldUpdate(5300, 'fields', 'detailRows', { statusKind: 'done', value: '6 rows loaded', messageText: '' }),
  eventFieldUpdate(5300, 'fields', 'chartPayload', { statusKind: 'running', value: '', messageText: 'normalizing payload...' }),
  eventFieldUpdate(6400, 'fields', 'chartPayload', { statusKind: 'done', value: '4 axes ready', messageText: '' }),
  eventCardUpdate(6400, 'fields', { statusKind: 'done', messageText: '' }),
  eventAppend(6900, 'payload', 'chartPayload'),
  eventDone(7900, 'burstDone'),
];

const eventListSubstep = [
  eventAppend(0, 'substep-all', 'substepAll'),
  eventSubstepUpdate(1400, 'substep-all', 'source', { statusKind: 'done' }),
  eventSubstepUpdate(1400, 'substep-all', 'order', { statusKind: 'running' }),
  eventSubstepUpdate(2800, 'substep-all', 'order', { statusKind: 'done' }),
  eventSubstepUpdate(2800, 'substep-all', 'detail', { statusKind: 'running' }),
  eventSubstepUpdate(4200, 'substep-all', 'detail', { statusKind: 'failed' }),
  eventCardUpdate(4200, 'substep-all', { statusKind: 'error' }),
  eventAppend(4700, 'substep-reveal', 'substepReveal'),
  eventSubstepUpdate(6100, 'substep-reveal', 'metadata', { statusKind: 'done' }),
  eventSubstepUpdate(6100, 'substep-reveal', 'columns', { statusKind: 'running', isVisible: true }),
  eventSubstepUpdate(7500, 'substep-reveal', 'columns', { statusKind: 'done' }),
  eventSubstepUpdate(7500, 'substep-reveal', 'summary', { statusKind: 'running', isVisible: true }),
  eventSubstepUpdate(8900, 'substep-reveal', 'summary', { statusKind: 'done' }),
  eventCardUpdate(8900, 'substep-reveal', { statusKind: 'done' }),
  eventDone(9400, 'substepDone'),
];

const scenarioByKey = {
  success: { modeRunning: 'success', eventList: eventListSuccess },
  failure: { modeRunning: 'failure', eventList: eventListFailure },
  burst: { modeRunning: 'burst', eventList: eventListBurst },
  substep: { modeRunning: 'substep', eventList: eventListSubstep },
};

class StoreTimelineLinearExample {
  cardIdList = [];
  cardById = {};
  cardClickedId = '';
  scrollKey = 0;
  isWorkflowRunning = false;
  workflowMode = 'idle';
  playbackToken = 0;
  timeoutIdList = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get timelineData() {
    return {
      itemList: this.cardIdList.map((cardId) => this.cardById[cardId]),
      scrollKey: this.scrollKey,
    };
  }

  get isAddDisabled() {
    return this.isWorkflowRunning;
  }

  get workflowStatusText() {
    if (this.isWorkflowRunning && this.workflowMode === 'substep') return 'Running substep examples';
    if (this.isWorkflowRunning && this.workflowMode === 'burst') return 'Running burst workflow';
    if (this.isWorkflowRunning) return this.workflowMode === 'failure' ? 'Running failure workflow' : 'Running success workflow';
    if (this.workflowMode === 'successDone') return 'Success workflow completed';
    if (this.workflowMode === 'failureDone') return 'Failure workflow stopped';
    if (this.workflowMode === 'substepDone') return 'Substep examples completed';
    if (this.workflowMode === 'burstDone') return 'Burst workflow completed';
    return 'Idle';
  }

  timerClear() {
    this.timeoutIdList.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.timeoutIdList = [];
  }

  timerSet(callback, delayMs, token) {
    const timeoutId = window.setTimeout(() => {
      if (this.playbackToken !== token) return;
      callback();
    }, delayMs);
    this.timeoutIdList.push(timeoutId);
  }

  playbackReset() {
    this.timerClear();
    this.playbackToken += 1;
    this.cardIdList = [];
    this.cardById = {};
    this.cardClickedId = '';
    this.isWorkflowRunning = false;
    this.workflowMode = 'idle';
    this.scrollKey += 1;
  }

  playbackRun(scenarioKey) {
    if (this.isWorkflowRunning) return { code: -1, message: 'Workflow is already running.' };
    const scenario = scenarioByKey[scenarioKey];
    if (!scenario) return { code: -1, message: `Unknown scenario: ${scenarioKey}` };
    this.playbackReset();
    this.isWorkflowRunning = true;
    this.workflowMode = scenario.modeRunning;
    const token = this.playbackToken;
    scenario.eventList.forEach((eventData) => {
      this.timerSet(() => this.eventApply(eventData), eventData.atMs, token);
    });
    return { code: 0 };
  }

  eventApply(eventData) {
    if (eventData.type === 'cardAppend') return this.cardAppend(eventData);
    if (eventData.type === 'cardUpdate') return this.cardUpdate(eventData.cardId, eventData.data);
    if (eventData.type === 'fieldUpdate') return this.fieldUpdate(eventData.cardId, eventData.fieldKey, eventData.data);
    if (eventData.type === 'substepUpdate') return this.substepUpdate(eventData.cardId, eventData.substepId, eventData.data);
    if (eventData.type === 'playbackDone') {
      this.isWorkflowRunning = false;
      this.workflowMode = eventData.modeDone;
      return { code: 0 };
    }
    return { code: -1, message: `Unknown event type: ${eventData.type}` };
  }

  cardAppend(eventData) {
    const cardData = {
      ...dataCloneGet(cardDataByKey[eventData.cardKey]),
      ...dataCloneGet(eventData.data || {}),
      id: eventData.cardId,
      timeText: timeTextGet(),
      isClickable: true,
    };
    this.cardById[eventData.cardId] = cardData;
    this.cardIdList.push(eventData.cardId);
    this.scrollKey += 1;
    return cardData;
  }

  cardUpdate(cardId, dataNext) {
    const cardData = this.cardById[cardId];
    if (!cardData) return null;
    Object.assign(cardData, dataCloneGet(dataNext));
    return cardData;
  }

  fieldUpdate(cardId, fieldKey, dataNext) {
    const fieldData = this.cardById[cardId]?.contentData?.fieldList?.find((data) => data.key === fieldKey);
    if (!fieldData) return null;
    Object.assign(fieldData, dataCloneGet(dataNext));
    return fieldData;
  }

  substepUpdate(cardId, substepId, dataNext) {
    const substepData = this.cardById[cardId]?.contentData?.stepList?.find((data) => data.id === substepId);
    if (!substepData) return null;
    Object.assign(substepData, dataCloneGet(dataNext));
    return substepData;
  }

  cardClick(cardId) {
    this.cardClickedId = cardId;
    return { code: 0 };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'timelinePlay') return this.playbackRun(eventData.scenarioKey);
    if (eventType === 'workflowSuccessRun') return this.playbackRun('success');
    if (eventType === 'workflowFailureRun') return this.playbackRun('failure');
    if (eventType === 'workflowBurstRun') return this.playbackRun('burst');
    if (eventType === 'substepExamplesRun') return this.playbackRun('substep');
    if (eventType === 'stepReset') {
      this.playbackReset();
      return { code: 0 };
    }
    if (eventType === 'timelineCardClick') return this.cardClick(eventData.itemId);
    return { code: 1, message: `Unsupported event: ${eventType}` };
  }

  dispose() {
    this.timerClear();
    this.playbackToken += 1;
  }
}

export { StoreTimelineLinearExample, scenarioByKey };
export default StoreTimelineLinearExample;
