/**
 * Generates a random identifier.
 *
 * @param options - Configuration options for ID generation.
 * @param options.length - Length of the numeric ID to generate. Ignored if `uuid` is true. Default is 6.
 * @param options.uuid - Whether to generate a UUID (v4). If true, `length` is ignored. Default is false.
 * @returns A random numeric ID (as string) or a UUID.
 *
 * @example
 * generateID(); // e.g. "527381"
 * generateID({ length: 8 }); // e.g. "83917452"
 * generateID({ uuid: true }); // e.g. "7b9c930e-0c35-4b41-8a3f-2b079f4d5cf2"
 */
export function generateID(options?: {
  length?: number;
  uuid?: boolean;
}): string {
  const { length = 6, uuid = false } = options ?? {};

  if (uuid) {
    return globalThis.crypto.randomUUID();
  }

  if (length <= 0) {
    throw new Error("Length must be a positive integer");
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber.toString();
}
