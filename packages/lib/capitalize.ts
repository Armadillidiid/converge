/**
 * Capitalizes the first letter of a string and optionally makes the rest of the string lowercase.
 * @param input The input string to capitalize the first letter of.
 * @param makeLowercase A boolean flag indicating whether to make the rest of the string lowercase. Default is true.
 * @returns The input string with the first letter capitalized and optionally the rest of the string lowercase.
 */
export function capitalize(
  input: string,
  makeLowercase: boolean = true,
): string {
  return makeLowercase
    ? input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
    : input.charAt(0).toUpperCase() + input.slice(1);
}
