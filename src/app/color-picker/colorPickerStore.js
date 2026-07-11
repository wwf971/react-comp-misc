import { makeAutoObservable } from 'mobx';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const round = (value) => Math.round(Number(value) || 0);

function normalizeHex(hexRaw) {
  const text = String(hexRaw ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(text)) {
    return `#${text.split('').map((char) => `${char}${char}`).join('')}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(text)) {
    return `#${text}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{8}$/.test(text)) {
    return `#${text.slice(0, 6)}`.toUpperCase();
  }
  return null;
}

function parseColorValue(valueRaw) {
  if (typeof valueRaw === 'object' && valueRaw !== null) {
    return {
      hex: normalizeHex(valueRaw.hex ?? valueRaw.colorHex) ?? '#2563EB',
      alpha: clamp(round(valueRaw.alpha ?? valueRaw.alphaPercent ?? 100), 0, 100),
    };
  }

  const text = String(valueRaw ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{8}$/.test(text)) {
    return {
      hex: `#${text.slice(0, 6)}`.toUpperCase(),
      alpha: round((Number.parseInt(text.slice(6, 8), 16) / 255) * 100),
    };
  }

  return {
    hex: normalizeHex(valueRaw) ?? '#2563EB',
    alpha: 100,
  };
}

function alphaToHex(alpha) {
  return clamp(round((clamp(alpha, 0, 100) / 100) * 255), 0, 255).toString(16).padStart(2, '0').toUpperCase();
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => clamp(round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function hexToRgb(hexRaw) {
  const hex = normalizeHex(hexRaw);
  if (!hex) return null;
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
}

function hsvToRgb(hueRaw, saturationRaw, valueRaw) {
  const hue = ((clamp(hueRaw, 0, 360) % 360) + 360) % 360;
  const saturation = clamp(saturationRaw, 0, 100) / 100;
  const value = clamp(valueRaw, 0, 100) / 100;
  const chroma = value * saturation;
  const huePrime = hue / 60;
  const mixValue = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const valueMin = value - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) [red, green, blue] = [chroma, mixValue, 0];
  else if (huePrime >= 1 && huePrime < 2) [red, green, blue] = [mixValue, chroma, 0];
  else if (huePrime >= 2 && huePrime < 3) [red, green, blue] = [0, chroma, mixValue];
  else if (huePrime >= 3 && huePrime < 4) [red, green, blue] = [0, mixValue, chroma];
  else if (huePrime >= 4 && huePrime < 5) [red, green, blue] = [mixValue, 0, chroma];
  else [red, green, blue] = [chroma, 0, mixValue];

  return {
    red: round((red + valueMin) * 255),
    green: round((green + valueMin) * 255),
    blue: round((blue + valueMin) * 255),
  };
}

function rgbToHsv(redRaw, greenRaw, blueRaw) {
  const red = clamp(redRaw, 0, 255) / 255;
  const green = clamp(greenRaw, 0, 255) / 255;
  const blue = clamp(blueRaw, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  return {
    hue: round((hue + 360) % 360),
    saturation: max === 0 ? 0 : round((delta / max) * 100),
    value: round(max * 100),
  };
}

function hsvToHex(hue, saturation, value) {
  const rgb = hsvToRgb(hue, saturation, value);
  return rgbToHex(rgb.red, rgb.green, rgb.blue);
}

function colorToCss(hex, alpha) {
  const rgb = hexToRgb(hex) ?? { red: 0, green: 0, blue: 0 };
  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${clamp(alpha, 0, 100) / 100})`;
}

const colorPickerModeOptions = [
  { value: 'hsv', label: 'HSV' },
  { value: 'swatch', label: 'Swatch' },
];

const swatchGridDefault = {
  rowCount: 3,
  colCount: 8,
  cells: [
    { row: 0, col: 0, value: '#FF0000FF', label: 'Red' },
    { row: 0, col: 1, value: '#00FF00FF', label: 'Green' },
    { row: 0, col: 2, value: '#0000FFFF', label: 'Blue' },
    { row: 0, col: 3, value: '#FFFF00FF', label: 'Yellow' },
    { row: 0, col: 4, value: '#00FFFFFF', label: 'Cyan' },
    { row: 0, col: 5, value: '#FF00FFFF', label: 'Magenta' },
    { row: 0, col: 6, value: '#FF8000FF', label: 'Orange' },
    { row: 0, col: 7, value: '#8000FFFF', label: 'Violet' },
    { row: 1, col: 0, value: '#800000FF', label: 'Dark red' },
    { row: 1, col: 1, value: '#008000FF', label: 'Dark green' },
    { row: 1, col: 2, value: '#000080FF', label: 'Dark blue' },
    { row: 1, col: 3, value: '#808000FF', label: 'Olive' },
    { row: 1, col: 4, value: '#008080FF', label: 'Dark cyan' },
    { row: 1, col: 5, value: '#800080FF', label: 'Purple' },
    { row: 1, col: 6, value: '#FFFFFFFF', label: 'White' },
    { row: 1, col: 7, value: '#000000FF', label: 'Black' },
    { row: 2, col: 0, value: '#FF000080', label: 'Red alpha' },
    { row: 2, col: 1, value: '#00FF0080', label: 'Green alpha' },
    { row: 2, col: 2, value: '#0000FF80', label: 'Blue alpha' },
    { row: 2, col: 3, value: '#FFFF0080', label: 'Yellow alpha' },
    { row: 2, col: 4, value: '#00FFFF80', label: 'Cyan alpha' },
    { row: 2, col: 5, value: '#FF00FF80', label: 'Magenta alpha' },
    { row: 2, col: 6, value: '#FF800080', label: 'Orange alpha' },
    { row: 2, col: 7, value: '#8000FF80', label: 'Violet alpha' },
  ],
};

class ColorPickerStore {
  colorInitialValue = '#2563EBFF';
  hue = 0;
  saturation = 0;
  value = 0;
  alpha = 100;
  modeCurrent = 'hsv';
  swatchGrid = swatchGridDefault;
  isSwatchGapShown = true;
  swatchCellShape = 'square';

  constructor({ colorInitialValue = '#2563EBFF', swatchGrid = swatchGridDefault, isSwatchGapShown = true, swatchCellShape = 'square' } = {}) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.swatchGrid = swatchGrid;
    this.isSwatchGapShown = isSwatchGapShown !== false;
    this.swatchCellShape = swatchCellShape === 'circle' ? 'circle' : 'square';
    this.colorInitialValue = this.normalizeColorValue(colorInitialValue);
    this.setColorValue(this.colorInitialValue);
  }

  get colorCurrentHex() {
    return hsvToHex(this.hue, this.saturation, this.value);
  }

  get colorCurrentValue() {
    return `${this.colorCurrentHex}${alphaToHex(this.alpha)}`;
  }

  get colorCurrentCss() {
    return colorToCss(this.colorCurrentHex, this.alpha);
  }

  get hueColorHex() {
    return hsvToHex(this.hue, 100, 100);
  }

  normalizeColorValue(valueRaw) {
    const colorParsed = parseColorValue(valueRaw);
    return `${colorParsed.hex}${alphaToHex(colorParsed.alpha)}`;
  }

  setColorValue(valueRaw) {
    const colorParsed = parseColorValue(valueRaw);
    const rgb = hexToRgb(colorParsed.hex);
    if (!rgb) return false;
    const hsv = rgbToHsv(rgb.red, rgb.green, rgb.blue);
    this.hue = hsv.hue;
    this.saturation = hsv.saturation;
    this.value = hsv.value;
    this.alpha = colorParsed.alpha;
    return true;
  }

  setHsv(key, valueRaw) {
    if (key === 'hue') this.hue = clamp(round(valueRaw), 0, 360);
    if (key === 'saturation') this.saturation = clamp(round(valueRaw), 0, 100);
    if (key === 'value') this.value = clamp(round(valueRaw), 0, 100);
    if (key === 'alpha') this.alpha = clamp(round(valueRaw), 0, 100);
  }

  restoreInitial() {
    this.setColorValue(this.colorInitialValue);
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'modeSet') {
      const modeNext = String(eventData.mode ?? '');
      if (colorPickerModeOptions.some((option) => option.value === modeNext)) this.modeCurrent = modeNext;
      return { code: 0 };
    }

    if (eventType === 'hsvSet') {
      this.setHsv(eventData.key, eventData.value);
      return { code: 0 };
    }

    if (eventType === 'colorValueSet') {
      this.setColorValue(eventData.value);
      return { code: 0 };
    }

    if (eventType === 'swatchSelect') {
      this.setColorValue(eventData.value);
      return { code: 0 };
    }

    if (eventType === 'restoreInitial') {
      this.restoreInitial();
      return { code: 0 };
    }

    return { code: 1, message: `Unsupported event: ${eventType}` };
  }
}

function createColorPickerStore(config = {}) {
  return new ColorPickerStore(config);
}

export { createColorPickerStore, colorPickerModeOptions, swatchGridDefault };
export default ColorPickerStore;
