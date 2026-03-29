// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

function bytes(
  value: string | number,
  options?: {
    decimalPlaces?: number;
    fixedDecimals?: boolean;
    thousandsSeparator?: string;
    unit?: string;
    unitSeparator?: string;
  },
): string | number | null {
  if (typeof value === "string") {
    return parse(value);
  }
  if (typeof value === "number") {
    return format(value, options);
  }
  return null;
}

const formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
const formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;

const map: { [key: string]: number } = {
  b: 1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  tb: 1024 ** 4,
  pb: 1024 ** 5,
};

const parseRegExp = /^([-+]?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;

function format(
  value: number,
  options: {
    decimalPlaces?: number;
    fixedDecimals?: boolean;
    thousandsSeparator?: string;
    unit?: string;
    unitSeparator?: string;
  } = {},
): string | null {
  if (!Number.isFinite(value)) return null;

  const mag = Math.abs(value);
  const thousandsSeparator = options.thousandsSeparator ?? "";
  const unitSeparator = options.unitSeparator ?? "";
  const decimalPlaces = options.decimalPlaces ?? 2;
  const fixedDecimals = !!options.fixedDecimals;

  let unit = options.unit ?? "";

  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.pb) unit = "PB";
    else if (mag >= map.tb) unit = "TB";
    else if (mag >= map.gb) unit = "GB";
    else if (mag >= map.mb) unit = "MB";
    else if (mag >= map.kb) unit = "KB";
    else unit = "B";
  }

  const val = value / map[unit.toLowerCase()];
  let str = val.toFixed(decimalPlaces);

  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, "$1");
  }

  if (thousandsSeparator) {
    str = str
      .split(".")
      .map((s, i) =>
        i === 0 ? s.replace(formatThousandsRegExp, thousandsSeparator) : s,
      )
      .join(".");
  }

  return str + unitSeparator + unit;
}

function parse(val: string | number): number | null {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val !== "string") return null;

  const results = parseRegExp.exec(val);
  let floatValue: number;
  let unit = "b";

  if (!results) {
    floatValue = parseInt(val, 10);
  } else {
    floatValue = parseFloat(results[1]);
    unit = results[3].toLowerCase();
  }

  return isNaN(floatValue) ? null : Math.floor(map[unit] * floatValue);
}

export const toBytes = bytes;
export const formatBytes = format;
export const parseBytes = parse;
