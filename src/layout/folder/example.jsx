import React, { useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import FolderView from './FolderView';
import InfoIconWithTooltip from '../../icon/InfoIconWithTooltip';
import './folder.css';

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
 * Example file icon component
 */
const FileNameCell = observer(({ data }) => {
  const iconMap = {
    folder: '📁',
    file: '📄',
    image: '🖼️',
    code: '💻'
  };
  
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>{iconMap[data.type] || '📄'}</span>
      <span>{data.name}</span>
    </span>
  );
});

/**
 * Shared example component for all folder components
 */
const FolderExamplesPanel = observer(() => {
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

  // Example 3: Full FolderView with rows
  const [folderData] = useState(() => {
    return makeAutoObservable({
      columns: {
        name: { data: 'Name', align: 'left' },
        size: { data: 'Size', align: 'right' },
        type: { data: 'Type', align: 'left' },
        modified: { data: 'Modified', align: 'left' }
      },
      columnsOrder: ['name', 'size', 'type', 'modified'],
      columnsSize: {
        name: { width: 250, minWidth: 100, resizable: true },
        size: { width: 100, minWidth: 60, resizable: true },
        type: { width: 120, minWidth: 80, resizable: true },
        modified: { width: 180, minWidth: 100, resizable: true }
      },
      rows: [
        { id: 1, data: { name: { type: 'folder', name: 'Documents' }, size: '4 items', type: 'Folder', modified: '2026-02-01 10:30' } },
        { id: 2, data: { name: { type: 'folder', name: 'Pictures' }, size: '12 items', type: 'Folder', modified: '2026-02-03 14:22' } },
        { id: 3, data: { name: { type: 'code', name: 'App.jsx' }, size: '4.2 KB', type: 'JavaScript', modified: '2026-02-08 09:15' } },
        { id: 4, data: { name: { type: 'code', name: 'styles.css' }, size: '1.8 KB', type: 'CSS', modified: '2026-02-07 16:45' } },
        { id: 5, data: { name: { type: 'image', name: 'logo.png' }, size: '24.5 KB', type: 'PNG Image', modified: '2026-01-28 11:20' } },
        { id: 6, data: { name: { type: 'file', name: 'README.md' }, size: '2.1 KB', type: 'Markdown', modified: '2026-02-05 13:10' } },
        { id: 7, data: { name: { type: 'file', name: 'package.json' }, size: '856 B', type: 'JSON', modified: '2026-02-06 08:30' } },
      ],
      selectedRowId: null,
      loading: false,
      loadingMessage: '',
      error: null
    });
  });

  const getComponent = (columnId, rowId) => {
    // All columns use the same custom component with tooltip
    // rowId is available but not used in this header example
    return TextWithInfoIconComp;
  };

  const getBodyComponent = (columnId, rowId) => {
    if (columnId === 'name') {
      return FileNameCell;
    }
    return undefined;
  };

  const handleColumnResize = (columnId, newWidth) => {
    console.log(`Column ${columnId} resized to ${newWidth}px`);
    // Update columnsSize in MobX store
    if (!basicData.columnsSize[columnId]) {
      basicData.columnsSize[columnId] = {};
    }
    basicData.columnsSize[columnId].width = newWidth;
  };

  const handleBasicDataChangeRequest = async (type, params) => {
    if (type === 'reorder') {
      // Column reorder for basic header
      console.log(`Column reorder: colId=${params.columnId}, from=${params.fromIndex}, to=${params.toIndex}`);
      
      // Simulate async API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        // Success - update the MobX observable array
        basicData.columnsOrder.replace(params.newOrder);
        
        console.log('Column reorder successful');
        return { code: 0, message: 'Column reordered successfully' };
      } else {
        // Simulate error
        console.error('Column reorder failed');
        return { code: -1, message: 'Failed to reorder column' };
      }
    }
  };

  const handleFolderColumnResize = (columnId, newWidth) => {
    console.log(`Folder column ${columnId} resized to ${newWidth}px`);
    if (!folderData.columnsSize[columnId]) {
      folderData.columnsSize[columnId] = {};
    }
    folderData.columnsSize[columnId].width = newWidth;
  };

  const handleFolderDataChangeRequest = async (type, params) => {
    if (type === 'reorder') {
      // Check if it's column or row reorder based on params
      if (params.columnId !== undefined) {
        // Column reorder
        console.log(`Folder column reorder: colId=${params.columnId}, from=${params.fromIndex}, to=${params.toIndex}`);
        
        // Set loading state
        folderData.loading = true;
        folderData.loadingMessage = 'Reordering column';
        folderData.error = null;
        
        // Simulate async API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          // Success - update the MobX observable array
          folderData.columnsOrder.replace(params.newOrder);
          folderData.loading = false;
          
          console.log('Folder column reorder successful');
          return { code: 0, message: 'Column reordered successfully' };
        } else {
          // Simulate error
          console.error('Folder column reorder failed');
          folderData.loading = false;
          folderData.error = { message: 'Failed to reorder column' };
          
          // Clear error after 1 second
          setTimeout(() => {
            folderData.error = null;
          }, 1000);
          
          return { code: -1, message: 'Failed to reorder column' };
        }
      } else if (params.rowId !== undefined) {
        // Row reorder
        console.log(`Row reorder: rowId=${params.rowId}, from=${params.fromIndex}, to=${params.toIndex}`);
        
        // Set loading state
        folderData.loading = true;
        folderData.loadingMessage = 'Reordering row';
        folderData.error = null;
        
        // Simulate async API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          // Success - update the MobX observable array
          const newRows = [...folderData.rows];
          const [movedRow] = newRows.splice(params.fromIndex, 1);
          newRows.splice(params.toIndex, 0, movedRow);
          folderData.rows.replace(newRows);
          folderData.loading = false;
          
          console.log('Row reorder successful');
          return { code: 0, message: 'Row reordered successfully' };
        } else {
          // Simulate error
          console.error('Row reorder failed');
          folderData.loading = false;
          folderData.error = { message: 'Failed to reorder row' };
          
          // Clear error after 1 second
          setTimeout(() => {
            folderData.error = null;
          }, 1000);
          
          return { code: -1, message: 'Failed to reorder row' };
        }
      }
    } else if (type === 'delete') {
      // Row delete
      console.log(`Row delete: rowId=${params.rowId}`);
      
      // Set loading state
      folderData.loading = true;
      folderData.loadingMessage = 'Deleting row';
      folderData.error = null;
      
      // Simulate async API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        // Success - remove from MobX observable array
        const newRows = folderData.rows.filter(row => row.id !== params.rowId);
        folderData.rows.replace(newRows);
        
        // Clear selection if deleted row was selected
        if (folderData.selectedRowId === params.rowId) {
          folderData.selectedRowId = null;
        }
        
        folderData.loading = false;
        
        console.log('Row delete successful');
        return { code: 0, message: 'Row deleted successfully' };
      } else {
        // Simulate error
        console.error('Row delete failed');
        folderData.loading = false;
        folderData.error = { message: 'Failed to delete row' };
        
        // Clear error after 1 second
        setTimeout(() => {
          folderData.error = null;
        }, 1000);
        
        return { code: -1, message: 'Failed to delete row' };
      }
    }
  };

  const handleRowClick = (rowId) => {
    console.log('Row clicked:', rowId);
    folderData.selectedRowId = rowId;
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
            onDataChangeRequest={handleBasicDataChangeRequest}
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

      {/* Full FolderView Example */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Complete FolderView with Body</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          File explorer layout. Drag rows to reorder. Right-click rows to delete. Resize and reorder columns. Status bar shows operations. Body locked during requests.
        </div>
        <FolderView 
          columns={folderData.columns}
          columnsOrder={folderData.columnsOrder}
          columnsSize={folderData.columnsSize}
          rows={folderData.rows}
          getBodyComponent={getBodyComponent}
          allowColumnReorder={true}
          allowRowReorder={true}
          onColumnResize={handleFolderColumnResize}
          onDataChangeRequest={handleFolderDataChangeRequest}
          onRowClick={handleRowClick}
          selectedRowId={folderData.selectedRowId}
          loading={folderData.loading}
          loadingMessage={folderData.loadingMessage}
          error={folderData.error}
          bodyHeight={300}
        />
      </div>
    </div>
  );
});

export const folderExamples = {
  'Folder': {
    component: null,
    description: 'Folder view components with resizable headers',
    example: () => <FolderExamplesPanel />
  }
};
