import React, { useRef, useState } from 'react';
import './radar.css';

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
  axisItems = [],
  size = 260,
  ringCount = 5,
  rotationOffsetDeg = 0,
  labelOffset = 18,
  showValues = true,
  isValueEditable = false,
  dragOutsideTolerancePx = 16,
  onDataChangeRequest,
  getComp = null,
  style = {},
}) => {
  const svgRef = useRef(null);
  const draggingAxisIndexRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);
  const normalizedSize = Math.max(120, toSafeNumber(size, 260));
  const normalizedRingCount = Math.max(1, Math.floor(toSafeNumber(ringCount, 5)));
  const axisList = Array.isArray(axisItems) ? axisItems.map(normalizeAxis) : [];
  const validAxisList = axisList.length >= 3 ? axisList : [];
  const radius = normalizedSize / 2;
  const center = radius;
  const axisGeometry = buildRadarGeometry(validAxisList, radius, rotationOffsetDeg);
  const ringPolygons = Array.from({ length: normalizedRingCount }, (_, index) => {
    const ratio = (index + 1) / normalizedRingCount;
    return axisGeometry.map((axis) => `${center + axis.edgeX * ratio},${center + axis.edgeY * ratio}`).join(' ');
  });
  const valuePolygon = axisGeometry.map((axis) => `${center + axis.valueX},${center + axis.valueY}`).join(' ');
  const containerSize = normalizedSize + labelOffset * 2 + 48;
  const centerInContainer = containerSize / 2;
  const canEditValues = isValueEditable && typeof onDataChangeRequest === 'function';
  const labelAnchorGap = 4;

  const requestAxisValueUpdate = (axisIndex, ratio) => {
    const axis = axisGeometry[axisIndex];
    if (!axis) return;
    const nextRatio = clampValue(ratio, 0, 1);
    const nextValue = axis.min + (axis.max - axis.min) * nextRatio;
    onDataChangeRequest('update-axis-value', {
      index: axisIndex,
      axisId: axis.id,
      nextRatio,
      nextValue,
    });
  };

  const updateDraggedAxisByPointerEvent = (event) => {
    if (!canEditValues) return;
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
    const outsideTolerance = Math.max(0, toSafeNumber(dragOutsideTolerancePx, 16));
    if (radialDistance > radius + outsideTolerance) return;
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
    if (!canEditValues) return;
    event.preventDefault();
    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    draggingAxisIndexRef.current = axisIndex;
    setIsDragging(true);
    updateDraggedAxisByPointerEvent(event);
  };

  return (
    <div className="radar-root" style={{ ...style, width: `${containerSize}px`, height: `${containerSize}px` }}>
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
                  r={canEditValues ? '5' : '3'}
                  className={canEditValues ? 'radar-value-dot radar-value-dot-editable' : 'radar-value-dot'}
                  onPointerDown={(event) => startDraggingAxis(event, axisIndex)}
                />
              ))}
              {showValues ? axisGeometry.flatMap((axis) => {
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
            const CornerComp = getComp ? getComp(axis.component, axis) : null;
            const anchorRatio = (radius + labelOffset + labelAnchorGap) / radius;
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
