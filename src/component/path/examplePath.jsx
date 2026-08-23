import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import PathBar from './PathBar.jsx';
import { createStorePathExample } from './examplePathStore.js';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
  JsonDisplay,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import { createStoreSimServer } from '../../dev/demo/simServerStore.js';
import SimServerControl from '../../dev/demo/SimServerControl.jsx';
import './example.css';

const ServerResponseLine = ({ value }) => {
  if (value == null) {
    return <span className="path-example-server-line path-example-server-line-placeholder"> </span>;
  }
  const className = value.ok
    ? 'path-example-server-line path-example-server-line-success'
    : 'path-example-server-line path-example-server-line-failure';
  return <span className={className}>{value.text}</span>;
};

const PathBarExamplesPanel = observer(function PathBarExamplesPanel() {
  const storeSimServer = useMemo(() => createStoreSimServer({ delayAvgMs: 500, failRatePercent: 35 }), []);
  const store = useMemo(() => createStorePathExample({ storeSimServer }), [storeSimServer]);

  return (
    <DemoPanel>
      <Explanation titleText="PathBar">
        Path bar with segment navigation, string edit (Enter or blur to commit), async commit with lock spinner, and simulated server round trips.
      </Explanation>

      <SimServerControl labelText="Sim server" store={storeSimServer} />

      <Controls>
        <ControlItem labelText="New segment:">
          <input
            type="text"
            value={store.newSegmentName}
            onChange={(event) => store.newSegmentNameSet(event.target.value)}
            placeholder="New folder name"
            className="path-example-new-segment-input"
          />
        </ControlItem>
        <ControlItem>
          <button type="button" onClick={() => store.segmentAdd()} className="path-example-button">
            Add segment
          </button>
          <button type="button" onClick={() => store.goToRoot()} className="path-example-button">
            Go to root
          </button>
        </ControlItem>
      </Controls>

      <ExampleGroup title="Path styles">
        <ExampleStackVertical>
          <Example title="Windows style (leading slash)">
            <CompDemoArea>
              <PathBar
                pathData={store.currentPath}
                onPathSegClicked={(index) => store.segmentNavigate(index)}
                onPathChangeCommit={(pathData) => store.pathCommitWindows(pathData)}
                hasLeadingSlash={true}
                allowEditText={true}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Server:">
              <ServerResponseLine value={store.serverWindows} />
            </MessageAndOutputs>
          </Example>

          <Example title="Unix style (no leading slash)">
            <CompDemoArea>
              <PathBar
                pathData={store.currentPath}
                onPathSegClicked={(index) => store.segmentNavigate(index)}
                onPathChangeCommit={(pathData) => store.pathCommitUnix(pathData)}
                hasLeadingSlash={false}
                allowEditText={true}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Server:">
              <ServerResponseLine value={store.serverUnix} />
            </MessageAndOutputs>
          </Example>

          <Example title="Empty path">
            <CompDemoArea>
              <PathBar
                pathData={store.emptyDemoPath}
                onPathSegClicked={(index) => store.activityNoteSet(`Clicked segment index: ${index}`)}
                onPathChangeCommit={(pathData) => store.pathCommitEmpty(pathData)}
                hasLeadingSlash={false}
                allowEditText={true}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Server:">
              <ServerResponseLine value={store.serverEmpty} />
            </MessageAndOutputs>
          </Example>

          <Example title="Read-only (no onPathChangeCommit)">
            <Explanation>
              Without onPathChangeCommit, the path string cannot be edited; segment clicks still navigate.
            </Explanation>
            <CompDemoArea>
              <PathBar
                pathData={store.currentPath}
                onPathSegClicked={(index) => store.segmentNavigate(index)}
                hasLeadingSlash={false}
                allowEditText={false}
              />
            </CompDemoArea>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>

      <MessageAndOutputs labelText="Activity:">
        {store.activityNote ? <span>{store.activityNote}</span> : <span>No activity yet</span>}
      </MessageAndOutputs>

      <MessageAndOutputs labelText="Current path:">
        <JsonDisplay data={store.currentPath} />
      </MessageAndOutputs>

      <Explanation tone="amber" titleText="Tips">
        <ul>
          <li>Click a segment to navigate up.</li>
          <li>Click empty bar area to edit the path string; Enter or blur commits.</li>
          <li>Backslashes normalize to slashes; repeated slashes collapse.</li>
          <li>Include segment name <strong>invalid</strong> for a deterministic invalid-path rejection.</li>
          <li>Random commits may fail with &quot;path does not exist&quot; (simulated server fail rate above).</li>
          <li>Escape cancels edit without committing.</li>
        </ul>
      </Explanation>
    </DemoPanel>
  );
});

export const pathExamples = {
  PathBar: {
    component: PathBar,
    description:
      'Path bar with segment navigation, string edit (Enter or blur to commit), async commit and lock spinner',
    example: PathBarExamplesPanel,
  },
};

export default PathBarExamplesPanel;
