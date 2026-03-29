/**
 * Generates a random number between the specified minimum and maximum values.
 *
 * @param min The minimum value of the range (inclusive).
 * @param max The maximum value of the range (exclusive).
 * @returns A random number between min (inclusive) and max (exclusive).
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Implements exponential backoff with jitter for retry logic, generating a sleep time based on the number of attempts.
 *
 * @param attempts The number of retry attempts made so far.
 * @param base The base time in milliseconds for exponential backoff calculation.
 * @param cap The maximum allowed sleep time in milliseconds.
 * @returns The calculated sleep time with jitter applied.
 */
export function exponentialBackoffWithJitter(
  attempts: number,
  base: number,
  cap: number,
): number {
  const maxSleep = Math.min(cap, base * Math.pow(2, attempts));

  const sleep = randomBetween(0, maxSleep);

  return sleep;
}
