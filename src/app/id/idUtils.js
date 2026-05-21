const MS48_OFFSET_BITS = 16n;
const MS48_OFFSET_SIZE = 1n << MS48_OFFSET_BITS;
const MS48_OFFSET_MASK = MS48_OFFSET_SIZE - 1n;
const MS48_MAX_TIME_MS = (1n << 48n) - 1n;
const MS48_REASONABLE_TIME_MIN_MS = Date.UTC(2000, 0, 1);
const MS48_REASONABLE_TIME_MAX_MS = Date.UTC(2040, 0, 1);

let lastGeneratedMs = 0;
let lastGeneratedOffset = -1;

const padNumber = (value, length) => {
  return `${value}`.padStart(length, '0');
};

const getLocalTimezoneHourOffset = () => {
  return Math.round(-new Date().getTimezoneOffset() / 60);
};

const normalizeTimezoneHourOffset = (timezoneHourOffset) => {
  const value = Number(timezoneHourOffset);
  if (!Number.isFinite(value)) return getLocalTimezoneHourOffset();
  return Math.max(-23, Math.min(23, Math.trunc(value)));
};

const formatTimezoneHourOffset = (timezoneHourOffset = getLocalTimezoneHourOffset()) => {
  const normalizedOffset = normalizeTimezoneHourOffset(timezoneHourOffset);
  const sign = normalizedOffset >= 0 ? '+' : '-';
  return `${sign}${padNumber(Math.abs(normalizedOffset), 2)}`;
};

const formatTimestamp10Ms = (timeMs, timezoneHourOffset = getLocalTimezoneHourOffset()) => {
  const normalizedOffset = normalizeTimezoneHourOffset(timezoneHourOffset);
  const date = new Date(Number(timeMs) + normalizedOffset * 60 * 60 * 1000);
  const centisecond = Math.floor(date.getUTCMilliseconds() / 10);
  return [
    padNumber(date.getUTCFullYear(), 4),
    padNumber(date.getUTCMonth() + 1, 2),
    padNumber(date.getUTCDate(), 2),
    '_',
    padNumber(date.getUTCHours(), 2),
    padNumber(date.getUTCMinutes(), 2),
    padNumber(date.getUTCSeconds(), 2),
    padNumber(centisecond, 2),
    formatTimezoneHourOffset(normalizedOffset),
  ].join('');
};

const normalizeMs48TimeMs = (timeMs = Date.now()) => {
  const normalizedTimeMs = Math.trunc(Number(timeMs));
  if (!Number.isFinite(normalizedTimeMs) || normalizedTimeMs < 0) {
    throw new Error('timeMs must be a non-negative finite number');
  }
  const timeBigInt = BigInt(normalizedTimeMs);
  if (timeBigInt > MS48_MAX_TIME_MS) {
    throw new Error('timeMs exceeds 48-bit range');
  }
  return normalizedTimeMs;
};

const normalizeMs48Offset = (offset = 0) => {
  const normalizedOffset = Math.trunc(Number(offset));
  if (!Number.isFinite(normalizedOffset) || normalizedOffset < 0 || normalizedOffset > Number(MS48_OFFSET_MASK)) {
    throw new Error('offset must be an integer from 0 to 65535');
  }
  return normalizedOffset;
};

const randomMs48Offset = () => {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const values = new Uint16Array(1);
    cryptoObj.getRandomValues(values);
    return Number(values[0]);
  }
  return Math.floor(Math.random() * Number(MS48_OFFSET_SIZE));
};

const allocateMs48Offset = (timeMs) => {
  if (timeMs !== lastGeneratedMs) {
    lastGeneratedMs = timeMs;
    lastGeneratedOffset = randomMs48Offset();
    return lastGeneratedOffset;
  }
  lastGeneratedOffset = (lastGeneratedOffset + 1) & Number(MS48_OFFSET_MASK);
  return lastGeneratedOffset;
};

const buildMs48IdBigInt = ({ timeMs = Date.now(), offset = 0 } = {}) => {
  const normalizedTimeMs = normalizeMs48TimeMs(timeMs);
  const normalizedOffset = normalizeMs48Offset(offset);
  return (BigInt(normalizedTimeMs) << MS48_OFFSET_BITS) | BigInt(normalizedOffset);
};

const createMs48IdBigInt = (options = {}) => {
  const timeMs = normalizeMs48TimeMs(options.timeMs ?? Date.now());
  const offset = options.offset === undefined ? allocateMs48Offset(timeMs) : normalizeMs48Offset(options.offset);
  return buildMs48IdBigInt({ timeMs, offset });
};

