/**
 * Delays the execution for a specified amount of time.
 */
export async function delay(ms: number) {
  if (typeof ms !== "number" || ms < 0) {
    throw new TypeError('The parameter "ms" must be a non-negative number.');
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
