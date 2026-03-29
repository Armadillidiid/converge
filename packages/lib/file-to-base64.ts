/**
 * Converts a file to a base64 data URL.
 *
 * @param file - The file to convert.
 * @returns A promise that resolves with the base64 data URL representation of the file.
 * @throws If the file fails to be read.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};