const parseBigIntWithRadix = (text, radix) => {
  const normalizedText = `${text ?? ''}`.trim().toLowerCase();
  if (!normalizedText) throw new Error('id text is required');
  const normalizedRadix = Number(radix);
  if (!Number.isInteger(normalizedRadix) || normalizedRadix < 2 || normalizedRadix > 36) {
    throw new Error('radix must be an integer from 2 to 36');
  }
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  let output = 0n;
  for (const char of normalizedText) {
    const digit = digits.indexOf(char);
    if (digit < 0 || digit >= normalizedRadix) {
      throw new Error(`invalid digit for base ${normalizedRadix}`);
    }
    output = output * BigInt(normalizedRadix) + BigInt(digit);
  }
  return output;
};

const reverseText = (text) => {
  return `${text ?? ''}`.split('').reverse().join('');
};

const toBase36HighText = (idBigInt) => {
  return BigInt(idBigInt).toString(36);
};

const toBase36LowText = (idBigInt) => {
  return reverseText(toBase36HighText(idBigInt));
};

const base36HighToBigInt = (text) => {
  return parseBigIntWithRadix(text, 36);
};

const base36LowToBigInt = (text) => {
  return parseBigIntWithRadix(reverseText(`${text ?? ''}`.trim().toLowerCase()), 36);
};

const getTimeMsFromMs48BigInt = (idBigInt) => {
  const timeMsBigInt = BigInt(idBigInt) >> MS48_OFFSET_BITS;
  if (timeMsBigInt > MS48_MAX_TIME_MS) throw new Error('id time exceeds 48-bit range');
  return Number(timeMsBigInt);
};

const isReasonableMs48TimeMs = (timeMs) => {
  return timeMs >= MS48_REASONABLE_TIME_MIN_MS && timeMs < MS48_REASONABLE_TIME_MAX_MS;
};

const buildEncodingCandidate = (encoding, idBigInt, options = {}) => {
  try {
    const timeMs = getTimeMsFromMs48BigInt(idBigInt);
    return {
      encoding,
      idBigInt,
      timeMs,
      offset: Number(idBigInt & MS48_OFFSET_MASK),
      timestampText: formatTimestamp10Ms(timeMs, options.timezoneHourOffset),
      isReasonable: isReasonableMs48TimeMs(timeMs),
      errorText: '',
    };
  } catch (error) {
    return {
      encoding,
      idBigInt,
      timeMs: null,
      offset: null,
      timestampText: '',
      isReasonable: false,
      errorText: error instanceof Error ? error.message : 'invalid id',
    };
  }
};

const detectMs48StringEncoding = (idText, options = {}) => {
  const normalizedText = `${idText ?? ''}`.trim().toLowerCase();
  if (!normalizedText) {
    return {
      encoding: '',
      candidates: [],
      errorText: 'id text is required',
    };
  }
  if (/^\d+$/.test(normalizedText)) {
    const idBigInt = parseBigIntWithRadix(normalizedText, 10);
    const candidate = buildEncodingCandidate('decimal', idBigInt, options);
    return {
      encoding: candidate.isReasonable ? 'decimal' : '',
      candidates: [candidate],
      errorText: candidate.isReasonable ? '' : 'decimal timestamp is outside 2000-2040',
    };
  }
  if (!/^[0-9a-z]+$/.test(normalizedText)) {
    return {
      encoding: '',
      candidates: [],
      errorText: 'id must use digits 0-9 and lowercase letters a-z',
    };
  }
  const lowCandidate = buildEncodingCandidate('base36-low', base36LowToBigInt(normalizedText), options);
  const highCandidate = buildEncodingCandidate('base36-high', base36HighToBigInt(normalizedText), options);
  const reasonableCandidates = [lowCandidate, highCandidate].filter((candidate) => candidate.isReasonable);
  if (reasonableCandidates.length === 1) {
    return {
      encoding: reasonableCandidates[0].encoding,
      candidates: [lowCandidate, highCandidate],
      errorText: '',
    };
  }
  if (reasonableCandidates.length > 1) {
    return {
      encoding: '',
      candidates: [lowCandidate, highCandidate],
      errorText: 'ambiguous id: both base36-low and base36-high produce timestamps from 2000 to 2040',
    };
  }
  return {
    encoding: '',
    candidates: [lowCandidate, highCandidate],
    errorText: 'timestamp is outside 2000-2040 for both base36-low and base36-high',
  };
};

