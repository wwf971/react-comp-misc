import React, { useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import InfoIconWithTooltip from '../../icon/InfoIconWithTooltip';
import './Header.css';

/**
 * Example custom component with text and info icon with tooltip
 */
const TextWithInfoIconComp = observer(({ data }) => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>{data.text}</span>
      <InfoIconWithTooltip 
        tooltipText={data.tooltip}
        width={14}
        height={14}
        color="#999"
      />
    </span>
  );
});

/**
 * Shared example component for all folder components
 */
const FolderExamplesPanel = () => {
  // Example 1: Basic header without custom components
  const [basicData] = useState(() => {
    return makeAutoObservable({
      columns: {
        name: { data: 'Name', align: 'left' },
        size: { data: 'Size', align: 'right' },
        createAt: { data: 'Created', align: 'left' },
        modifyAt: { data: 'Modified', align: 'left' }
      },
      columnsOrder: ['name', 'size', 'createAt', 'modifyAt'],
      columnsSize: {
        name: { width: 200, minWidth: 80, resizable: true },
        size: { width: 100, minWidth: 60, resizable: true },
        createAt: { width: 150, resizable: true },
        modifyAt: { width: 150, resizable: true }
      }
    });
  });

  // Example 2: Header with custom components (info icon tooltips)
  const [customData] = useState(() => {
    return makeAutoObservable({
      columns: {
        name: { 
          data: { text: 'File Name', tooltip: 'The name of the file or folder' },
          align: 'left' 
        },
        size: { 
          data: { text: 'Size', tooltip: 'File size in bytes' },
          align: 'right' 
        },
        modified: { 
          data: { text: 'Last Modified', tooltip: 'Date and time of last modification' },
          align: 'left' 
        }
      },
      columnsOrder: ['name', 'size', 'modified'],
      columnsSize: {
        name: { width: 200, minWidth: 100, resizable: true },
        size: { width: 120, minWidth: 80, resizable: true },
        modified: { width: 200, minWidth: 100, resizable: true }
      }
    });
  });

  const getComponent = (columnId) => {
    // All columns use the same custom component with tooltip
    return TextWithInfoIconComp;
  };

  const handleColumnResize = (columnId, newWidth) => {
    console.log(`Column ${columnId} resized to ${newWidth}px`);
  };

  const handleColumnReorder = (newOrder) => {
    console.log('New column order:', newOrder);
    // Use array replacement to trigger MobX reactivity
    basicData.columnsOrder.replace(newOrder);
  };

  return (
    <div>
      {/* Basic Example */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Basic Header</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag column cells to reorder. Drag separators to resize. Blue line shows drop position.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header 
            columns={basicData.columns}
            columnsOrder={basicData.columnsOrder}
            columnsSize={basicData.columnsSize}
            allowColumnReorder={true}
            onColumnResize={handleColumnResize}
            onColumnReorder={handleColumnReorder}
          />
        </div>
      </div>

      {/* Custom Components Example */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Header with Custom Components</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          All columns use custom component with info icon tooltips. Hover over icons to see descriptions.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header 
            columns={customData.columns}
            columnsOrder={customData.columnsOrder}
            columnsSize={customData.columnsSize}
            getComponent={getComponent}
            onColumnResize={handleColumnResize}
          />
        </div>
      </div>
    </div>
  );
};

export const folderExamples = {
  'Folder': {
    component: null,
    description: 'Folder view components with resizable headers',
    example: () => <FolderExamplesPanel />
  }
};
