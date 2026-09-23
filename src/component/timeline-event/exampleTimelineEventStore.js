import { makeAutoObservable } from 'mobx';

const exampleList = [
  { key: 'standard', label: 'Business day', labelVariant: 'compactDot', description: 'Short one-line cards. Each connector meets the colored circle at the card’s left edge.' },
  { key: 'multiDay', label: 'Multiple days', labelVariant: 'compactTime', description: 'Compact bordered cards with a square marker and an inline time badge.' },
  { key: 'aggregate', label: 'Auto merge', labelVariant: 'compactDot', isAggregationEnabled: true, description: 'Events automatically merge by day, week, half-month, month, or year as the visible resolution changes. Hover a count tag to inspect its events.' },
  { key: 'overlap', label: 'Overlapping ranges', labelVariant: 'detailEdge', description: 'Detailed two-line cards. Each connector meets the card’s colored left edge.' },
];

const eventListByExampleKey = {
  overlap: [
    eventBuild('o1', 'Greeting: Project A', '2026-07-19T09:00:00+09:00', '2026-07-19T09:42:00+09:00', 'blue'),
    eventBuild('o2', 'Needs review: Project B', '2026-07-19T09:04:00+09:00', '2026-07-19T10:02:00+09:00', 'green'),
    eventBuild('o3', 'Draft proposal', '2026-07-19T09:09:00+09:00', '2026-07-19T09:31:00+09:00', 'amber'),
    eventBuild('o4', 'Terms review', '2026-07-19T09:13:00+09:00', '2026-07-19T10:20:00+09:00', 'purple'),
    eventBuild('o5', 'Staff interview', '2026-07-19T09:17:00+09:00', '2026-07-19T09:54:00+09:00', 'red'),
    eventBuild('o6', 'Follow-up call', '2026-07-19T09:21:00+09:00', '2026-07-19T09:38:00+09:00', 'blue'),
    eventBuild('o7', 'Price check', '2026-07-19T09:27:00+09:00', '2026-07-19T10:12:00+09:00', 'green'),
    eventBuild('o8', 'Site notes', '2026-07-19T09:34:00+09:00', '2026-07-19T10:29:00+09:00', 'amber'),
    eventBuild('o9', 'Briefing', '2026-07-19T09:41:00+09:00', '2026-07-19T10:04:00+09:00', 'purple'),
    eventBuild('o10', 'Integration questions', '2026-07-19T09:48:00+09:00', '2026-07-19T10:35:00+09:00', 'red'),
    eventBuild('o11', 'Delivery plan', '2026-07-19T10:05:00+09:00', '2026-07-19T10:46:00+09:00', 'blue'),
    eventBuild('o12', 'Summary', '2026-07-19T10:18:00+09:00', '2026-07-19T10:55:00+09:00', 'green'),
  ],
  standard: [
    eventBuild('s1', 'Morning planning', '2026-07-19T08:30:00+09:00', '2026-07-19T09:10:00+09:00', 'blue'),
    eventBuild('s2', 'Project A', '2026-07-19T09:25:00+09:00', '2026-07-19T10:05:00+09:00', 'green'),
    eventBuild('s3', 'Project B follow-up', '2026-07-19T09:50:00+09:00', '2026-07-19T10:35:00+09:00', 'amber'),
    eventBuild('s4', 'Site check', '2026-07-19T11:10:00+09:00', '2026-07-19T12:30:00+09:00', 'purple'),
    eventBuild('s5', 'Project C proposal', '2026-07-19T13:30:00+09:00', '2026-07-19T14:20:00+09:00', 'red'),
    eventBuild('s6', 'Contract review', '2026-07-19T14:00:00+09:00', '2026-07-19T15:10:00+09:00', 'blue'),
    eventBuild('s7', 'Delivery coordination', '2026-07-19T16:05:00+09:00', '2026-07-19T16:45:00+09:00', 'green'),
  ],
  multiDay: [
    eventBuild('m1', 'Kickoff', '2026-07-17T10:00:00+09:00', '2026-07-17T12:00:00+09:00', 'blue'),
    eventBuild('m2', 'Site A review', '2026-07-18T13:00:00+09:00', '2026-07-18T16:30:00+09:00', 'green'),
    eventBuild('m3', 'Remote requirements', '2026-07-19T09:00:00+09:00', '2026-07-19T11:00:00+09:00', 'amber'),
    eventBuild('m4', 'Site B review', '2026-07-19T10:00:00+09:00', '2026-07-19T14:00:00+09:00', 'purple'),
    eventBuild('m5', 'Pricing workshop', '2026-07-20T11:30:00+09:00', '2026-07-20T15:00:00+09:00', 'red'),
    eventBuild('m6', 'Final presentation', '2026-07-21T14:00:00+09:00', '2026-07-21T16:00:00+09:00', 'blue'),
  ],
  aggregate: [
    eventBuild('a1', 'Project A introduction', '2026-07-15T09:00:00+09:00', '2026-07-15T09:45:00+09:00', 'blue'),
    eventBuild('a2', 'Project B requirements', '2026-07-15T10:30:00+09:00', '2026-07-15T11:20:00+09:00', 'green'),
    eventBuild('a3', 'Project C price call', '2026-07-15T14:00:00+09:00', '2026-07-15T14:35:00+09:00', 'amber'),
    eventBuild('a4', 'Site walkthrough', '2026-07-16T08:30:00+09:00', '2026-07-16T10:00:00+09:00', 'purple'),
    eventBuild('a5', 'Operations interview', '2026-07-16T11:15:00+09:00', '2026-07-16T12:00:00+09:00', 'red'),
    eventBuild('a6', 'Delivery planning', '2026-07-16T15:30:00+09:00', '2026-07-16T16:10:00+09:00', 'blue'),
    eventBuild('a7', 'Proposal draft', '2026-07-17T09:20:00+09:00', '2026-07-17T10:30:00+09:00', 'green'),
    eventBuild('a8', 'Legal conditions', '2026-07-17T13:00:00+09:00', '2026-07-17T14:10:00+09:00', 'amber'),
    eventBuild('a9', 'Integration review', '2026-07-17T15:00:00+09:00', '2026-07-17T16:30:00+09:00', 'purple'),
    eventBuild('a10', 'Site A visit', '2026-07-20T09:00:00+09:00', '2026-07-20T11:30:00+09:00', 'red'),
    eventBuild('a11', 'Executive briefing', '2026-07-20T13:30:00+09:00', '2026-07-20T14:15:00+09:00', 'blue'),
    eventBuild('a12', 'Contract follow-up', '2026-07-20T16:00:00+09:00', '2026-07-20T16:40:00+09:00', 'green'),
    eventBuild('a13', 'Site B inspection', '2026-07-21T10:00:00+09:00', '2026-07-21T12:00:00+09:00', 'amber'),
    eventBuild('a14', 'Final decision call', '2026-07-21T14:30:00+09:00', '2026-07-21T15:20:00+09:00', 'purple'),
  ],
};