const parseMs48IdBigInt = (id, options = {}) => {
  if (typeof id === 'bigint') return id;
  if (typeof id === 'number') {
    if (!Number.isSafeInteger(id) || id < 0) throw new Error('number id must be a non-negative safe integer');
    return BigInt(id);
  }
  const form = `${options.form ?? ''}`.trim().toLowerCase();
  if (form === 'base36' || form === 'base36-low') return base36LowToBigInt(id);
  if (form === 'base36-high') return base36HighToBigInt(id);
  if (form === 'decimal') return parseBigIntWithRadix(id, 10);
  const text = `${id ?? ''}`.trim().toLowerCase();
  if (!/[a-z]/.test(text)) return parseBigIntWithRadix(text, 10);
  const detected = detectMs48StringEncoding(text, options);
  if (detected.errorText) throw new Error(detected.errorText);
  return detected.encoding === 'base36-high' ? base36HighToBigInt(text) : base36LowToBigInt(text);
};

const parseMs48Id = (id, options = {}) => {
  const idBigInt = parseMs48IdBigInt(id, options);
  if (idBigInt < 0n) throw new Error('id must be non-negative');
  const timeMs = getTimeMsFromMs48BigInt(idBigInt);
  const offset = Number(idBigInt & MS48_OFFSET_MASK);
  const base36HighText = toBase36HighText(idBigInt);
  const base36LowText = toBase36LowText(idBigInt);
  return {
    idBigInt,
    decimalText: idBigInt.toString(10),
    base36Text: base36LowText,
    base36LowText,
    base36HighText,
    timeMs,
    offset,
    timestampText: formatTimestamp10Ms(timeMs, options.timezoneHourOffset),
  };
};

const createMs48Id = (options = {}) => {
  return toBase36LowText(createMs48IdBigInt(options));
};

const createMs48IdDecimal = (options = {}) => {
  return createMs48IdBigInt(options).toString(10);
};

const convertMs48Id = (id, options = {}) => {
  const parsedId = parseMs48Id(id, options);
  return {
    decimalText: parsedId.decimalText,
    base36Text: parsedId.base36Text,
    base36LowText: parsedId.base36LowText,
    base36HighText: parsedId.base36HighText,
  };
};

const getUnixStampMs = () => {
  return Date.now();
};

const getIdInt = (unixStampMs = Date.now(), offset = 0) => {
  return buildMs48IdBigInt({ timeMs: unixStampMs, offset });
};

const getRandomIdInt = () => {
  return createMs48IdBigInt();
};

const extractTimestampMs = (idBigInt) => {
  return getTimeMsFromMs48BigInt(idBigInt);
};

const extractOffset = (idBigInt) => {
  return Number(BigInt(idBigInt) & MS48_OFFSET_MASK);
};

const idIntTo09az = (idBigInt) => {
  return toBase36LowText(idBigInt);
};

const id09azToInt = (idText) => {
  return base36LowToBigInt(idText);
};

const genIdStr = (offset) => {
  return createMs48Id(offset === undefined ? {} : { offset });
};

const formatIdInfo = (idText, options = {}) => {
  try {
    const parsedId = parseMs48Id(idText, options);
    return {
      idString: idText,
      idInt: parsedId.decimalText,
      timestampMs: parsedId.timeMs,
      timestamp: parsedId.timestampText,
      offset: parsedId.offset,
      dateISO: new Date(parsedId.timeMs).toISOString(),
      valid: true,
    };
  } catch (error) {
    return {
      idString: idText,
      idInt: null,
      timestampMs: null,
      timestamp: '',
      offset: null,
      dateISO: null,
      valid: false,
      error: error instanceof Error ? error.message : 'invalid id',
    };
  }
};

const generateSequentialId = () => {
  return createMs48Id();
};

export {
  MS48_OFFSET_BITS,
  MS48_OFFSET_SIZE,
  MS48_OFFSET_MASK,
  MS48_MAX_TIME_MS,
  MS48_REASONABLE_TIME_MIN_MS,
  MS48_REASONABLE_TIME_MAX_MS,
  buildMs48IdBigInt,
  createMs48Id,
  createMs48IdBigInt,
  createMs48IdDecimal,
  convertMs48Id,
  detectMs48StringEncoding,
  extractOffset,
  extractTimestampMs,
  formatTimestamp10Ms,
  formatTimezoneHourOffset,
  formatIdInfo,
  genIdStr,
  generateSequentialId,
  getIdInt,
  getRandomIdInt,
  getUnixStampMs,
  id09azToInt,
  idIntTo09az,
  parseMs48Id,
  parseMs48IdBigInt,
};
