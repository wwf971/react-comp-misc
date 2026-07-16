import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import ConfigBool from './ConfigBool.jsx';
import ConfigStr from './ConfigStr.jsx';
import ConfigNumber from './ConfigNumber.jsx';
import ConfigSelect from './ConfigSelect.jsx';
import SegmentedControl from '../../component/button/SegmentedControl.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import baseStyles from './Config.module.css';
import tabGroupStyles from './ConfigTabGroup.module.css';
import tabStyles from './ConfigTab.module.css';
import subtabStyles from './ConfigSubtab.module.css';
import {
  ConfigRuntimeProvider,
  appendConfigPath,
  emitConfigEvent,
  getConfigComponentPath,
  getConfigOperationState,
  getConfigRequestState,
  getConfigValue,
  getIsConfigControlDisabled,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const fieldTypeList = ['boolean', 'string', 'number', 'select', 'enum'];

function isFieldItem(item) {
  return fieldTypeList.includes(item?.type) || item?.comp || item?.compName;
}

function getItemName(item) {
  return item?.name ?? item?.label ?? item?.id ?? '';
}

function getItemChildren(item) {
  return Array.isArray(item?.children) ? item.children : [];
}

function getLevelKind(items, mode) {
  if (mode === 'tabs' || mode === 'tab-groups') return 'side-tabs';
  if (mode === 'subtabs') return 'subtabs';
  if ((items ?? []).some((item) => item?.type === 'tab' || item?.type === 'tab-group')) return 'side-tabs';
  if ((items ?? []).length > 0 && items.every((item) => item?.type === 'subtab')) return 'subtabs';
  return 'fields';
}

function getFirstTabId(items) {
  for (const item of items ?? []) {
    if (item?.type === 'tab') return item.id;
    if (item?.type === 'tab-group') {
      const tab = getItemChildren(item).find((child) => child?.type === 'tab');
      if (tab) return tab.id;
    }
  }
  return '';
}

function findTabById(items, activeTabId) {
  for (const item of items ?? []) {
    if (item?.type === 'tab' && item.id === activeTabId) return item;
    if (item?.type === 'tab-group') {
      const tab = getItemChildren(item).find((child) => child?.type === 'tab' && child.id === activeTabId);
      if (tab) return tab;
    }
  }
  return null;
}

function resolveCustomComp(config, item) {
  if (item?.comp) return item.comp;
  if (item?.compName && typeof config?.compResolveFn === 'function') return config.compResolveFn(item.compName, item);
  if (item?.compName && typeof config?.getComp === 'function') return config.getComp(item.compName, item);
  if (typeof config?.getComp === 'function') return config.getComp(item);
  return null;
}

function ConfigInvalidItem({ item, expectedText, className, label }) {
  const anchorRef = useRef(null);
  const [panelRect, panelRectSet] = useState(null);
  const messageText = `Invalid configuration: expected ${expectedText} but got "${item?.type ?? 'missing'}"`;
  const jsonText = JSON.stringify(item, null, 2);
  const panelShow = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelInset = 6;
    const panelWidth = Math.min(360, window.innerWidth - panelInset * 2);
    const left = Math.max(panelInset, Math.min(rect.right + 6, window.innerWidth - panelWidth - panelInset));
    panelRectSet({
      left,
      top: rect.top + rect.height / 2,
      width: panelWidth
    });
  };
  const panelHide = () => panelRectSet(null);
  return (
    <div ref={anchorRef} className={className} onMouseEnter={panelShow} onMouseLeave={panelHide}>
      {label}
      {panelRect ? createPortal(
        <div
          className={baseStyles.configInvalidTooltip}
          style={{ left: panelRect.left, top: panelRect.top, width: panelRect.width }}
          onMouseEnter={panelShow}
          onMouseLeave={panelHide}
        >
          <div className={baseStyles.configInvalidTooltipText}>{messageText}</div>
          <pre className={baseStyles.configInvalidTooltipJson}>{jsonText}</pre>
        </div>,
        document.body
      ) : null}
    </div>
  );
}

