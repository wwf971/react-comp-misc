import React, { createContext, useContext, useMemo } from 'react';

const ConfigRuntimeContext = createContext({
  data: {},
  config: {},
  onEvent: undefined
});

export const ConfigRuntimeProvider = ({
  data,
  config,
  onEvent,
  children
}) => {
  const parentRuntime = useContext(ConfigRuntimeContext);

  const runtime = useMemo(() => ({
    data: data ?? parentRuntime.data ?? {},
    config: config ?? parentRuntime.config ?? {},
    onEvent: onEvent ?? parentRuntime.onEvent
  }), [data, config, onEvent, parentRuntime]);

  return (
    <ConfigRuntimeContext.Provider value={runtime}>
      {children}
    </ConfigRuntimeContext.Provider>
  );
};

export const useConfigRuntime = () => useContext(ConfigRuntimeContext);

export const normalizeConfigPath = (path) => {
  if (Array.isArray(path)) {
    return path;
  }

  if (typeof path === 'string' && path.length > 0) {
    return path.split('.');
  }

  return ['root'];
};

export const joinConfigPath = (path) => normalizeConfigPath(path).join('.');

export const appendConfigPath = (path, itemId) => [
  ...normalizeConfigPath(path),
  itemId
];

export const getConfigComponentPath = (config) => (
  normalizeConfigPath(config?.compPath ?? config?.componentPath ?? config?.path)
);

export const getConfigOperationState = (config, compPath) => {
  const path = normalizeConfigPath(compPath);
  const pathText = joinConfigPath(path);
  return config?.operationStateByPath?.[pathText] ?? {};
};

export const getConfigValue = (data, item) => (
  data?.[item.id] ?? item.defaultValue
);

export const getConfigRequestState = (config, itemPath, item) => {
  const itemPathText = joinConfigPath(itemPath);
  return config?.requestStateByPath?.[itemPathText] ?? config?.requestStateByPath?.[item?.id] ?? null;
};

export const getIsConfigControlDisabled = (config, compPath, itemPath, item) => {
  const operationState = getConfigOperationState(config, compPath);
  const requestState = itemPath ? getConfigRequestState(config, itemPath, item) : null;
  return Boolean(
    config?.isLocked ||
    operationState.isLocked ||
    config?.isEditable === false ||
    operationState.isEditable === false ||
    requestState?.status === 'pending'
  );
};

export const emitConfigEvent = (onEvent, eventType, eventData) => {
  if (onEvent) {
    return onEvent(eventType, eventData);
  }

  return undefined;
};

export const normalizeConfigPanelProps = (props = {}, runtime = {}) => {
  const data = props.data ?? props.configValue ?? runtime.data ?? {};
  const configBase = props.config ?? props.configStruct ?? runtime.config ?? {};
  const config = {
    ...configBase
  };

  if (props.missingItemStrategy !== undefined) {
    config.missingItemStrategy = props.missingItemStrategy;
  }

  const onEvent = props.onEvent ?? runtime.onEvent ?? (
    props.onChangeAttempt
      ? (eventType, eventData = {}) => {
        if (eventType === 'valueChangeAttempt' || eventType === 'valueDefaultSetAttempt') {
          return props.onChangeAttempt(eventData.valueId, eventData.value, eventData);
        }
        return undefined;
      }
      : undefined
  );

  return {
    data,
    config,
    onEvent
  };
};
