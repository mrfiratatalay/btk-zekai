/**
 * The real API writes uploaded images to disk. The demo keeps them in localStorage, so it
 * shrinks them to a small JPEG data URL first; a phone photo would not fit otherwise.
 */
const MAX_SIDE = 900;

export async function toStoredImage(imageBase64: string, mimeType: string): Promise<string> {
  const source = imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType || "image/png"};base64,${imageBase64}`;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return source;
  try {
    const blob = await (await fetch(source)).blob();
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return source;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return source;
  }
}
