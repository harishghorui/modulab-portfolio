import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDownloadUrl(url: string) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    // Avoid adding duplicate flags if it already exists
    if (url.includes('fl_attachment')) return url;
    
    // Cloudinary supports fl_attachment for both image and raw resource types
    // It should be placed right after /upload/
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

export function isPdf(url: string) {
  if (!url) return false;
  // Remove query parameters and fragments before checking extension
  const baseUrl = url.split('?')[0].split('#')[0];
  return baseUrl.toLowerCase().endsWith('.pdf');
}

export { getOptimizedImageUrl } from './cloudinary';

