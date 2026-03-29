/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Represents the keys of nested properties in an object.
 *
 * @template T - The object type.
 *
 * @example
 * // Example Usage
 * type ExampleType = {
 *   foo: {
 *     bar: string;
 *   };
 *   qux: boolean;
 * };
 *
 * type ExampleNestedKeys = NestedKey<ExampleType>;
 * // Result: "foo" | "qux" | "foo.bar"
 */
export type Path<T extends Record<string, unknown>> = {
  [K in Extract<keyof T, string>]: T[K] extends Array<unknown>
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}` | `${K}.${Path<T[K]>}`
      : K;
}[Extract<keyof T, string>];

/**
 * Retrieves the value of a property from an object by its path.
 *
 * @param path - The path of the property, in dot notation.
 * @param obj - The object to retrieve the property from.
 * @returns The value of the property at the specified path.
 *
 * @example
 * const obj = {
 *   foo: {
 *     bar: {
 *       baz: "example value"
 *     }
 *   }
 * };
 *
 * const result = getPropertyByPath("foo.bar.baz", obj);
 * console.log(result); // Output: "example value"
 */
export const getPropertyByPath = <
  T extends Record<string, any>,
  K extends Path<T>,
>(
  path: K,
  obj: T,
): unknown => {
  const pathArray = path.split(".");
  let result: any = obj;
  for (const key of pathArray) {
    result = result?.[key];
    if (result === undefined) {
      return undefined;
    }
  }
  return result;
};
