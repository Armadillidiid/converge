/**
 * Returns an array of typed keys from the provided object. No 'string[]'
 *
 * @param obj The object for which keys need to be extracted.
 * @returns An array containing the keys of the input object.
 *
 * @template Obj The type of the input object.
 * @param obj The input object to extract keys from.
 * @returns An array of keys from the input object.
 */
export const getTypedObjectKeys = <Obj extends object>(
  obj: Obj,
): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
};