const timeRangeInitialByExampleKey = {
  overlap: { timeStart: new Date('2026-07-19T08:40:00+09:00'), timeEnd: new Date('2026-07-19T11:15:00+09:00') },
  standard: { timeStart: new Date('2026-07-19T07:45:00+09:00'), timeEnd: new Date('2026-07-19T17:30:00+09:00') },
  multiDay: { timeStart: new Date('2026-07-17T00:00:00+09:00'), timeEnd: new Date('2026-07-22T00:00:00+09:00') },
  aggregate: { timeStart: new Date('2026-07-14T00:00:00+09:00'), timeEnd: new Date('2026-07-23T00:00:00+09:00') },
};

const aggregationLevelList = [
  { id: 'day', label: 'same day', unit: 'day', durationMinMs: 2 * 24 * 60 * 60 * 1000 },
  { id: 'week', label: 'same week', unit: 'week', durationMinMs: 28 * 24 * 60 * 60 * 1000 },
  { id: 'halfMonth', label: 'same half-month', unit: 'halfMonth', durationMinMs: 60 * 24 * 60 * 60 * 1000 },
  { id: 'month', label: 'same month', unit: 'month', durationMinMs: 184 * 24 * 60 * 60 * 1000 },
  { id: 'year', label: 'same year', unit: 'year', durationMinMs: 366 * 24 * 60 * 60 * 1000 },
];

