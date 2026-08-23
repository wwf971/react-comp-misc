import { observer } from 'mobx-react-lite';
import NumValue from '../../component/button/NumValue.jsx';
import { ControlItem } from './DemoLayout.jsx';
import './DemoLayout.css';

// SimServerControl: standard tuning ui for a simulated server store
// (createStoreSimServer): average delay, fail rate, and live pending count.
// Place it at page level (directly under DemoPanel), group level (inside the
// group Controls), or example level (inside the example Controls); pass the
// same store to every example the control should govern.
const SimServerControl = observer(({ labelText = 'Sim server', store }) => (
  <div className="demo-sim-server">
    <span className="demo-sim-server-label">{labelText}</span>
    <ControlItem labelText="delay:">
      <NumValue
        data={{ value: store.delayAvgMs }}
        config={{ min: 0, max: 5000, step: 50, unitText: 'ms' }}
        onEvent={(eventType, eventData) => {
          if (eventType === 'valueChangeAttempt') store.handleEvent('delayAvgMsSet', { delayAvgMs: eventData.value });
        }}
      />
    </ControlItem>
    <ControlItem labelText="fail:">
      <NumValue
        data={{ value: store.failRatePercent }}
        config={{ min: 0, max: 100, step: 5, unitText: '%' }}
        onEvent={(eventType, eventData) => {
          if (eventType === 'valueChangeAttempt') store.handleEvent('failRatePercentSet', { failRatePercent: eventData.value });
        }}
      />
    </ControlItem>
    <span className={`demo-sim-server-pending${store.requestPendingCount ? ' is-busy' : ''}`}>
      pending: {store.requestPendingCount}
    </span>
  </div>
));

export { SimServerControl };
export default SimServerControl;
