import React from 'react';
import { observer } from 'mobx-react-lite';
import SpinningCircle from '../../icon/SpinningCircle';
import './folder.css';

const StatusBar = observer(({
  data = {},
  config = {},
}) => {
  const itemCount = data?.itemCount ?? 0;
  const messageState = data?.messageState ?? null;
  const isItemCountVisible = config?.isItemCountVisible !== false;

  const getStatusContent = () => {
    if (messageState?.status === 'error') {
      return (
        <div className="folder-statusbar-content error">
          {messageState.messageText || 'Operation failed'}
        </div>
      );
    }

    if (messageState?.status === 'loading') {
      return (
        <div className="folder-statusbar-content loading">
          <SpinningCircle width={14} height={14} color="#666" />
          <span>{messageState.messageText || 'Processing request'}</span>
        </div>
      );
    }

    if (!isItemCountVisible) {
      return <div className="folder-statusbar-content folder-statusbar-content-idle" />;
    }

    return (
      <div className="folder-statusbar-content">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </div>
    );
  };

  const isError = messageState?.status === 'error';

  return (
    <div className={`folder-statusbar ${isError ? 'has-error' : ''}`}>
      {getStatusContent()}
    </div>
  );
});

export default StatusBar;
