import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import {
  CompDemoArea,
  Controls,
  DemoPanel,
  Example,
  Explanation,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import TimelineLinear from './Timeline.jsx';
import TimelineLinearSmooth from './TimelineSmooth.jsx';
import TimelineCardExceptionContent from './TimelineCardExceptionContent.jsx';
import TimelineCardFieldStatusTableContent from './TimelineCardFieldStatusTableContent.jsx';
import TimelineCardQueryContent from './TimelineCardQueryContent.jsx';
import TimelineCardRecordContent from './TimelineCardRecordContent.jsx';
import TimelineCardSubstepContent from './TimelineCardSubstepContent.jsx';
import StoreTimelineLinearExample from './exampleTimelineStore.js';
import './exampleTimeline.css';

const rendererByContentType = {
  record: ({ itemData }) => <TimelineCardRecordContent itemData={itemData} />,
  query: ({ itemData }) => <TimelineCardQueryContent itemData={itemData} />,
  fieldStatusTable: ({ itemData }) => <TimelineCardFieldStatusTableContent itemData={itemData} />,
  exception: ({ itemData }) => <TimelineCardExceptionContent itemData={itemData} />,
  substepList: ({ itemData }) => <TimelineCardSubstepContent itemData={itemData} />,
};

const scenarioList = [
  {
    key: 'success',
    title: 'Success workflow',
    explanation: 'Steps arrive one after another, from the source row through the chart payload.',
  },
  {
    key: 'failure',
    title: 'Timeout workflow',
    explanation: 'The detail request times out, later steps are skipped, and the workflow stops on an exception card.',
  },
  {
    key: 'burst',
    title: 'Burst workflow',
    explanation: 'The same success path commits updates in a shorter burst.',
  },
  {
    key: 'substep',
    title: 'Substep cards',
    explanation: 'One card lists every substep. The next card reveals each substep only when it starts.',
  },
];

const presentationList = [
  {
    key: 'direct',
    title: 'Direct updates',
    explanation: 'Each store change appears immediately. The frame stays a fixed height and the timeline scrolls inside it.',
  },
  {
    key: 'smooth',
    title: 'Smooth updates',
    explanation: 'New steps are queued and revealed one by one, so a burst does not jump the whole list at once.',
  },
];

const LinearCase = observer(function LinearCase({ title, explanation, scenarioKey, presentationKey, store }) {
  const storeLocal = useMemo(() => (store ? null : new StoreTimelineLinearExample()), [store]);
  const storeUsed = store || storeLocal;
  const TimelineComp = presentationKey === 'smooth' ? TimelineLinearSmooth : TimelineLinear;

  useEffect(() => () => storeLocal?.dispose(), [storeLocal]);

  return (
    <Example exampleId={`${presentationKey}-${scenarioKey}`} title={title}>
      <Explanation>{explanation}</Explanation>
      <Controls>
        <button
          type="button"
          className="demo-button progress-timeline-demo-play"
          disabled={storeUsed.isAddDisabled}
          onClick={() => storeUsed.handleEvent('timelinePlay', { scenarioKey })}
        >
          Play
        </button>
      </Controls>
      <CompDemoArea>
        <div className="progress-timeline-demo-frame">
          <TimelineComp
            data={storeUsed.timelineData}
            config={{ emptyText: 'Click Play to run this workflow.', isScrollBottomOnAdd: true, rendererByContentType }}
            onEvent={storeUsed.handleEvent}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Workflow: {storeUsed.workflowStatusText}</span>
        <span>Clicked card: {storeUsed.cardClickedId || 'none'}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ExampleTimeline = observer(function ExampleTimeline({ store }) {
  return (
    <DemoPanel>
      <Explanation>
        Each workflow is its own example. Nothing runs until Play. Direct and smooth presentations are separate so a running timeline does not resize the page or hide the other mode.
      </Explanation>
      {presentationList.map((presentationData) => (
        <ExampleGroup key={presentationData.key} title={presentationData.title}>
          <Explanation>{presentationData.explanation}</Explanation>
          <ExampleStackVertical>
            {scenarioList.map((scenarioData) => (
              <LinearCase
                key={`${presentationData.key}-${scenarioData.key}`}
                title={scenarioData.title}
                explanation={scenarioData.explanation}
                scenarioKey={scenarioData.key}
                presentationKey={presentationData.key}
                store={store?.storeByCaseKey?.[`${presentationData.key}-${scenarioData.key}`]}
              />
            ))}
          </ExampleStackVertical>
        </ExampleGroup>
      ))}
    </DemoPanel>
  );
});

export const timelineLinearExamples = {
  'Timeline Linear': {
    component: null,
    description: 'Vertical workflow timeline with pluggable card content and a smooth update variant',
    example: ExampleTimeline,
  },
};

export default ExampleTimeline;
