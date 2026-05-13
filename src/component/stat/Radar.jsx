import React, { useRef, useState } from 'react';
import './Radar.css';

const DEFAULT_AXIS_MIN = 0;
const DEFAULT_AXIS_MAX = 100;

function toSafeNumber(input, fallback) {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampValue(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function formatNumericLabel(input) {
  const numeric = Number(input);
  if (!Number.isFinite(numeric)) return '';
  if (Math.abs(numeric) >= 1000) return String(Math.round(numeric));
  if (Number.isInteger(numeric)) return String(numeric);
  return numeric.toFixed(2).replace(/\.?0+$/, '');
}

function normalizeAxis(axis, index) {
  const min = toSafeNumber(axis?.min, DEFAULT_AXIS_MIN);
  const maxCandidate = toSafeNumber(axis?.max, DEFAULT_AXIS_MAX);
  const max = maxCandidate > min ? maxCandidate : min + 1;
  const value = clampValue(toSafeNumber(axis?.value, min), min, max);
  return {
    id: axis?.id ?? `axis-${index}`,
    min,
    max,
    value,
    label: axis?.label ?? '',
    component: axis?.component,
    data: axis?.data,
  };
}

function buildRadarGeometry(axisList, radius, rotationOffsetDeg) {
  const baseRotationDeg = -90;
  const totalRotationDeg = baseRotationDeg + toSafeNumber(rotationOffsetDeg, 0);
  const count = axisList.length;
  return axisList.map((axis, index) => {
    const angleDeg = totalRotationDeg + (360 * index) / count;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    const ratio = clampValue((axis.value - axis.min) / (axis.max - axis.min), 0, 1);
    return {
      ...axis,
      angleRad,
      edgeX: x,
      edgeY: y,
      valueX: x * ratio,
      valueY: y * ratio,
      ratio,
    };
  });
}

const Radar = ({
  data = {},
  config = {},
  onEvent,
  axisItems,
  size,
  ringCount,
  rotationOffsetDeg,
  labelOffset,
  showValues,
  isValueEditable,
  dragOutsideTolerancePx,
  onDataChangeRequest,
  getComp = null,
  style = {},
}) => {
  const svgRef = useRef(null);
  const draggingAxisIndexRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);
  const dataAxisItems = Array.isArray(data?.axisItems)
    ? data.axisItems
    : (Array.isArray(axisItems) ? axisItems : []);
  const normalizedSize = Math.max(120, toSafeNumber(config?.size ?? size, 260));
  const normalizedRingCount = Math.max(1, Math.floor(toSafeNumber(config?.ringCount ?? ringCount, 5)));
  const normalizedRotationOffsetDeg = toSafeNumber(config?.rotationOffsetDeg ?? rotationOffsetDeg, 0);
  const normalizedLabelOffset = Math.max(0, toSafeNumber(config?.labelOffset ?? labelOffset, 18));
  const isShowValues = config?.isShowValues === undefined
    ? (showValues === undefined ? true : Boolean(showValues))
    : Boolean(config.isShowValues);
  const isEditableValuesEnabled = config?.isValueEditable === undefined
    ? Boolean(isValueEditable)
    : Boolean(config.isValueEditable);
  const normalizedDragOutsideTolerancePx = Math.max(
    0,
    toSafeNumber(config?.dragOutsideTolerancePx ?? dragOutsideTolerancePx, 16),
  );
  const getCompFn = config?.getComp || getComp;
  const containerStyle = config?.style ?? style ?? {};
  const axisList = dataAxisItems.map(normalizeAxis);
  const validAxisList = axisList.length >= 3 ? axisList : [];
  const radius = normalizedSize / 2;
  const center = radius;
  const axisGeometry = buildRadarGeometry(validAxisList, radius, normalizedRotationOffsetDeg);
  const ringPolygons = Array.from({ length: normalizedRingCount }, (_, index) => {
    const ratio = (index + 1) / normalizedRingCount;
    return axisGeometry.map((axis) => `${center + axis.edgeX * ratio},${center + axis.edgeY * ratio}`).join(' ');
  });
  const valuePolygon = axisGeometry.map((axis) => `${center + axis.valueX},${center + axis.valueY}`).join(' ');
  const containerSize = normalizedSize + normalizedLabelOffset * 2 + 48;
  const centerInContainer = containerSize / 2;
  const isCanEditValues = isEditableValuesEnabled && (typeof onEvent === 'function' || typeof onDataChangeRequest === 'function');
  const labelAnchorGap = 4;

  const emitDataChangeRequest = (requestType, requestData) => {
    if (typeof onEvent === 'function') {
      return onEvent('dataChangeRequest', { requestType, requestData });
    }
    if (typeof onDataChangeRequest === 'function') {
      return onDataChangeRequest(requestType, requestData);
    }
    return null;
  };

  const requestAxisValueUpdate = (axisIndex, ratio) => {
    const axis = axisGeometry[axisIndex];
    if (!axis) return;
    const nextRatio = clampValue(ratio, 0, 1);
    const nextValue = axis.min + (axis.max - axis.min) * nextRatio;
    emitDataChangeRequest('update-axis-value', {
      index: axisIndex,
      axisId: axis.id,
      nextRatio,
      nextValue,
    });
  };

  const updateDraggedAxisByPointerEvent = (event) => {
    if (!isCanEditValues) return;
    const axisIndex = draggingAxisIndexRef.current;
    if (axisIndex < 0 || axisIndex >= axisGeometry.length) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const axis = axisGeometry[axisIndex];
    const vectorX = pointerX - center;
    const vectorY = pointerY - center;
    const radialDistance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    if (radialDistance > radius + normalizedDragOutsideTolerancePx) return;
    const axisLengthSquared = axis.edgeX * axis.edgeX + axis.edgeY * axis.edgeY;
    if (axisLengthSquared <= 0) return;
    const projection = (vectorX * axis.edgeX + vectorY * axis.edgeY) / axisLengthSquared;
    requestAxisValueUpdate(axisIndex, projection);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    event.preventDefault();
    updateDraggedAxisByPointerEvent(event);
  };

  const stopDragging = () => {
    draggingAxisIndexRef.current = -1;
    setIsDragging(false);
  };

  const handlePointerUp = (event) => {
    if (!isDragging) return;
    event.preventDefault();
    stopDragging();
  };

  const startDraggingAxis = (event, axisIndex) => {
    if (!isCanEditValues) return;
    event.preventDefault();
    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    draggingAxisIndexRef.current = axisIndex;
    setIsDragging(true);
    updateDraggedAxisByPointerEvent(event);
  };

  return (
    <div className="radar-root" style={{ ...containerStyle, width: `${containerSize}px`, height: `${containerSize}px` }}>
      {validAxisList.length < 3 ? (
        <div className="radar-empty">Radar requires at least 3 axes.</div>
      ) : (
        <>
          <svg
            ref={svgRef}
            className="radar-svg"
            viewBox={`0 0 ${normalizedSize} ${normalizedSize}`}
            width={normalizedSize}
            height={normalizedSize}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <g>
              {ringPolygons.map((points, index) => (
                <polygon key={`ring-${index}`} points={points} className="radar-ring" />
              ))}
              {axisGeometry.map((axis) => (
                <line
                  key={`${axis.id}-line`}
                  x1={center}
                  y1={center}
                  x2={center + axis.edgeX}
                  y2={center + axis.edgeY}
                  className="radar-axis-line"
                />
              ))}
              <polygon points={valuePolygon} className="radar-value-shape" />
              {axisGeometry.map((axis, axisIndex) => (
                <circle
                  key={`${axis.id}-dot`}
                  cx={center + axis.valueX}
                  cy={center + axis.valueY}
                  r={isCanEditValues ? '5' : '3'}
                  className={isCanEditValues ? 'radar-value-dot radar-value-dot-editable' : 'radar-value-dot'}
                  onPointerDown={(event) => startDraggingAxis(event, axisIndex)}
                />
              ))}
              {isShowValues ? axisGeometry.flatMap((axis) => {
                const tickTexts = Array.from({ length: normalizedRingCount }, (_, index) => {
                  const ratio = (index + 1) / normalizedRingCount;
                  const tickValue = axis.min + (axis.max - axis.min) * ratio;
                  const shiftRatio = ratio < 0.6 ? ratio - 0.03 : ratio + 0.03;
                  return (
                    <text
                      key={`${axis.id}-tick-${index}`}
                      x={center + axis.edgeX * shiftRatio}
                      y={center + axis.edgeY * shiftRatio}
                      className="radar-tick-text"
                    >
                      {formatNumericLabel(tickValue)}
                    </text>
                  );
                });
                const valueLabelOffsetPx = 8;
                const unitX = axis.edgeX / radius;
                const unitY = axis.edgeY / radius;
                const valueLabelX = center + axis.valueX + unitX * valueLabelOffsetPx;
                const valueLabelY = center + axis.valueY + unitY * valueLabelOffsetPx;
                const valueTextAnchor = unitX > 0.2 ? 'start' : (unitX < -0.2 ? 'end' : 'middle');
                const valueDominantBaseline = unitY > 0.2
                  ? 'text-before-edge'
                  : (unitY < -0.2 ? 'text-after-edge' : 'middle');
                const valueText = (
                  <text
                    key={`${axis.id}-value-text`}
                    x={valueLabelX}
                    y={valueLabelY}
                    className="radar-value-text"
                    textAnchor={valueTextAnchor}
                    dominantBaseline={valueDominantBaseline}
                  >
                    {formatNumericLabel(axis.value)}
                  </text>
                );
                return [...tickTexts, valueText];
              }) : null}
            </g>
          </svg>
          {axisGeometry.map((axis) => {
            const CornerComp = getCompFn ? getCompFn(axis.component, axis) : null;
            const anchorRatio = (radius + normalizedLabelOffset + labelAnchorGap) / radius;
            const left = centerInContainer + axis.edgeX * anchorRatio;
            const top = centerInContainer + axis.edgeY * anchorRatio;
            const translateXPercent = axis.edgeX >= 0 ? 0 : -100;
            const translateYPercent = axis.edgeY >= 0 ? 0 : -100;
            return (
              <div
                key={`${axis.id}-label`}
                className="radar-corner-wrap"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  transform: `translate(${translateXPercent}%, ${translateYPercent}%)`,
                }}
              >
                {CornerComp
                  ? (typeof CornerComp === 'function'
                    ? <CornerComp axis={axis} />
                    : React.cloneElement(CornerComp, { axis }))
                  : <div className="radar-corner-text">{axis.label}</div>}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Radar;
