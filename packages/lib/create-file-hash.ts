/**
 * Creates a hash from a file using the Web Crypto API
 * @param file - The file to hash
 * @param algorithm - The hashing algorithm to use (default: 'SHA-256')
 * @returns Promise that resolves to the hash as a hexadecimal string
 */
export async function createFileHash(
  file: File,
  algorithm?: AlgorithmIdentifier,
): Promise<string> {
  algorithm = algorithm || "SHA-256";
  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Create hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer);

    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    throw new Error(
      `Failed to create hash: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
