import React from 'react';
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
  getComp = null,
  style = {},
}) => {
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

  return (
    <div className="radar-root" style={{ ...style, width: `${containerSize}px`, height: `${containerSize}px` }}>
      {validAxisList.length < 3 ? (
        <div className="radar-empty">Radar requires at least 3 axes.</div>
      ) : (
        <>
          <svg className="radar-svg" viewBox={`0 0 ${normalizedSize} ${normalizedSize}`} width={normalizedSize} height={normalizedSize}>
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
              {axisGeometry.map((axis) => (
                <circle
                  key={`${axis.id}-dot`}
                  cx={center + axis.valueX}
                  cy={center + axis.valueY}
                  r="3"
                  className="radar-value-dot"
                />
              ))}
            </g>
          </svg>
          {axisGeometry.map((axis) => {
            const CornerComp = getComp ? getComp(axis.component, axis) : null;
            const left = centerInContainer + axis.edgeX * ((radius + labelOffset) / radius);
            const top = centerInContainer + axis.edgeY * ((radius + labelOffset) / radius);
            return (
              <div
                key={`${axis.id}-label`}
                className="radar-corner-wrap"
                style={{ left: `${left}px`, top: `${top}px` }}
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