class StoreTimelineEventExample {
  exampleSelectedKey = exampleList[0].key;
  eventSelectedId = '';
  aggregateSelectedEventIdList = [];
  isLabelChannelHeightLimited = false;
  isTimelineVisible = false;
  timeRangeByExampleKey = Object.fromEntries(Object.entries(timeRangeInitialByExampleKey).map(([key, range]) => [key, { ...range }]));
  eventByIdByExampleKey = Object.fromEntries(Object.entries(eventListByExampleKey).map(([key, eventList]) => [key, Object.fromEntries(eventList.map((eventData) => [eventData.id, eventData]))]));
  eventIdListByExampleKey = Object.fromEntries(Object.entries(eventListByExampleKey).map(([key, eventList]) => [key, eventList.map((eventData) => eventData.id)]));

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get exampleSelected() {
    return exampleList.find((exampleData) => exampleData.key === this.exampleSelectedKey) || exampleList[0];
  }

  get timelineData() {
    return {
      eventById: this.eventByIdByExampleKey[this.exampleSelectedKey],
      eventIdList: this.eventIdListByExampleKey[this.exampleSelectedKey],
      eventIdSelected: this.eventSelectedId,
      timeRange: this.timeRangeByExampleKey[this.exampleSelectedKey],
    };
  }

  get timelineConfig() {
    return {
      height: 330,
      laneCountEvent: 5,
      widthLabelMax: this.exampleSelected.labelVariant === 'compactDot'
        ? 160
        : (this.exampleSelected.labelVariant === 'compactTime' ? 230 : 184),
      isCurrentTimeVisible: false,
      isLabelChannelHeightLimited: this.isLabelChannelHeightLimited,
      heightLabelChannelMax: 145,
      gapChannelLabel: 8,
      labelVariant: this.exampleSelected.labelVariant,
      isAggregationEnabled: this.exampleSelected.isAggregationEnabled === true,
      aggregation: {
        countMin: 2,
        offsetMinute: 9 * 60,
        levelList: aggregationLevelList,
      },
    };
  }

  get eventSelected() {
    return this.timelineData.eventById[this.eventSelectedId] || null;
  }

  get rangeText() {
    const range = this.timeRangeByExampleKey[this.exampleSelectedKey];
    return `${dateTimeFormatter.format(range.timeStart)} – ${dateTimeFormatter.format(range.timeEnd)}`;
  }

  get statusText() {
    if (this.aggregateSelectedEventIdList.length) return `${this.aggregateSelectedEventIdList.length} merged events selected.`;
    if (this.eventSelected) return `Selected: ${this.eventSelected.name}`;
    return 'Select an event range or label to inspect it.';
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'exampleSelect') {
      const exampleKey = String(eventData.exampleKey || '');
      if (!exampleList.some((exampleData) => exampleData.key === exampleKey)) return { code: -1, message: 'Unknown example.' };
      this.exampleSelectedKey = exampleKey;
      this.eventSelectedId = '';
      this.aggregateSelectedEventIdList = [];
      return { code: 0 };
    }
    if (eventType === 'timeRangeReset') {
      this.timeRangeByExampleKey[this.exampleSelectedKey] = { ...timeRangeInitialByExampleKey[this.exampleSelectedKey] };
      return { code: 0 };
    }
    if (eventType === 'timeRangeChange') {
      this.timeRangeByExampleKey[this.exampleSelectedKey] = {
        timeStart: new Date(eventData.timeStart),
        timeEnd: new Date(eventData.timeEnd),
      };
      return { code: 0 };
    }
    if (eventType === 'eventSelect') {
      const eventId = String(eventData.eventId || '');
      this.eventSelectedId = eventId === this.eventSelectedId ? '' : eventId;
      this.aggregateSelectedEventIdList = [];
      return { code: 0 };
    }
    if (eventType === 'aggregateSelect') {
      this.aggregateSelectedEventIdList = [...(eventData.eventIdList || [])];
      this.eventSelectedId = '';
      return { code: 0 };
    }
    if (eventType === 'labelChannelHeightLimitToggle') {
      this.isLabelChannelHeightLimited = !this.isLabelChannelHeightLimited;
      return { code: 0 };
    }
    if (eventType === 'timelinePlay') {
      this.isTimelineVisible = true;
      return { code: 0 };
    }
    return { code: 1, message: `Unsupported event: ${eventType}` };
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function eventBuild(id, name, timeStart, timeEnd, tone) {
  return { id, name, timeStart, timeEnd, tone };
}

function createStoreTimelineEventExample() {
  return new StoreTimelineEventExample();
}

export { createStoreTimelineEventExample, exampleList };
export default StoreTimelineEventExample;