function ConfigRequestStatus({ requestState, itemPathText }) {
  const anchorRef = useRef(null);
  const [panelRect, panelRectSet] = useState(null);
  const { config } = useConfigRuntime();
  if (!requestState) return null;
  if (requestState.status === 'pending') {
    return (
      <span className={baseStyles.configRequestStatusPending}>
        <SpinningCircle width={13} height={13} color="#5b6f89" />
      </span>
    );
  }
  if (requestState.status !== 'error') return null;
  const messageText = String(requestState.message ?? 'Update failed');
  const panelShow = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelInset = 6;
    const panelWidth = Math.min(320, window.innerWidth - panelInset * 2);
    const left = Math.max(panelInset, Math.min(rect.right + 6, window.innerWidth - panelWidth - panelInset));
    panelRectSet({
      left,
      top: rect.top + rect.height / 2,
      width: panelWidth
    });
  };
  const panelHide = () => panelRectSet(null);
  return (
    <span ref={anchorRef} className={baseStyles.configRequestStatusError} onMouseEnter={panelShow} onMouseLeave={panelHide}>
      Error
      {panelRect ? createPortal(
        <span
          className={baseStyles.configRequestErrorPanel}
          style={{ left: panelRect.left, top: panelRect.top, width: panelRect.width }}
          onMouseEnter={panelShow}
          onMouseLeave={panelHide}
        >
          <span className={baseStyles.configRequestErrorText}>{messageText}</span>
          <button type="button" className={baseStyles.configRequestErrorDismiss} onClick={() => config.onRequestDismiss?.(itemPathText)}>Dismiss</button>
        </span>,
        document.body
      ) : null}
    </span>
  );
}

const ConfigCustomControl = observer(function ConfigCustomControl({ item, itemPath }) {
  const { data, config, onEvent } = useConfigRuntime();
  const compPath = getConfigComponentPath(config);
  const compPathText = joinConfigPath(compPath);
  const itemPathText = joinConfigPath(itemPath);
  const value = getConfigValue(data, item);
  const isDisabled = getIsConfigControlDisabled(config, compPath, itemPath, item);
  const CustomComp = resolveCustomComp(config, item);
  const onValueChange = (valueNext) => emitConfigEvent(onEvent, 'valueChangeAttempt', {
    compPath,
    compPathText,
    componentPath: compPath,
    componentPathText: compPathText,
    itemPath,
    itemPathText,
    valueId: item.id,
    value: valueNext
  });
  const commonProps = {
    ...(item?.compProps ?? {}),
    item,
    value,
    itemPath,
    itemPathText,
    compPath,
    compPathText,
    componentPath: compPath,
    componentPathText: compPathText,
    isDisabled,
    onValueChange
  };
  if (!CustomComp) return null;
  if (React.isValidElement(CustomComp)) return React.cloneElement(CustomComp, commonProps);
  return <CustomComp {...commonProps} />;
});

const ConfigEnumControl = observer(function ConfigEnumControl({ item, itemPath }) {
  const { data, config, onEvent } = useConfigRuntime();
  const compPath = getConfigComponentPath(config);
  const compPathText = joinConfigPath(compPath);
  const value = getConfigValue(data, item);
  const isDisabled = getIsConfigControlDisabled(config, compPath, itemPath, item);
  const segList = (item.options ?? item.optionList ?? []).map((option) => (
    typeof option === 'string'
      ? { value: option, labelText: option }
      : { value: option.value ?? option.id, labelText: option.labelText ?? option.label ?? option.value ?? option.id }
  ));
  return (
    <SegmentedControl
      data={{ valueSelected: value, segList }}
      config={{
        isDisabled,
        widthModeSegment: item.widthModeSegment ?? 'auto',
        colorHighlight: item.colorHighlight,
        durationTransitionMs: item.durationTransitionMs ?? 140,
        classNameTrack: item.classNameTrack
      }}
      onEvent={(eventType, eventData) => {
        if (eventType !== 'valueSelectedChange') return;
        emitConfigEvent(onEvent, 'valueChangeAttempt', {
          compPath,
          compPathText,
          componentPath: compPath,
          componentPathText: compPathText,
          itemPath,
          itemPathText: joinConfigPath(itemPath),
          valueId: item.id,
          value: eventData.valueSelected
        });
      }}
    />
  );
});

function ConfigFieldControl({ item, itemPath, missingItemStrategy }) {
  const { data } = useConfigRuntime();
  if (!(item.id in data) && missingItemStrategy === 'reportError') {
    return <div className={baseStyles.configError}>Value missing in data</div>;
  }
  if (item.comp || item.compName) return <ConfigCustomControl item={item} itemPath={itemPath} />;
  switch (item.type) {
    case 'boolean':
      return <ConfigBool item={item} itemPath={itemPath} />;
    case 'string':
      return <ConfigStr item={item} itemPath={itemPath} />;
    case 'number':
      return <ConfigNumber item={item} itemPath={itemPath} />;
    case 'select':
      return <ConfigSelect item={item} itemPath={itemPath} />;
    case 'enum':
      return <ConfigEnumControl item={item} itemPath={itemPath} />;
    default:
      return (
        <ConfigInvalidItem
          item={item}
          expectedText="field type boolean, string, number, select, or custom component"
          className={`${baseStyles.configItem} ${baseStyles.configItemInvalid}`}
          label={getItemName(item) || 'Invalid item'}
        />
      );
  }
}

