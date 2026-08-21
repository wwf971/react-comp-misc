import { createContext, useContext } from 'react';
import { makeAutoObservable, observable } from 'mobx';

// ==== Demo event system ====
//
// Interactive demo components (ExampleJumpLink, ExampleSwitchButtons) emit
// events through the dispatch returned by useDemoEventDispatch(). The dispatch
// bubbles each event through the levels:
//
//   1. nearest ExampleGroup store (switch inside the group);
//   2. DemoPanel store (jump to an example in another group, or a standalone
//      example registered on the panel; activates it and scrolls to it);
//   3. onEvent prop of DemoPanel (future page level, e.g. jump to an example
//      inside another exampleXxx entry via eventData.pageKey).
//
// A level returns { code: 0 } when it handled the event; code < 0 means the
// event bubbles to the next level.

// Ui state of one ExampleGroup: which example is currently shown.
class StoreExampleGroup {
  groupId = '';

  exampleList = []; // [{ id, labelText }], registered by ExampleSwitcher

  exampleActiveId = '';

  constructor({ groupId = '', exampleActiveId = '' } = {}) {
    this.groupId = groupId;
    this.exampleActiveId = exampleActiveId;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  exampleHas(exampleId) {
    return this.exampleList.some((exampleMeta) => exampleMeta.id === exampleId);
  }

  exampleListSet(exampleList) {
    this.exampleList = exampleList;
    const isActiveIdKnown = this.exampleHas(this.exampleActiveId);
    if (!isActiveIdKnown) {
      this.exampleActiveId = exampleList.length ? exampleList[0].id : '';
    }
    return { code: 0 };
  }

  exampleActiveSet(exampleId) {
    if (!this.exampleHas(exampleId)) return { code: -1, message: `Unknown example: ${exampleId}` };
    this.exampleActiveId = exampleId;
    return { code: 0 };
  }

  exampleJump({ exampleId, groupId, pageKey }) {
    if (pageKey) return { code: -1, message: 'Page level jump is not handled by group store' };
    if (groupId && groupId !== this.groupId) return { code: -1, message: `Target group is not this group: ${groupId}` };
    return this.exampleActiveSet(exampleId);
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'exampleJumpRequest') return this.exampleJump(eventData);
    return { code: -1, message: `Unsupported event: ${eventType}` };
  }
}

// Ui state of one DemoPanel: registry of example groups and standalone
// examples on the page, used to resolve cross-group jump requests.
class StoreDemoPanel {
  groupEntryList = []; // [{ storeGroup, el }]

  exampleEntryList = []; // [{ exampleId, el }], examples placed directly under the panel

  constructor() {
    makeAutoObservable(this, {
      groupEntryList: observable.shallow,
      exampleEntryList: observable.shallow,
    }, { autoBind: true });
  }

  groupRegister(storeGroup, el) {
    this.groupEntryList.push({ storeGroup, el });
    return { code: 0 };
  }

  groupUnregister(storeGroup) {
    this.groupEntryList = this.groupEntryList.filter((groupEntry) => groupEntry.storeGroup !== storeGroup);
    return { code: 0 };
  }

  exampleRegister(exampleId, el) {
    this.exampleEntryList.push({ exampleId, el });
    return { code: 0 };
  }

  exampleUnregister(exampleId) {
    this.exampleEntryList = this.exampleEntryList.filter((exampleEntry) => exampleEntry.exampleId !== exampleId);
    return { code: 0 };
  }

  groupEntryFind(exampleId, groupId = '') {
    return this.groupEntryList.find((groupEntry) => {
      if (groupId && groupEntry.storeGroup.groupId !== groupId) return false;
      return groupEntry.storeGroup.exampleHas(exampleId);
    });
  }

  isExampleActive(exampleId, groupId = '') {
    const groupEntry = this.groupEntryFind(exampleId, groupId);
    return groupEntry ? groupEntry.storeGroup.exampleActiveId === exampleId : false;
  }

  exampleJump({ exampleId, groupId, pageKey }) {
    if (pageKey) return { code: -1, message: 'Page level jump is not handled by panel store' };
    const exampleEntry = this.exampleEntryList.find((entryData) => entryData.exampleId === exampleId);
    if (exampleEntry) {
      exampleEntry.el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return { code: 0 };
    }
    const groupEntry = this.groupEntryFind(exampleId, groupId);
    if (!groupEntry) return { code: -1, message: `Unknown jump target: ${exampleId}` };
    const result = groupEntry.storeGroup.exampleActiveSet(exampleId);
    if (result.code !== 0) return result;
    groupEntry.el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return { code: 0 };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'exampleJumpRequest') return this.exampleJump(eventData);
    return { code: -1, message: `Unsupported event: ${eventType}` };
  }
}

function createStoreExampleGroup(options) {
  return new StoreExampleGroup(options);
}

function createStoreDemoPanel() {
  return new StoreDemoPanel();
}

const DemoPanelContext = createContext(null); // { storePanel, onEvent }
const ExampleGroupContext = createContext(null); // storeGroup
const ExplanationPlainContext = createContext(false);

// Returns a dispatch(eventType, eventData) implementing the bubbling above.
const useDemoEventDispatch = () => {
  const storeGroup = useContext(ExampleGroupContext);
  const panelContext = useContext(DemoPanelContext);
  return (eventType, eventData = {}) => {
    if (storeGroup) {
      const result = storeGroup.handleEvent(eventType, eventData);
      if (result.code === 0) return result;
    }
    if (panelContext?.storePanel) {
      const result = panelContext.storePanel.handleEvent(eventType, eventData);
      if (result.code === 0) return result;
    }
    if (panelContext?.onEvent) return panelContext.onEvent(eventType, eventData);
    return { code: -1, message: `Unhandled event: ${eventType}` };
  };
};

export {
  StoreExampleGroup,
  StoreDemoPanel,
  createStoreExampleGroup,
  createStoreDemoPanel,
  DemoPanelContext,
  ExampleGroupContext,
  ExplanationPlainContext,
  useDemoEventDispatch,
};
