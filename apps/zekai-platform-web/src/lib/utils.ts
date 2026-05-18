import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COMMERCE_API =
  process.env.NEXT_PUBLIC_COMMERCE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001";

/**
 * Commerce API'nin wwwroot'una kaydedilen görseller (/images/products/...) gibi
 * relative path'leri tam URL'e çevirir. Absolute URL'ler olduğu gibi döner.
 */
export function resolveCommerceImage(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${COMMERCE_API}${url}`;
  return url;
}
