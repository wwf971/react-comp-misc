import React from 'react';
import { observer } from 'mobx-react-lite';
import SpinningCircle from '../../icon/SpinningCircle';
import './folder.css';

/**
 * StatusBar - Shows status information at the bottom of FolderView
 * 
 * Props:
 * - itemCount: number of items
 * - loading: boolean indicating if a request is in progress
 * - loadingMessage: message to show when loading (optional)
 * - error: error object { message: string } or null
 * - showStatusItemCount: when false, idle state keeps bar height but omits item count (e.g. count shown elsewhere)
 */
const StatusBar = observer(({ 
  itemCount = 0,
  loading = false,
  loadingMessage = 'Processing request',
  error = null,
  showStatusItemCount = true,
}) => {
  
  const getStatusContent = () => {
    // Show error with red styling
    if (error) {
      return (
        <div className="folder-statusbar-content error">
          {error.message || 'Operation failed'}
        </div>
      );
    }
    
    // Show loading state
    if (loading) {
      return (
        <div className="folder-statusbar-content loading">
          <SpinningCircle width={14} height={14} color="#666" />
          <span>{loadingMessage}</span>
        </div>
      );
    }
    
    if (!showStatusItemCount) {
      return <div className="folder-statusbar-content folder-statusbar-content-idle" />;
    }
    return (
      <div className="folder-statusbar-content">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </div>
    );
  };
  
  return (
    <div className={`folder-statusbar ${error ? 'has-error' : ''}`}>
      {getStatusContent()}
    </div>
  );
});

export default StatusBar;
