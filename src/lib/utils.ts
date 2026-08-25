import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPdf(url: string) {
  if (!url) return false;
  // Remove query parameters and fragments before checking extension
  const baseUrl = url.split('?')[0].split('#')[0];
  return baseUrl.toLowerCase().endsWith('.pdf');
}

export function formatDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  });
}

export { getOptimizedImageUrl, getDownloadUrl } from './domains/media/transform';

