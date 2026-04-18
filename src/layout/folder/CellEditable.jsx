import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DownIcon } from '../../icon/DirectionIcons.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import './folder.css';

const CellDropdown = React.memo(({
  data,
  rowId,
  columnId,
}) => {
  const {
    value = null,
    options = [],
    isEditable = false,
    onChange,
  } = data || {};
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isEditable && isOpen) {
      setIsOpen(false);
    }
  }, [isEditable, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }
    const updateMenuPosition = () => {
      const rootElement = rootRef.current;
      if (!rootElement) return;
      const rect = rootElement.getBoundingClientRect();
      setMenuPosition({
        left: rect.left,
        top: rect.bottom + 2,
        width: rect.width,
      });
    };
    const onDocumentMouseDown = (event) => {
      const rootElement = rootRef.current;
      const menuElement = menuRef.current;
      if (!rootElement) return;
      if (rootElement.contains(event.target)) return;
      if (menuElement && menuElement.contains(event.target)) return;
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
  const isDisabled = !isEditable || isBusy || typeof onChange !== 'function';

  const handleOptionClick = async (nextValue) => {
    if (isDisabled) return;
    setIsOpen(false);
    if (nextValue === value) return;
    setIsBusy(true);
    try {
      await Promise.resolve(onChange(nextValue, { rowId, columnId }));
    } finally {
      setIsBusy(false);
    }
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
            if (isDisabled) return;
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
}, (prevProps, nextProps) => prevProps.data === nextProps.data);

export default CellDropdown;
export { CellDropdown };
