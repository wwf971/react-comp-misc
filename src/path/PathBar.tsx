import React, { useRef, useState } from 'react';
import './PathBar.css';

/**
 * Path segment interface - can contain additional data beyond name
 */
export interface PathSegment {
  name: string;
  id?: string;
  [key: string]: any;  // Allow additional properties
}

/**
 * Path data structure
 */
export interface PathData {
  segments: PathSegment[];
}

/**
 * A pure, reusable path bar component for displaying hierarchical paths
 */
interface PathBarProps {
  pathData?: PathData;
  onPathSegClicked?: (segmentIndex: number) => void;
  addSlashBeforeFirstSeg?: boolean;
  allowEditText?: boolean;  // Allow clicking to edit path as text
  height?: number;  // Height of the path bar
  separator?: string;  // What to display between segments (default: '/')
}

const PathBar: React.FC<PathBarProps> = ({ 
  pathData = { segments: [] }, 
  onPathSegClicked, 
  addSlashBeforeFirstSeg = false,
  allowEditText = true,
  height = 32,
  separator = '/'
}) => {
  const [isDisplayAsStr, setIsDisplayAsStr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const segments = pathData.segments || [];

  // Build the full path string
  const buildPathString = (): string => {
    if (segments.length === 0) {
      return addSlashBeforeFirstSeg ? '/' : '';
    }
    const pathStr = segments.map(seg => seg.name).join(separator);
    return addSlashBeforeFirstSeg ? '/' + pathStr : pathStr;
  };

  const handleSegmentClick = (index: number) => {
    if (onPathSegClicked) {
      onPathSegClicked(index);
    }
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only switch to string mode if allowEditText is true and clicking on the bar itself
    if (!allowEditText) return;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('pathbar-content') || 
        target.classList.contains('pathbar-container')) {
      setIsDisplayAsStr(true);
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  };

  const handleInputBlur = () => {
    setIsDisplayAsStr(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsDisplayAsStr(false);
    }
  };

  return (
    <div 
      className="pathbar-container" 
      style={{ height: `${height}px`, cursor: allowEditText ? 'text' : 'default'  }}
      onClick={handleBarClick}
    >
      {isDisplayAsStr ? (
        <input
          ref={inputRef}
          type="text"
          className="pathbar-input"
          value={buildPathString()}
          readOnly
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <div className="pathbar-content">
          {segments.length === 0 ? (
            <span className="pathbar-empty">{addSlashBeforeFirstSeg ? '/' : '(empty)'}</span>
          ) : (
            <>
              {addSlashBeforeFirstSeg && (
                <span className="pathbar-separator">/</span>
              )}
              {segments.map((segment, index) => (
                <React.Fragment key={segment.id || index}>
                  <span
                    className="pathbar-segment"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentClick(index);
                    }}
                  >
                    {segment.name}
                  </span>
                  {index < segments.length - 1 && separator && (
                    <span className="pathbar-separator">{separator}</span>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PathBar;