const ConfigFieldList = observer(function ConfigFieldList({ items, compPath, missingItemStrategy, listClassName }) {
  const { config } = useConfigRuntime();
  return (
    <div className={listClassName ?? baseStyles.configList}>
      {(items ?? []).map((item) => {
        const itemPath = appendConfigPath(compPath, item.id);
        if (item.type === 'group') {
          return (
            <div key={item.id} className={baseStyles.configGroup}>
              <div className={baseStyles.configGroupTitle}>{item.label}</div>
              <div className={baseStyles.configGroupDivider} />
              <ConfigNodeList
                items={getItemChildren(item)}
                compPath={itemPath}
                mode="fields"
                listClassName={baseStyles.configGroupItems}
              />
            </div>
          );
        }
        if (!isFieldItem(item)) {
          return (
            <ConfigInvalidItem
              key={item.id}
              item={item}
              expectedText="group or field item"
              className={`${baseStyles.configItem} ${baseStyles.configItemInvalid}`}
              label={getItemName(item) || 'Invalid item'}
            />
          );
        }
        const itemPathText = joinConfigPath(itemPath);
        const requestState = getConfigRequestState(config, itemPath, item);
        return (
          <div key={item.id} className={baseStyles.configItem}>
            <div className={baseStyles.configInfo}>
              <div className={baseStyles.configLabel}>{item.label}</div>
              {item.description ? <div className={baseStyles.configDescription}>{item.description}</div> : null}
            </div>
            <div className={baseStyles.configControl}>
              <ConfigRequestStatus requestState={requestState} itemPathText={itemPathText} />
              <ConfigFieldControl item={item} itemPath={itemPath} missingItemStrategy={missingItemStrategy} />
            </div>
          </div>
        );
      })}
    </div>
  );
});

function SideTabButton({ item, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`${baseStyles.configTab} ${isActive ? baseStyles.active : ''}`}
      onClick={onClick}
    >
      {getItemName(item)}
    </button>
  );
}

const ConfigSideTabs = observer(function ConfigSideTabs({ items, compPath }) {
  const { data, config, onEvent } = useConfigRuntime();
  const operationState = getConfigOperationState(config, compPath);
  const activeTabId = operationState.activeTabId ?? config.activeTabId ?? getFirstTabId(items);
  const activeTab = findTabById(items, activeTabId);
  const compPathText = joinConfigPath(compPath);
  const handleTabClick = (tab) => {
    const tabPath = appendConfigPath(compPath, tab.id);
    emitConfigEvent(onEvent, 'activeTabChange', {
      compPath,
      compPathText,
      componentPath: compPath,
      componentPathText: compPathText,
      tabPath,
      tabPathText: joinConfigPath(tabPath),
      tabId: tab.id
    });
  };
  return (
    <div className={baseStyles.configTabContainer}>
      <div className={baseStyles.configTabSidebarContainer}>
        <div className={`${baseStyles.configTabSidebar} ${tabGroupStyles.configTabSidebar}`}>
          {(items ?? []).map((item, itemIndex) => {
            if (item.type === 'tab') {
              return <SideTabButton key={item.id} item={item} isActive={activeTabId === item.id} onClick={() => handleTabClick(item)} />;
            }
            if (item.type === 'tab-group') {
              const showDivider = itemIndex > 0 || (itemIndex === 0 && item.name);
              const showGroupName = typeof item.name === 'string' ? item.name.trim() !== '' : Boolean(item.name);
              return (
                <div key={item.id} className={tabGroupStyles.configTabGroup}>
                  {showGroupName ? <div className={tabGroupStyles.configTabGroupName}>{item.name}</div> : null}
                  {showDivider ? <div className={tabGroupStyles.configTabGroupDivider} /> : null}
                  {getItemChildren(item).map((tab) => (
                    tab.type === 'tab'
                      ? <SideTabButton key={tab.id} item={tab} isActive={activeTabId === tab.id} onClick={() => handleTabClick(tab)} />
                      : (
                        <ConfigInvalidItem
                          key={tab.id}
                          item={tab}
                          expectedText="tab inside tab-group"
                          className={`${baseStyles.configTab} ${baseStyles.configTabInvalid}`}
                          label={getItemName(tab) || 'Invalid item'}
                        />
                      )
                  ))}
                </div>
              );
            }
            return (
              <ConfigInvalidItem
                key={item.id}
                item={item}
                expectedText="tab or tab-group"
                className={`${baseStyles.configTab} ${baseStyles.configTabInvalid}`}
                label={getItemName(item) || 'Invalid item'}
              />
            );
          })}
        </div>
      </div>
      <div className={baseStyles.configTabContent}>
        {activeTab ? (
          <ConfigNodeList
            items={getItemChildren(activeTab)}
            compPath={appendConfigPath(compPath, activeTab.id)}
            mode="auto"
          />
        ) : (
          <div className={baseStyles.configTabEmpty}>No tab selected</div>
        )}
      </div>
    </div>
  );
});

