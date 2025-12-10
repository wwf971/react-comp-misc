import React, { useRef, useState } from 'react';
import './PathBar.css';

/**
 * A pure, reusable path bar component for displaying hierarchical paths
 * 
 * @param {Object} props
 * @param {Object} props.pathData - Path data object with segments array
 * @param {Array} props.pathData.segments - Array of segment objects, each with 'name' property
 * @param {Function} props.onPathSegClicked - Callback when a segment is clicked, receives (segmentIndex)
 * @param {boolean} props.addSlashBeforeFirstSeg - If true, adds '/' before the first segment (Windows style)
 */
const PathBar = ({ pathData = { segments: [] }, onPathSegClicked, addSlashBeforeFirstSeg = false }) => {
  const [isDisplayAsStr, setIsDisplayAsStr] = useState(false);
  const inputRef = useRef(null);

  const segments = pathData.segments || [];

  // Build the full path string
  const buildPathString = () => {
    if (segments.length === 0) {
      return addSlashBeforeFirstSeg ? '/' : '';
    }
    const pathStr = segments.map(seg => seg.name).join('/');
    return addSlashBeforeFirstSeg ? '/' + pathStr : pathStr;
  };

  const handleSegmentClick = (index) => {
    if (onPathSegClicked) {
      onPathSegClicked(index);
    }
  };

  const handleBarClick = (e) => {
    // Only switch to string mode if clicking on the bar itself, not on segments
    if (e.target.classList.contains('pathbar-content') || 
        e.target.classList.contains('pathbar-container')) {
      setIsDisplayAsStr(true);
      // Select text after state updates
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 0);
    }
  };

  const handleInputBlur = () => {
    setIsDisplayAsStr(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsDisplayAsStr(false);
    }
  };

  return (
    <div className="pathbar-container" onClick={handleBarClick}>
      {isDisplayAsStr ? (
        <input
          ref={inputRef}
          type="text"
          className="pathbar-input"
          value={buildPathString()}
          readOnly
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      ) : (
        <div className="pathbar-content">
          {addSlashBeforeFirstSeg && (
            <span className="pathbar-separator">/</span>
          )}
          {segments.length === 0 ? (
            <span className="pathbar-empty">{addSlashBeforeFirstSeg ? '/' : '(empty)'}</span>
          ) : (
            segments.map((segment, index) => (
              <React.Fragment key={index}>
                <span
                  className="pathbar-segment"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSegmentClick(index);
                  }}
                >
                  {segment.name}
                </span>
                {index < segments.length - 1 && (
                  <span className="pathbar-separator">/</span>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PathBar;

