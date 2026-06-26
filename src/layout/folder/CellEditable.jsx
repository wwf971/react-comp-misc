import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DownIcon } from '../../icon/DirectionIcons.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import { emitFolderEvent } from './folderUtils.js';
import './folder.css';

const CellDropdown = React.memo(({
  data = {},
  config = {},
  onEvent,
  rowId,
  colId,
}) => {
  const value = data?.value ?? null;
  const options = Array.isArray(data?.options) ? data.options : [];
  const isEditable = config?.isEditable === true || data?.isEditable === true;
  const isBusy = config?.isBusy === true || data?.isBusy === true;

  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    if (!isEditable && isOpen) {
      setIsOpen(false);
    }
  }, [isEditable, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return undefined;
    }
    const updateMenuPosition = () => {
      const rootEl = rootRef.current;
      if (!rootEl) {
        return;
      }
      const rect = rootEl.getBoundingClientRect();
      setMenuPosition({
        left: rect.left,
        top: rect.bottom + 2,
        width: rect.width,
      });
    };
    const onDocumentMouseDown = (event) => {
      const rootEl = rootRef.current;
      const menuEl = menuRef.current;
      if (!rootEl) {
        return;
      }
      if (rootEl.contains(event.target)) {
        return;
      }
      if (menuEl && menuEl.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };
    updateMenuPosition();
    document.addEventListener('mousedown', onDocumentMouseDown, true);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown, true);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen]);

  const valueOption = options.find((item) => item.value === value);
  const valueLabel = valueOption?.label || String(value ?? '');
  const isDisabled = !isEditable || isBusy || !onEvent;

  const handleOptionClick = async (nextValue) => {
    if (isDisabled) {
      return;
    }
    setIsOpen(false);
    if (nextValue === value) {
      return;
    }
    await emitFolderEvent(onEvent, 'cellValueChange', {
      rowId,
      colId,
      valueNext: nextValue,
    });
  };

  return (
    <div className={`folder-cell-dropdown-root ${isBusy ? 'is-busy' : ''}`} ref={rootRef}>
      <div className="folder-cell-dropdown-value" title={valueLabel}>
        {valueLabel}
      </div>
      {isBusy ? (
        <div className="folder-cell-dropdown-spinner">
          <SpinningCircle width={10} height={10} color="#5e6b7c" />
        </div>
      ) : null}
      {isEditable ? (
        <button
          className="folder-cell-dropdown-trigger"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isDisabled) {
              return;
            }
            setIsOpen((prev) => !prev);
          }}
          disabled={isDisabled}
          aria-label="open cell dropdown"
        >
          <DownIcon width={12} height={12} />
        </button>
      ) : null}
      {isOpen && menuPosition
        ? createPortal(
            <div
              className="folder-cell-dropdown-menu"
              ref={menuRef}
              onClick={(event) => event.stopPropagation()}
              style={{
                left: `${menuPosition.left}px`,
                top: `${menuPosition.top}px`,
                width: `${menuPosition.width}px`,
              }}
            >
              {options.map((item) => {
                const isSelected = item.value === value;
                return (
                  <button
                    key={String(item.value)}
                    className={`folder-cell-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                    type="button"
                    onClick={() => handleOptionClick(item.value)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}, (prevProps, nextProps) => (
  prevProps.data === nextProps.data
  && prevProps.config === nextProps.config
  && prevProps.onEvent === nextProps.onEvent
  && prevProps.rowId === nextProps.rowId
  && prevProps.colId === nextProps.colId
));

export default CellDropdown;
export { CellDropdown };
