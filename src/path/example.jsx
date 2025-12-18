import { useState } from 'react';
import PathBar from './PathBar.tsx';

export const pathExamples = {
  'PathBar': {
    component: PathBar,
    description: 'Pure path bar component for displaying hierarchical paths with clickable segments',
    example: () => {
      const PathBarTest = () => {
        const [message, setMessage] = useState('');
        const [currentPath, setCurrentPath] = useState({
          segments: [
            { name: 'Users' },
            { name: 'timwang' },
            { name: 'Documents' },
            { name: 'Projects' },
            { name: 'myapp' }
          ]
        });

        const handleSegmentClick = (index) => {
          console.log('Segment clicked:', index);
          // Navigate to that segment by trimming the path
          const newSegments = currentPath.segments.slice(0, index + 1);
          setCurrentPath({ segments: newSegments });
          setMessage(`Navigated to: /${newSegments.map(s => s.name).join('/')}`);
        };

        const addSegment = () => {
          const newName = prompt('Enter new folder name:');
          if (newName) {
            setCurrentPath({
              segments: [...currentPath.segments, { name: newName }]
            });
            setMessage(`Added segment: ${newName}`);
          }
        };

        const goToRoot = () => {
          setCurrentPath({ segments: [] });
          setMessage('Navigated to root');
        };

        return (
          <div style={{ padding: '20px', maxWidth: '700px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Windows Style (with leading slash)</h4>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              addSlashBeforeFirstSeg={true}
              allowEdit={true}
            />

            <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Unix Style (no leading slash)</h4>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              addSlashBeforeFirstSeg={false}
              allowEdit={true}
            />

            <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Empty Path</h4>
            <PathBar
              pathData={{ segments: [] }}
              onPathSegClicked={(idx) => console.log('Clicked:', idx)}
              addSlashBeforeFirstSeg={false}
              allowEdit={true}
            />

            <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Read-only Mode (allowEdit={'{'}false{'}'})</h4>
            <PathBar
              pathData={currentPath}
              onPathSegClicked={handleSegmentClick}
              addSlashBeforeFirstSeg={false}
              allowEdit={false}
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={addSegment} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                Add Segment
              </button>
              <button onClick={goToRoot} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                Go to Root
              </button>
            </div>

            {message && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px', fontSize: '13px' }}>
                {message}
              </div>
            )}

            <div style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>
              <strong>Tips:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Click on any segment to navigate to that level</li>
                <li>Click on the empty space in the path bar (when allowEdit=true) to show the path as a string</li>
                <li>The string is auto-selected for easy copying (Cmd+C / Ctrl+C)</li>
                <li>Press Enter or Escape, or click outside to return to segment view</li>
                <li>Set allowEdit=false to disable text editing (useful for navigation-only scenarios)</li>
              </ul>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
              <strong>Current Path:</strong> {JSON.stringify(currentPath, null, 2)}
            </div>
          </div>
        );
      };
      return <PathBarTest />;
    }
  },
};

