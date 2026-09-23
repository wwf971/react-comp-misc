# TimelineEvent

A fully data-driven horizontal event timeline. `vis-timeline` owns smooth time-range pan/zoom and the component renders a compact custom event channel plus collision-avoiding labels.

## Data

- `eventById`: event records keyed by id.
- `eventIdList`: display order and inclusion list.
- `eventIdSelected`: selected event id.
- `timeRange`: `{ timeStart, timeEnd }`. The parent store remains the source of truth.

An event accepts:

- `id`
- `name` or `label`
- `timeStart` / `timeEnd` (`Date` or date-time string)
- optional `textSecondary`, `tone`, or `color`

## Config

- `height`: total component height; default `330`.
- `laneCountEvent`: compact range lanes in the channel; default `5`.
- `heightBar`, `heightBarAggregate`: normal and merged range heights; defaults `3` and `12`.
- `widthLabelMax`, `gapLabel`, `heightLabelLane`
- `gapChannelLabel`: vertical gap from the compact event channel to the first tag row; default `8`.
- `isLabelChannelHeightLimited`: limits the tag area and enables vertical scrolling.
- `heightLabelChannelMax`: maximum tag-area height when limited; default `150`.
- `labelVariant`: `detailEdge`, `compactDot`, or `compactTime`.
- `isLocked`: disables pan, zoom, and selection requests.
- `isCurrentTimeVisible`, `isTimeTextVisible`
- `timeMin`, `timeMax`, `zoomMinMs`, `zoomMaxMs`
- `isAggregationEnabled`: enables resolution-driven event merging.
- `aggregation`: `{ countMin, offsetMinute, levelList }`.

Each aggregation level accepts `{ id, label, unit, size, durationMinMs }`. Supported units are `minute`, `hour`, `day`, `week`, `halfMonth`, `month`, and `year`. The level with the highest matching `durationMinMs` is selected automatically as the visible range changes. Events in the same time bucket become one count tag; hovering it opens the original event records. Merged blocks show their represented period at the center of the range line, such as `7/14`, `7月前半`, or `7月`. Their boundaries cover the complete local period with an inclusive end—for example, a daily block runs from `00:00:00.000` through `23:59:59.999`—so neighboring merged blocks do not overlap. A typical configuration is:

```js
{
	isAggregationEnabled: true,
	aggregation: {
		countMin: 2,
		offsetMinute: 540,
		levelList: [
			{ id: 'day', unit: 'day', durationMinMs: 2 * 86400000 },
			{ id: 'week', unit: 'week', durationMinMs: 28 * 86400000 },
			{ id: 'halfMonth', unit: 'halfMonth', durationMinMs: 60 * 86400000 },
			{ id: 'month', unit: 'month', durationMinMs: 184 * 86400000 },
			{ id: 'year', unit: 'year', durationMinMs: 366 * 86400000 },
		],
	},
}
```

## Events

- `timeRangeChange`: `{ timeStart, timeEnd, durationMs, isFinal }`
- `eventSelect`: `{ eventId }`
- `aggregateSelect`: `{ aggregationId, eventIdList }`

The parent/store should accept `timeRangeChange` by updating `data.timeRange`. This keeps interaction state data-driven while `vis-timeline` supplies smooth pointer and wheel behavior.

Dragging empty space in either the event-range channel or tag channel pans the visible range. Clicking empty channel space emits `eventSelect` with an empty `eventId`, allowing the parent store to clear the current selection. Dragging a tag still performs the tag's normal interaction instead of panning.

## Collision strategy

1. Event intervals use greedy interval partitioning across compact channel lanes.
2. Every label keeps the horizontal anchor of its event range.
3. A label uses the first row where its horizontal rectangle does not overlap an existing label.
4. More label rows are created whenever all existing rows conflict. They can grow naturally or remain inside a vertically scrollable maximum-height viewport.
5. Connectors are straight vertical lines rendered above labels, so crossing lines remain visible.

The connector anchor follows the left marker of the selected card layout: the colored edge for `detailEdge`, circle for `compactDot`, and square for `compactTime`.

This deterministic first-fit row layout avoids horizontal connector routing and physics simulation. The component grows vertically when a dense range needs additional label rows.
