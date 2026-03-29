/**
 * Checks if a given path matches a pattern.
 * @param path The path to match.
 * @param pattern The pattern to match against.
 * @param delimiter Optional parameter to specify the delimiter used in the pattern segments.
 * @returns A boolean indicating whether the path matches the pattern.
 */
export const matchPath = (
  path: string,
  pattern: string,
  delimiter?: string,
  matchLength?: boolean,
): boolean => {
  matchLength = matchLength ?? true;
  // Extract segments from the path and pattern by splitting them at "/"
  const pathSegments = path.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);

  // If the number of segments in path and pattern are different, they can't match
  if (matchLength && pathSegments.length !== patternSegments.length)
    return false;

  // Check if each segment in the pattern matches the corresponding segment in the path
  return patternSegments.every((segment, index) => {
    // Allow segments starting with the specified delimiter or exact match with path segment
    return (
      segment.startsWith(delimiter ?? ":") || segment === pathSegments[index]
    );
  });
};
