export function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === "object" && !Array.isArray(item);
}

function isShallow(item: unknown) {
  return Array.isArray(item) && item.find((item) => typeof item === "object")
    ? false
    : true;
}

/**
 * Deep merge two or more objects.
 * @param target The target object to merge into.
 * @param sources One or more source objects to merge from.
 * @returns The merged object.
 */
export function deepMerge<T extends object>(
  target: T,
  ...sources: Partial<T>[]
) {
  if (!sources.length) return target;

  const source = sources.shift();
  if (!source) return target;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deepMerge((target as Record<string, any>)[key], source[key]);
      } else {
        if (isShallow(source[key])) {
          Object.assign(target, { [key]: source[key] });
        } else {
          if (!target[key]) {
            Object.assign(target, { [key]: [] });
          }
          Object.assign(target, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            [key]: (source as Record<string, any>)[key].map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item: any, index: string | number) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                deepMerge(
                  (target as Record<string, any>)[key][index] || {},
                  item,
                ),
            ),
          });
        }
      }
    }
  }

  return deepMerge(target, ...sources);
}
