/**
 * Encodes a File to a base64 string (without the data URI prefix)
 */
export function encodeBase64(file: File | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve("");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file as base64 string"));
      }
    };

    reader.onerror = error => reject(error);
  });
}

/**
 * Decodes a base64 string to a Blob (useful for preview or file download)
 */
export function decodeBase64ToBlob(base64: string, mimeType: string = "image/jpeg"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}
