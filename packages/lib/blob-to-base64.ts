/**
 * Converts a Blob or File object to a Base64-encoded string.
 *
 * @param blob - The Blob or File to convert.
 * @param options - Optional settings.
 * @param options.stripPrefix - If true, removes the MIME prefix (e.g., "data:image/png;base64,") from the result.
 * @returns A promise that resolves with the Base64-encoded string.
 *
 * @throws Will reject the promise with an Error if:
 * - The input is not a valid Blob or File
 * - FileReader encounters an error
 * - The result of FileReader is not a string
 *
 * @example
 * const base64 = await blobToBase64(file); // includes MIME prefix
 * const rawBase64 = await blobToBase64(file, { stripPrefix: true }); // just the base64 string
 */
export function blobToBase64(
  blob: Blob,
  options?: {
    stripPrefix?: boolean;
  },
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      reject(new Error("Invalid input: Expected a Blob or File object."));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read blob: result is not a string."));
        return;
      }

      if (options?.stripPrefix) {
        const base64Match = result.match(/^data:(.*?);base64,(.*)$/);
        if (!base64Match || base64Match.length < 3) {
          reject(new Error("Failed to strip MIME prefix from base64 string."));
          return;
        }

        const base64String = base64Match[2];
        if (!base64String) {
          reject(new Error("Failed to extract base64 string."));
          return;
        }
        resolve(base64String);
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("FileReader failed to convert blob to base64."));
    };

    reader.readAsDataURL(blob);
  });
}
