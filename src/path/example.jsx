import { useState } from 'react';
import PathBar from './PathBar.jsx';
import './example.css';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const ServerResponseLine = ({ value }) => {
  if (value == null) {
    return <div className="path-example-server-line path-example-server-line-placeholder" />;
  }
  const className = value.ok
    ? 'path-example-server-line path-example-server-line-success'
    : 'path-example-server-line path-example-server-line-failure';
  return <div className={className}>{value.text}</div>;
};

export const pathExamples = {
  PathBar: {
    component: PathBar,
    description:
      'Path bar with segment navigation, string edit (Enter or blur to commit), async commit and lock spinner',
    example: () => {
      const PathBarTest = () => {
        const [activityNote, setActivityNote] = useState('');
        const [newSegmentName, setNewSegmentName] = useState('');
        const [emptyDemoPath, setEmptyDemoPath] = useState({ segments: [] });
        const [serverWindows, setServerWindows] = useState(null);
        const [serverUnix, setServerUnix] = useState(null);
        const [serverEmpty, setServerEmpty] = useState(null);
        const [currentPath, setCurrentPath] = useState({
          segments: [
            { name: 'Users' },
            { name: 'timwang' },
            { name: 'Documents' },
            { name: 'Projects' },
            { name: 'myapp' }
          ]
        });

        const makeSharedPathCommit = (setServerLine) => async (newPathData) => {
          await delay(500);
          if (newPathData.segments.some((s) => s.name === 'invalid')) {
            setServerLine({
              ok: false,
              text: 'Server rejected: invalid path (segment name "invalid" is not allowed).'
            });
            return false;
          }
          if (Math.random() < 0.35) {
            setServerLine({
              ok: false,
              text: 'Server rejected: path does not exist on the server.'
            });
            return false;
          }
          setCurrentPath(newPathData);
          setServerLine({
            ok: true,
            text: 'Server OK: path change accepted.'
          });
          return true;
        };

        const handlePathCommitWindows = makeSharedPathCommit(setServerWindows);
        const handlePathCommitUnix = makeSharedPathCommit(setServerUnix);

        const handleEmptyCommit = async (data) => {
          await delay(400);
          if (data.segments.some((s) => s.name === 'invalid')) {
            setServerEmpty({
              ok: false,
              text: 'Server rejected: invalid path (segment name "invalid" is not allowed).'
            });
            return false;
          }
          if (Math.random() < 0.35) {
            setServerEmpty({
              ok: false,
              text: 'Server rejected: path does not exist on the server.'
            });
            return false;
          }
          setEmptyDemoPath(data);
          setServerEmpty({
            ok: true,
            text: 'Server OK: path change accepted.'
          });
          return true;
        };

        const handleSegmentClick = (index) => {
          const newSegments = currentPath.segments.slice(0, index + 1);
          setCurrentPath({ segments: newSegments });
          setActivityNote(`Navigated to: /${newSegments.map((s) => s.name).join('/')}`);
        };

        const addSegment = () => {
          const name = newSegmentName.trim();
          if (!name) return;
          setCurrentPath({
            segments: [...currentPath.segments, { name }]
          });
          setNewSegmentName('');
          setActivityNote(`Added segment: ${name}`);
        };

        const goToRoot = () => {
          setCurrentPath({ segments: [] });
          setActivityNote('Navigated to root');
        };

        return (
          <div className="path-example-root">
            <div className="path-example-section-title">Windows style (leading slash)</div>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              onPathChangeCommit={handlePathCommitWindows}
              hasLeadingSlash={true}
              allowEditText={true}
            />
            <ServerResponseLine value={serverWindows} />

            <div className="path-example-section-title path-example-section-title-spaced">Unix style (no leading slash)</div>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              onPathChangeCommit={handlePathCommitUnix}
              hasLeadingSlash={false}
              allowEditText={true}
            />
            <ServerResponseLine value={serverUnix} />

            <div className="path-example-section-title path-example-section-title-spaced">Empty path</div>
            <PathBar
              pathData={emptyDemoPath}
              onPathSegClicked={(idx) => setActivityNote(`Clicked segment index: ${idx}`)}
              onPathChangeCommit={handleEmptyCommit}
              hasLeadingSlash={false}
              allowEditText={true}
            />
            <ServerResponseLine value={serverEmpty} />

            <div className="path-example-section-title path-example-section-title-spaced">Read-only (no onPathChangeCommit)</div>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              hasLeadingSlash={false}
              allowEditText={false}
            />

            <div className="path-example-controls">
              <input
                type="text"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                placeholder="New folder name"
                className="path-example-new-segment-input"
              />
              <button type="button" onClick={addSegment} className="path-example-button">
                Add segment
              </button>
              <button type="button" onClick={goToRoot} className="path-example-button">
                Go to root
              </button>
            </div>

            {activityNote ? <div className="path-example-activity-note">{activityNote}</div> : null}

            <div className="path-example-tips">
              <div className="path-example-tips-title">Tips</div>
              <div className="path-example-tips-body">
                <div>Click a segment to navigate up.</div>
                <div>Click empty bar area to edit the path string; Enter or blur commits.</div>
                <div>Backslashes normalize to slashes; repeated slashes collapse.</div>
                <div>Include segment name invalid for a deterministic invalid-path rejection.</div>
                <div>Random commits may fail with &quot;path does not exist&quot; (simulated server).</div>
                <div>Escape cancels edit without committing.</div>
              </div>
            </div>

            <div className="path-example-current-path">
              <span className="path-example-current-path-label">Current path: </span>
              <code className="path-example-current-path-code">{JSON.stringify(currentPath, null, 2)}</code>
            </div>
          </div>
        );
      };
      return <PathBarTest />;
    }
  }
};
