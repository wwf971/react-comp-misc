import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { CompDemoArea, ControlGroup, Controls, DemoPanel, Example, Explanation, MessageAndOutputs } from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import TimelineEvent from './TimelineEvent.jsx';
import { createStoreTimelineEventExample, exampleList } from './exampleTimelineEventStore.js';
import './exampleTimelineEvent.css';

const titleByExampleKey = {
  standard: 'Business day',
  multiDay: 'Multiple days',
  aggregate: 'Auto merge',
  overlap: 'Overlapping ranges',
};

function storeByExampleKeyCreate() {
  return Object.fromEntries(exampleList.map((exampleData) => {
    const store = createStoreTimelineEventExample();
    store.handleEvent('exampleSelect', { exampleKey: exampleData.key });
    return [exampleData.key, store];
  }));
}

const ExampleTimelineEvent = observer(function ExampleTimelineEvent({ store }) {
  const storeByExampleKeyLocal = useMemo(() => (store ? null : storeByExampleKeyCreate()), [store]);
  const storeByExampleKey = store?.storeByExampleKey || storeByExampleKeyLocal;
  return (
    <DemoPanel>
      <Explanation titleText="Event timeline">
        Each layout case is shown on its own, inside a fixed-height frame. Click Play to mount that timeline. Drag empty space to pan, and use the mouse wheel to zoom. Channel lanes use greedy interval partitioning; labels keep their event anchors and take the first row that does not overlap.
      </Explanation>
      <ExampleGroup title="Layout cases">
        <ExampleStackVertical>
          {exampleList.map((exampleData) => (
            <TimelineEventCase
              key={exampleData.key}
              title={titleByExampleKey[exampleData.key]}
              description={exampleData.description}
              store={storeByExampleKey[exampleData.key]}
            />
          ))}
        </ExampleStackVertical>
      </ExampleGroup>
    </DemoPanel>
  );
});

const TimelineEventCase = observer(function TimelineEventCase({ title, description, store }) {
  return (
    <Example exampleId={store.exampleSelectedKey} title={title}>
      <Explanation>{description}</Explanation>
      <Controls>
        <button
          type="button"
          className="demo-button timeline-event-demo-play"
          disabled={store.isTimelineVisible}
          onClick={() => store.handleEvent('timelinePlay')}
        >
          Play
        </button>
        <ControlGroup labelText="Visible range">
          <button type="button" className="timeline-event-demo-reset-button" onClick={() => store.handleEvent('timeRangeReset')}>
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M3.25 5.25A5.5 5.5 0 1 1 2.8 9.6M3.25 5.25V1.9M3.25 5.25H6.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Reset range</span>
          </button>
        </ControlGroup>
        <ControlGroup labelText="Tag channel">
          <label className="timeline-event-demo-checkbox">
            <input type="checkbox" checked={store.isLabelChannelHeightLimited} onChange={() => store.handleEvent('labelChannelHeightLimitToggle')} />
            <span>Limit height and scroll</span>
          </label>
        </ControlGroup>
      </Controls>
      <CompDemoArea footText="Drag to pan and use the mouse wheel to zoom.">
        <div className="timeline-event-demo-frame">
          {store.isTimelineVisible ? (
            <TimelineEvent data={store.timelineData} config={store.timelineConfig} onEvent={store.handleEvent} />
          ) : (
            <div className="timeline-event-demo-frame-idle">Click Play to show this timeline.</div>
          )}
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Visible: {store.rangeText}</span>
        <span>{store.statusText}</span>
      </MessageAndOutputs>
    </Example>
  );
});

export const timelineEventExamples = {
  'Timeline Event': {
    component: null,
    description: 'Horizontal event timeline with pan, zoom, overlap layout, and resolution-based merging',
    example: ExampleTimelineEvent,
  },
};

export default ExampleTimelineEvent;
