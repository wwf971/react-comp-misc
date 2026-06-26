import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ViewSwitcher from './ViewSwitcher';
import StatusBar from './StatusBar';
import {
  buildColWidthByIdFromSize,
  emitFolderEvent,
  withResolvedColAlign,
} from './folderUtils.js';
import './folder.css';

const FolderView = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const columns = data?.columns;
  const colsOrder = data?.colsOrder || [];
  const colSizeById = config?.colSizeById || {};
  const colWidthByIdFromConfig = config?.colWidthById;

  const colWidthByIdBase = useMemo(
    () => buildColWidthByIdFromSize(colsOrder, colSizeById),
    [colsOrder, colSizeById],
  );

  const [internalColWidthById, setInternalColWidthById] = useState(() => colWidthByIdBase);

  const isColWidthControlled = colWidthByIdFromConfig !== undefined;
  const colWidthById = isColWidthControlled
    ? { ...colWidthByIdBase, ...colWidthByIdFromConfig }
    : internalColWidthById;

  useEffect(() => {
    if (isColWidthControlled) {
      return;
    }
    setInternalColWidthById(colWidthByIdBase);
  }, [colWidthByIdBase, isColWidthControlled]);

  const resolvedColumns = useMemo(() => withResolvedColAlign(columns), [columns]);

  const isLocked = config?.isLocked === true;
  const isStatusBarVisible = config?.isStatusBarVisible !== false;

  const handleEvent = async (eventType, eventData) => {
    if (eventType === 'colResize' && !isColWidthControlled) {
      const nextColWidthById = eventData?.colWidthByIdNext;
      if (nextColWidthById) {
        setInternalColWidthById(nextColWidthById);
      }
    }
    return emitFolderEvent(onEvent, eventType, eventData);
  };

  const viewSwitcherData = {
    ...data,
    columns: resolvedColumns,
    colWidthById,
  };

  const viewSwitcherConfig = {
    ...config,
    isColReorderAllowed: config?.isColReorderAllowed === true && !isLocked,
    isRowReorderAllowed: config?.isRowReorderAllowed === true && !isLocked,
    isLocked,
  };

  const statusBarData = data?.statusBar || {
    itemCount: data?.rows?.length || 0,
    messageState: null,
  };

  const statusBarConfig = {
    isItemCountVisible: config?.isStatusItemCountVisible !== false,
  };

  return (
    <div className="folder-view-container">
      <ViewSwitcher
        data={viewSwitcherData}
        config={viewSwitcherConfig}
        onEvent={handleEvent}
      />
      {isStatusBarVisible ? (
        <StatusBar
          data={statusBarData}
          config={statusBarConfig}
        />
      ) : null}
    </div>
  );
});

export default FolderView;
