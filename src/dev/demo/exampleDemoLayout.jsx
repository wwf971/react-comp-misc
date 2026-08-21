import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import BoolSlider from '../../component/button/BoolSlider.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  KeyChip,
  Controls,
  ControlGroup,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from './DemoLayout.jsx';
import {
  ExampleGroup,
  ExampleSwitcher,
  ExampleSwitchButtons,
  ExampleJumpLink,
  ExampleStackVertical,
} from './ExampleGroup.jsx';
import { createStoreExampleGroup } from './demoStores.js';
import { createStoreDemoLayoutExample, boxColorHexById, boxSizePxById } from './exampleDemoLayoutStore.js';
import './exampleDemoLayout.css';

const DemoLayoutExamplesPanel = observer(function DemoLayoutExamplesPanel() {
  const storeShared = useMemo(() => createStoreDemoLayoutExample(), []);
  const storeGroupSwitch = useMemo(() => createStoreExampleGroup({ groupId: 'tile-switch', exampleActiveId: 'tile-tall' }), []);

  return (
    <DemoPanel>
      <Explanation titleText="Demo layout components">
        <ul>
          <li>
            Each demo is one <strong>Example</strong> panel, composed of <strong>Explanation</strong>, <strong>Controls</strong>, <strong>CompDemoArea</strong> and <strong>MessageAndOutputs</strong> stacked inside.
          </li>
          <li>
            <strong>DemoPanel</strong> stacks example panels vertically; explanation like this block can appear at global level too.
          </li>
          <li>
            Related examples form an <strong>ExampleGroup</strong>, shown one at a time via <strong>ExampleSwitcher</strong>, or all at once via <strong>ExampleStackVertical</strong>.
          </li>
        </ul>
      </Explanation>

      <ExampleBoxTune store={storeShared} />

      <ExampleGroup title="ExampleGroup with ExampleSwitcher" store={storeGroupSwitch}>
        <Explanation>
          <ul>
            <li>
              The <ExampleJumpLink data={{ exampleId: 'tile-tall' }}>tall tile example</ExampleJumpLink> uses its own local store; its clicks do not affect other examples.
            </li>
            <li>
              The <ExampleJumpLink data={{ exampleId: 'tile-wide' }}>wide tile example</ExampleJumpLink> is much shorter, but the switcher keeps the height of the tallest child, so switching causes no height jitter.
            </li>
          </ul>
        </Explanation>
        <Controls>
          <ExampleSwitchButtons />
        </Controls>
        <ExampleSwitcher>
          <ExampleClickTile
            exampleId="tile-tall"
            labelText="Tall tile"
            title="Tall tile (local store)"
            tileId="tall"
            tileHeightPx={120}
            tileWidthPx={90}
          />
          <ExampleClickTile
            exampleId="tile-wide"
            labelText="Wide tile"
            title="Wide tile (local store)"
            tileId="wide"
            tileHeightPx={44}
            tileWidthPx={260}
          />
        </ExampleSwitcher>
      </ExampleGroup>

      <ExampleGroup title="ExampleStackVertical with a shared store">
        <Explanation>
          Both examples below receive the same store instance from the page; clicking either tile updates the store total shown by both. A jump link can also target an example in another group, like the <ExampleJumpLink data={{ exampleId: 'tile-wide', groupId: 'tile-switch' }}>wide tile example</ExampleJumpLink> above: the group above activates it and the page scrolls to it.
        </Explanation>
        <ExampleStackVertical>
          <ExampleClickTile title="Tile A (shared store)" tileId="stack-a" tileHeightPx={44} tileWidthPx={120} store={storeShared} />
          <Explanation>
            Explanation blocks can be interleaved between stacked examples, to introduce while giving examples.
          </Explanation>
          <ExampleClickTile title="Tile B (shared store)" tileId="stack-b" tileHeightPx={44} tileWidthPx={120} store={storeShared} />
        </ExampleStackVertical>
      </ExampleGroup>

      <Explanation tone="amber" titleText="Conventions">
        <ul>
          <li>
            An exampleXxx component accepts an optional <strong>store</strong> prop, and passes it to the demonstrated component inside CompDemoArea; when absent, the example creates its own local store with useMemo.
          </li>
          <li>
            All ui state, including control values and the active example of a switcher, lives in mobx stores, never in useState.
          </li>
          <li>
            <strong>ExampleJumpLink</strong> emits an exampleJumpRequest event; the nearest ExampleGroup store handles targets inside the group, unhandled requests bubble to the DemoPanel store (other groups, standalone examples), then to the onEvent prop of DemoPanel (future page level jumps).
          </li>
          <li>
            Explanation content is plain text for one-liners, or ul/li/strong for lists, plus <strong>KeyChip</strong> for keys, e.g. <KeyChip>Shift</KeyChip> + <KeyChip>Click</KeyChip>.
          </li>
        </ul>
      </Explanation>
    </DemoPanel>
  );
});

