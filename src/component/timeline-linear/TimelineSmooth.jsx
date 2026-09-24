import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import TimelineLinear from './Timeline.jsx';

function itemIdGet(itemData, itemIndex) {
  return String(itemData?.id || `timeline-item-${itemIndex}`);
}

function itemListIdSignatureGet(itemList) {
  return itemList.map((itemData, itemIndex) => itemIdGet(itemData, itemIndex)).join('|');
}

function entryBuild(itemDataSource, itemIndex) {
  return {
    id: itemIdGet(itemDataSource, itemIndex),
    itemDataSource,
    animationPhase: '',
    lineAnimationPhase: '',
  };
}

function sourceListIsAppendOnly(currentIdList, sourceIdList) {
  if (currentIdList.length > sourceIdList.length) return false;
  return currentIdList.every((itemId, itemIndex) => sourceIdList[itemIndex] === itemId);
}

class StoreTimelineLinearSmooth {
  itemListVisible = [];
  itemListQueued = [];
  isAnimating = false;
  animationToken = 0;
  animationRevision = 0;
  timeoutIdList = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get dataDisplay() {
    return {
      itemList: this.itemListVisible.map((entryData) => ({
        ...entryData.itemDataSource,
        id: entryData.id,
        animationPhase: entryData.animationPhase,
        lineAnimationPhase: entryData.lineAnimationPhase,
      })),
      scrollKey: `${this.animationToken}-${this.animationRevision}`,
    };
  }

  revisionBump() {
    this.animationRevision += 1;
  }

  timerClear() {
    this.timeoutIdList.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.timeoutIdList = [];
  }

  timerSet(callback, delayMs, token) {
    const timeoutId = window.setTimeout(() => {
      if (this.animationToken !== token) return;
      callback();
    }, delayMs);
    this.timeoutIdList.push(timeoutId);
  }

  itemSourceUpdate(entryDataNext) {
    const visibleEntry = this.itemListVisible.find((entryData) => entryData.id === entryDataNext.id);
    if (visibleEntry) {
      visibleEntry.itemDataSource = entryDataNext.itemDataSource;
      return;
    }
    const queuedEntry = this.itemListQueued.find((entryData) => entryData.id === entryDataNext.id);
    if (queuedEntry) {
      queuedEntry.itemDataSource = entryDataNext.itemDataSource;
    }
  }

  sourceSync(itemListSource) {
    const itemListNext = (Array.isArray(itemListSource) ? itemListSource : []).map((itemData, itemIndex) => entryBuild(itemData, itemIndex));
    const sourceIdList = itemListNext.map((entryData) => entryData.id);
    const currentIdList = [
      ...this.itemListVisible.map((entryData) => entryData.id),
      ...this.itemListQueued.map((entryData) => entryData.id),
    ];

    if (!sourceIdList.length) {
      this.reset();
      return;
    }

    if (!sourceListIsAppendOnly(currentIdList, sourceIdList)) {
      this.reset();
      this.itemListQueued = itemListNext;
      this.animationStartNext();
      return;
    }

    itemListNext.slice(0, currentIdList.length).forEach((entryData) => this.itemSourceUpdate(entryData));
    const itemListAppend = itemListNext.slice(currentIdList.length);
    if (itemListAppend.length) this.itemListQueued.push(...itemListAppend);
    this.animationStartNext();
  }

  animationStartNext() {
    if (this.isAnimating || !this.itemListQueued.length) return;
    const token = this.animationToken;
    const entryData = this.itemListQueued.shift();
    const entryDataPrevious = this.itemListVisible[this.itemListVisible.length - 1] || null;
    if (entryDataPrevious) entryDataPrevious.lineAnimationPhase = 'grow';
    entryData.animationPhase = entryDataPrevious ? 'line' : 'bullet';
    this.itemListVisible.push(entryData);
    this.isAnimating = true;
    this.revisionBump();

    const lineMs = entryData.animationPhase === 'line' ? 420 : 1;
    const bulletMs = 220;
    const cardMs = 360;
    this.timerSet(() => {
      if (entryDataPrevious) entryDataPrevious.lineAnimationPhase = '';
      entryData.animationPhase = 'bullet';
      this.revisionBump();
    }, lineMs, token);
    this.timerSet(() => {
      entryData.animationPhase = 'card';
      this.revisionBump();
    }, lineMs + bulletMs, token);
    this.timerSet(() => {
      entryData.animationPhase = 'done';
      this.isAnimating = false;
      this.revisionBump();
      this.animationStartNext();
    }, lineMs + bulletMs + cardMs, token);
  }

  reset() {
    this.timerClear();
    this.animationToken += 1;
    this.itemListVisible = [];
    this.itemListQueued = [];
    this.isAnimating = false;
    this.animationRevision = 0;
  }

  dispose() {
    this.reset();
  }
}

/**
 * TimelineLinearSmooth has the same public data/config/onEvent shape as TimelineLinear.
 * It keeps animation queue state internally so callers stay agnostic of line/bullet/card phases.
 * If source cards are appended faster than one card's entrance animation can finish, they are
 * queued and revealed one by one in insertion order.
 */
const TimelineLinearSmooth = observer(function TimelineLinearSmooth({ data = {}, config = {}, onEvent }) {
  const store = useMemo(() => new StoreTimelineLinearSmooth(), []);
  const itemList = Array.isArray(data.itemList) ? data.itemList : [];
  const itemListSignature = itemListIdSignatureGet(itemList);

  useLayoutEffect(() => {
    store.sourceSync(itemList);
  }, [store, itemListSignature]);

  useEffect(() => () => store.dispose(), [store]);

  return (
    <TimelineLinear
      data={store.dataDisplay}
      config={{ ...config, className: `${config.className || ''} is-smooth`.trim(), isSmoothScroll: true }}
      onEvent={onEvent}
    />
  );
});

export { TimelineLinearSmooth };
export default TimelineLinearSmooth;