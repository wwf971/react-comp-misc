export const resolveJsonEventType = (changeData) => {
  if (changeData?._keyRename) return 'keyRename';
  if (changeData?._action) return changeData._action;
  return 'valueUpdate';
};

export const emitJsonCompEvent = async (onEvent, path, changeData) => {
  if (!onEvent) return { code: 0 };
  const eventType = resolveJsonEventType(changeData);
  return onEvent(eventType, { path, changeData });
};

export const createJsonOnEventAdapter = (handleChange) => {
  if (!handleChange) return undefined;
  return async (eventType, eventData) => {
    const { path, changeData } = eventData;
    return handleChange(path, changeData);
  };
};
