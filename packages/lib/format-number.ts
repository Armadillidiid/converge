/**
 * Formats a number according to the specified locale and options.
 */
export function formatNumber(
  value: number | `${number}`,
  options?: Intl.NumberFormatOptions & { enableDecimal?: boolean },
  locale: string = "en-NG",
): string {
  const { enableDecimal, ...intlOptions } = options || {};

  if (enableDecimal) {
    intlOptions.minimumFractionDigits = 2;
  } else {
    intlOptions.minimumFractionDigits = 0;
    intlOptions.maximumFractionDigits = 0;
  }

  const numericValue: number =
    typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, intlOptions).format(numericValue);
}
