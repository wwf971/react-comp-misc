import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import ScrollHorizontal from './ScrollHorizontal.jsx';
import { createStoreScrollHorizontalExample } from './exampleScrollHorizontalStore.js';
import './exampleScrollHorizontal.css';

const actionTextList = ['Refresh', 'Duplicate', 'Archive', 'Compare', 'Export CSV', 'Export JSON', 'Open history'];
const itemList = Array.from({ length: 10 }, (_, index) => ({
  id: `item-${index + 1}`,
  labelText: `Result ${String(index + 1).padStart(2, '0')}`,
  detailText: `${12 + index * 3} records`,
}));

const ExampleScrollHorizontal = observer(function ExampleScrollHorizontal() {
  const store = useMemo(() => createStoreScrollHorizontalExample(), []);
  const eventHandle = (scrollId) => (eventType, eventData) => store.handleEvent(eventType, { ...eventData, scrollId });

  return (
    <div className="scroll-horizontal-demo">
      <section className="scroll-horizontal-demo-section" aria-label="Horizontal action list example">
        <div className="scroll-horizontal-demo-title">Button row</div>
        <div className="scroll-horizontal-demo-hint">Hover this narrow viewport and use the mouse wheel.</div>
        <ScrollHorizontal
          data={{
            scrollLeft: store.scrollStateById.action.scrollLeft,
            content: actionTextList.map((actionText) => (
              <button
                key={actionText}
                type="button"
                className="scroll-horizontal-demo-button"
                onClick={() => store.handleEvent('actionSelect', { actionText })}
              >
                {actionText}
              </button>
            )),
          }}
          config={{ className: 'scroll-horizontal-demo-scroll', classNameTrack: 'scroll-horizontal-demo-action-track', ariaLabel: 'Scrollable actions' }}
          onEvent={eventHandle('action')}
        />
      </section>

      <section className="scroll-horizontal-demo-section" aria-label="Horizontal arbitrary content example">
        <div className="scroll-horizontal-demo-title">Arbitrary content row</div>
        <ScrollHorizontal
          data={{
            scrollLeft: store.scrollStateById.item.scrollLeft,
            content: itemList.map((itemData) => (
              <button
                key={itemData.id}
                type="button"
                className={`scroll-horizontal-demo-item${itemData.id === store.itemActiveId ? ' is-active' : ''}`}
                onClick={() => store.handleEvent('itemSelect', { itemId: itemData.id })}
              >
                <strong>{itemData.labelText}</strong>
                <span>{itemData.detailText}</span>
              </button>
            )),
          }}
          config={{ className: 'scroll-horizontal-demo-scroll', classNameTrack: 'scroll-horizontal-demo-item-track', ariaLabel: 'Scrollable result summaries' }}
          onEvent={eventHandle('item')}
        />
      </section>

      <div className="scroll-horizontal-demo-state" aria-label="Example state">
        <span>Action: {store.actionText}</span>
        <span>Selected: {store.itemActiveId}</span>
      </div>
    </div>
  );
});

export default ExampleScrollHorizontal;