const ConfigSubtabs = observer(function ConfigSubtabs({ items, compPath }) {
  const { config, onEvent } = useConfigRuntime();
  const operationState = getConfigOperationState(config, compPath);
  const activeSubtabId = operationState.activeSubtabId ?? config.activeSubtabId ?? items?.[0]?.id ?? '';
  const activeSubtab = (items ?? []).find((item) => item.id === activeSubtabId && item.type === 'subtab');
  const compPathText = joinConfigPath(compPath);
  const handleSubtabClick = (subtab) => {
    const subtabPath = appendConfigPath(compPath, subtab.id);
    emitConfigEvent(onEvent, 'activeSubtabChange', {
      compPath,
      compPathText,
      componentPath: compPath,
      componentPathText: compPathText,
      subtabPath,
      subtabPathText: joinConfigPath(subtabPath),
      subtabId: subtab.id
    });
  };
  return (
    <div className={subtabStyles.configSubtabContainer}>
      <div className={subtabStyles.configSubtabBar}>
        {(items ?? []).map((subtab) => (
          subtab.type === 'subtab'
            ? (
              <button
                key={subtab.id}
                type="button"
                className={`${subtabStyles.configSubtab} ${activeSubtabId === subtab.id ? subtabStyles.active : ''}`}
                onClick={() => handleSubtabClick(subtab)}
              >
                {getItemName(subtab)}
              </button>
            )
            : (
              <ConfigInvalidItem
                key={subtab.id}
                item={subtab}
                expectedText="subtab"
                className={`${subtabStyles.configSubtab} ${subtabStyles.configSubtabInvalid}`}
                label={getItemName(subtab) || 'Invalid item'}
              />
            )
        ))}
      </div>
      <div className={subtabStyles.configSubtabContent}>
        {activeSubtab ? (
          <ConfigNodeList
            items={getItemChildren(activeSubtab)}
            compPath={appendConfigPath(compPath, activeSubtab.id)}
            mode="fields"
          />
        ) : (
          <div className={baseStyles.configTabEmpty}>No subtab selected</div>
        )}
      </div>
    </div>
  );
});

const ConfigNodeList = observer(function ConfigNodeList({ items, compPath, mode = 'auto', listClassName }) {
  const { config } = useConfigRuntime();
  const levelKind = getLevelKind(items, mode);
  if (levelKind === 'side-tabs') return <ConfigSideTabs items={items} compPath={compPath} />;
  if (levelKind === 'subtabs') return <ConfigSubtabs items={items} compPath={compPath} />;
  if (listClassName) {
    return <ConfigFieldList items={items} compPath={compPath} missingItemStrategy={config.missingItemStrategy ?? 'setDefault'} listClassName={listClassName} />;
  }
  return (
    <div className={baseStyles.configContainer}>
      <ConfigFieldList items={items} compPath={compPath} missingItemStrategy={config.missingItemStrategy ?? 'setDefault'} />
    </div>
  );
});

function checkDefaultItems(items, data, compPath, onEvent) {
  (items ?? []).forEach((item) => {
    const itemPath = appendConfigPath(compPath, item.id);
    if (item.type === 'group' || item.type === 'tab' || item.type === 'subtab' || item.type === 'tab-group') {
      checkDefaultItems(getItemChildren(item), data, itemPath, onEvent);
      return;
    }
    if (!(item.id in data) && item.defaultValue !== undefined) {
      const compPathText = joinConfigPath(compPath);
      emitConfigEvent(onEvent, 'valueDefaultSetAttempt', {
        compPath,
        compPathText,
        componentPath: compPath,
        componentPathText: compPathText,
        itemPath,
        itemPathText: joinConfigPath(itemPath),
        valueId: item.id,
        value: item.defaultValue
      });
    }
  });
}

const ConfigRenderer = observer(function ConfigRenderer({ data, config, onEvent, mode = 'auto' }) {
  const effectiveData = data ?? {};
  const effectiveConfig = config ?? {};
  const compPath = getConfigComponentPath(effectiveConfig);
  const compPathText = joinConfigPath(compPath);
  const items = effectiveConfig.items ?? [];
  const missingItemStrategy = effectiveConfig.missingItemStrategy ?? 'setDefault';
  useEffect(() => {
    if (missingItemStrategy === 'setDefault') checkDefaultItems(items, effectiveData, compPath, onEvent);
  }, [compPathText, effectiveData, onEvent, items, missingItemStrategy]);
  return (
    <ConfigRuntimeProvider data={effectiveData} config={effectiveConfig} onEvent={onEvent}>
      <ConfigNodeList items={items} compPath={compPath} mode={mode} />
    </ConfigRuntimeProvider>
  );
});

export default ConfigRenderer;