// Full anatomy example: Explanation + Controls + CompDemoArea + MessageAndOutputs.
const ExampleBoxTune = observer(function ExampleBoxTune({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreDemoLayoutExample()), [store]);
  const storeUsed = store || storeLocal;
  const box = storeUsed.box;

  return (
    <Example title="Example anatomy">
      <Explanation>
        <ul>
          <li>The buttons in <strong>Controls</strong> change the box in <strong>CompDemoArea</strong>; all state lives in the example store.</li>
          <li>Accepted changes are logged into <strong>MessageAndOutputs</strong>.</li>
        </ul>
      </Explanation>
      <Controls>
        <ControlGroup labelText="Color">
          {Object.keys(boxColorHexById).map((colorId) => (
            <button
              key={colorId}
              type="button"
              className={`demo-button${colorId === box.colorId ? ' is-active' : ''}`}
              onClick={() => storeUsed.handleEvent('boxColorSet', { colorId })}
            >
              {colorId}
            </button>
          ))}
        </ControlGroup>
        <ControlGroup labelText="Size">
          {Object.keys(boxSizePxById).map((sizeId) => (
            <button
              key={sizeId}
              type="button"
              className={`demo-button${sizeId === box.sizeId ? ' is-active' : ''}`}
              onClick={() => storeUsed.handleEvent('boxSizeSet', { sizeId })}
            >
              {sizeId}
            </button>
          ))}
        </ControlGroup>
        <ControlItem labelText="Rounded:">
          <BoolSlider
            checked={box.isRounded}
            onChange={(isRounded) => storeUsed.handleEvent('boxRoundedSet', { isRounded })}
          />
        </ControlItem>
      </Controls>
      <CompDemoArea>
        <div
          className="demo-layout-example-box"
          style={{
            width: boxSizePxById[box.sizeId],
            height: boxSizePxById[box.sizeId],
            background: boxColorHexById[box.colorId],
            borderRadius: box.isRounded ? '50%' : '3px',
          }}
        />
      </CompDemoArea>
      <MessageAndOutputs labelText="Log:">
        {storeUsed.logList.length
          ? storeUsed.logList.map((logItem) => <span key={logItem.id}>{logItem.text}</span>)
          : <span>No changes yet</span>}
      </MessageAndOutputs>
    </Example>
  );
});

// Minimal example used inside ExampleSwitcher and ExampleStackVertical.
// exampleId/labelText props are read by ExampleSwitcher, not used here.
const ExampleClickTile = observer(function ExampleClickTile({ title, tileId, tileHeightPx, tileWidthPx, store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreDemoLayoutExample()), [store]);
  const storeUsed = store || storeLocal;
  const clickCount = storeUsed.tileClicks.countById[tileId] || 0;

  return (
    <Example title={title}>
      <CompDemoArea>
        <button
          type="button"
          className="demo-layout-example-tile"
          style={{ width: tileWidthPx, height: tileHeightPx }}
          onClick={() => storeUsed.handleEvent('tileClickAdd', { tileId })}
        >
          Click me
        </button>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>this tile: {clickCount} clicks</span>
        <span>store total: {storeUsed.tileClicks.total} clicks</span>
      </MessageAndOutputs>
    </Example>
  );
});

export const demoLayoutExamples = {
  'Demo Layout': {
    component: null,
    description: 'Standard components for composing dev page demo examples',
    example: DemoLayoutExamplesPanel,
  },
};

export default DemoLayoutExamplesPanel;
