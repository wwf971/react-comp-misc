import React, { useState, useRef, useEffect } from 'react';
import { runInAction } from 'mobx';
import { useJsonContext } from './JsonContext';
import SpinningCircle from '../../icon/SpinningCircle';
import './JsonComp.css';

const PseudoListItem = ({ data }) => {
  const { container, itemIndex, path } = data;
  const { emitEvent } = useJsonContext();
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowingError, setIsShowingError] = useState('');
  const valueRef = useRef(null);

  useEffect(() => {
    if (valueRef.current) {
      valueRef.current.focus();
    }
  }, []);

  const handleCancel = () => {
    runInAction(() => {
      container.splice(itemIndex, 1);
    });
    emitEvent?.(path, {
      old: { type: 'pseudo' },
      new: { type: 'deleted' },
      _action: 'cancelCreate',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsShowingError('');
    try {
      const changeData = {
        old: { type: 'pseudo' },
        new: { type: 'string', value: value },
        _action: 'createItem',
      };

      const result = await emitEvent(path, changeData);

      if (result && result.code === 0) {
        runInAction(() => {
          container[itemIndex] = value;
        });
      } else {
        const errMsg = result?.message || 'Failed to create item';
        setIsShowingError(errMsg);
        setIsSubmitting(false);

        setTimeout(() => {
          handleCancel();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      setIsShowingError(error.message || 'Network error');
      setIsSubmitting(false);

      setTimeout(() => {
        handleCancel();
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (!value.trim()) {
      handleCancel();
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="json-list-item json-pseudo">
      <span className="json-value-wrapper">
        <input
          ref={valueRef}
          type="text"
          className="json-value json-string editing"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="value"
          disabled={isSubmitting || isShowingError}
          style={{ width: '100px', border: 'none', outline: 'none', background: 'transparent' }}
        />
        {isSubmitting && !isShowingError && (
          <span className="json-spinner">
            <SpinningCircle width={14} height={14} color="#666" />
          </span>
        )}
        {isShowingError && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#d32f2f' }}>
            {isShowingError}
          </span>
        )}
      </span>
    </div>
  );
};

export default PseudoListItem;
