/**
 * Demo stand-in for Gemini image generation. It cannot create a new photo; it composes the
 * product's own photo into the three requested shots in a canvas, and says so in the
 * description. If the photo cannot be loaded, it draws a plain titled card instead.
 */
export type ImageStyle = "studio" | "unboxing" | "lifestyle";

const SIZE = 768;
export const STYLE_LABELS: Record<ImageStyle, string> = { studio: "Stüdyo", unboxing: "Kutu Açma", lifestyle: "Kullanım" };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function drawContained(ctx: CanvasRenderingContext2D, image: HTMLImageElement, box: number, cx: number, cy: number) {
  const scale = Math.min(box / image.width, box / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, cx - w / 2, cy - h / 2, w, h);
}

function studio(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const shadow = ctx.createRadialGradient(SIZE / 2, SIZE * 0.86, 10, SIZE / 2, SIZE * 0.86, SIZE * 0.32);
  shadow.addColorStop(0, "rgba(0,0,0,0.18)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.fillRect(0, SIZE * 0.7, SIZE, SIZE * 0.3);
  drawContained(ctx, image, SIZE * 0.72, SIZE / 2, SIZE * 0.46);
}

function unboxing(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  const background = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  background.addColorStop(0, "#e8d3b0");
  background.addColorStop(1, "#c9a878");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#f6efe3";
  ctx.strokeStyle = "#a9875a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(SIZE * 0.14, SIZE * 0.2, SIZE * 0.72, SIZE * 0.62, 18);
  ctx.fill();
  ctx.stroke();
  drawContained(ctx, image, SIZE * 0.5, SIZE / 2, SIZE * 0.51);
}

function lifestyle(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  const scale = Math.max(SIZE / image.width, SIZE / image.height) * 1.2;
  ctx.filter = "blur(16px) saturate(1.1)";
  ctx.drawImage(image, (SIZE - image.width * scale) / 2, (SIZE - image.height * scale) / 2, image.width * scale, image.height * scale);
  ctx.filter = "none";
  ctx.fillStyle = "rgba(20, 16, 10, 0.25)";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(SIZE * 0.17, SIZE * 0.17, SIZE * 0.66, SIZE * 0.66, 28);
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.clip();
  drawContained(ctx, image, SIZE * 0.62, SIZE / 2, SIZE / 2);
  ctx.restore();
}

function placeholder(ctx: CanvasRenderingContext2D, title: string, style: ImageStyle) {
  const background = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  background.addColorStop(0, "#1a1e04");
  background.addColorStop(1, "#0d3018");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#C1F25D";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(STYLE_LABELS[style], SIZE / 2, SIZE / 2 - 20);
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px sans-serif";
  ctx.fillText(title.slice(0, 38), SIZE / 2, SIZE / 2 + 24);
}

function newCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  return [canvas, canvas.getContext("2d")!];
}

export async function composeImage(photoUrl: string, title: string, style: ImageStyle): Promise<{ imageBase64: string; mimeType: string }> {
  if (typeof document === "undefined") return { imageBase64: "", mimeType: "image/jpeg" };
  try {
    const image = await loadImage(photoUrl);
    const [canvas, ctx] = newCanvas();
    ({ studio, unboxing, lifestyle })[style](ctx, image);
    return { imageBase64: canvas.toDataURL("image/jpeg", 0.84).split(",")[1], mimeType: "image/jpeg" };
  } catch {
    // A photo without CORS headers taints the canvas; draw the fallback on a fresh one.
    const [canvas, ctx] = newCanvas();
    placeholder(ctx, title, style);
    return { imageBase64: canvas.toDataURL("image/jpeg", 0.84).split(",")[1], mimeType: "image/jpeg" };
  }
}
