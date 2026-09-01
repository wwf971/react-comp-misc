const WIDTH_MODE_SEGMENT_SET = new Set(['auto', 'equal']);

function normalizeSegList(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return rawList.map((segment) => ({
    value: segment?.value,
    labelText: segment?.labelText ?? segment?.label ?? segment?.value,
    compName: segment?.compName ?? segment?.component ?? null,
  }));
}

export function normalizeSegmentedControlProps(props = {}) {
  const dataInput = props.data || {};
  const configInput = props.config || {};
  const segList = normalizeSegList(dataInput.segList ?? dataInput.options);
  const widthModeSegmentRaw = configInput.widthModeSegment ?? configInput.widthMode ?? 'auto';

  return {
    valueSelected: dataInput.valueSelected ?? dataInput.value ?? dataInput.data ?? null,
    segList,
    isDisabled: Boolean(configInput.isDisabled ?? configInput.disabled),
    isInitialAnimationEnabled: configInput.isInitialAnimationEnabled === true,
    // null means default shadcn/ui Tabs look: white pill on muted track, dark text.
    // An explicit color keeps the legacy look: colored pill, white selected text.
    colorHighlight: configInput.colorHighlight ?? configInput.color ?? null,
    widthModeSegment: WIDTH_MODE_SEGMENT_SET.has(widthModeSegmentRaw) ? widthModeSegmentRaw : 'auto',
    durationTransitionMs: Number.isFinite(configInput.durationTransitionMs)
      ? Math.max(0, Math.floor(configInput.durationTransitionMs))
      : (Number.isFinite(configInput.transitionDurationMs)
        ? Math.max(0, Math.floor(configInput.transitionDurationMs))
        : 250),
    compResolveFn: configInput.compResolveFn ?? configInput.getComp ?? null,
    classNameTrack: `${configInput.classNameTrack ?? ''}`.trim(),
    onEvent: typeof props.onEvent === 'function' ? props.onEvent : null,
  };
}
