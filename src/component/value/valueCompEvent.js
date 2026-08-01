export const getValueCompWidthStyle = (width) => {
  if (width === undefined || width === null || width === '') {
    return undefined;
  }
  return {
    width: typeof width === 'number' ? `${width}px` : width,
  };
};

export function createValueCompOnEvent(handlers = {}) {
  const {
    onUpdate,
    onAction,
    onSearch,
    onValidate,
    onEditingChange,
    onCancel,
  } = handlers;

  return async (eventType, eventData) => {
    if (eventType === 'valueCommit' && onUpdate) {
      return onUpdate(eventData.configKey, eventData.valueNext, eventData);
    }
    if (eventType === 'actionRequest' && onAction) {
      return onAction(eventData.action, eventData);
    }
    if (eventType === 'searchRequest' && onSearch) {
      return onSearch(eventData.value, eventData.version, eventData);
    }
    if (eventType === 'validateRequest' && onValidate) {
      return onValidate(eventData.value, eventData.version, eventData);
    }
    if (eventType === 'editStateChange' && onEditingChange) {
      onEditingChange(eventData.isEditing, eventData);
      return { code: 0 };
    }
    if (eventType === 'cancel' && onCancel) {
      onCancel(eventData);
      return { code: 0 };
    }
    return { code: 0 };
  };
}
