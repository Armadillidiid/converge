/**
 * Converts a size in megabytes (MB) to bytes.
 */
export function fromMBtoBytes(size: number): number {
  if (size < 0) {
    throw new RangeError("Size must be a non-negative number.");
  }
  return size * 1024 * 1024;
}
