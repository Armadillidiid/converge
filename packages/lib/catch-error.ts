/**
 * A utility function that wraps a promise and catches specified errors.
 *
 * @template T - The type of the resolved value of the promise.
 * @template E - A constructor type for the error classes to catch.
 *
 * @param {Promise<T>} promise - The promise to be executed and monitored for errors.
 * @param {E[]} [errorsToCatch] - An optional array of error constructors. If provided, only errors
 *                                 that are instances of these constructors will be caught.
 *
 * @returns {Promise<[undefined, T] | [InstanceType<E>]>} - A promise that resolves to a tuple:
 * - If the promise resolves successfully, it returns a tuple of `[undefined, data]`, where `data`
 *   is the resolved value of the promise.
 * - If the promise is rejected and the error is caught, it returns a tuple of `[error]`, where
 *   `error` is an instance of one of the specified error types.
 *
 * @throws {unknown} - If the promise is rejected with an error that is not caught (i.e., not an
 *                     instance of any constructor in `errorsToCatch`), the error is re-thrown.
 *
 * @example
 *
 * class CustomError extends Error {}
 *
 * async function example() {
 *   const result = await catchError(
 *     someAsyncFunction(),
 *     [CustomError]
 *   );
 *
 *   if (result[0] instanceof CustomError) {
 *     console.error('Caught a CustomError:', result[0]);
 *   } else {
 *     console.log('Success:', result[1]);
 *   }
 * }
 */
export async function catchError<T, E extends new (message?: string) => Error>(
  promise: Promise<T>,
  errorsToCatch?: E[],
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error: unknown) => {
      if (errorsToCatch === undefined) {
        return [error as InstanceType<E>];
      }
      if (errorsToCatch.some((errorType) => error instanceof errorType)) {
        return [error as InstanceType<E>];
      }
      throw error;
    });
}
