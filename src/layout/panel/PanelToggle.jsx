import React, { useState } from 'react';
import { MinusIcon, PlusIcon } from '@wwf971/react-comp-misc';

const PanelToggle = ({ title, children, defaultExpanded = false, style }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Support slot-based title: if children is array with 2 elements, first is title slot
  const childrenArray = React.Children.toArray(children);
  const hasSlots = !title && childrenArray.length === 2;
  const titleSlot = hasSlots ? childrenArray[0] : null;
  const contentSlot = hasSlots ? childrenArray[1] : children;

  return (
    <div className="config-section" style={style}>
      <div style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}>
        {(title || titleSlot) && (
          <div 
            className="section-title" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <MinusIcon width={14} height={14} color="#666" strokeWidth={2} style={{ marginRight: '8px' }} />
            ) : (
              <PlusIcon width={14} height={14} color="#666" strokeWidth={2} style={{ marginRight: '8px' }} />
            )}
            {title || titleSlot}
          </div>
        )}
        <div style={{ display: isExpanded ? 'block' : 'none' }}>
          {contentSlot}
        </div>
      </div>
    </div>
  );
};

export default PanelToggle;
