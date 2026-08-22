/**
 * Utility for Cloudinary upload paths and configurations
 */

export type CloudinaryCategory = 'Profile_Photos' | 'Resumes' | 'Project_Images';

/**
 * Returns the hierarchical folder path for Cloudinary uploads.
 * Pattern: Modulab/{username}/{category}
 */
export function getCloudinaryPath(username: string, category: CloudinaryCategory) {
  // Ensure username is clean for folder names
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `Modulab/${cleanUsername}/${category}`;
}

/**
 * Standard upload options for Cloudinary to ensure consistency
 */
export const getBaseUploadOptions = (username: string, category: CloudinaryCategory) => ({
  folder: getCloudinaryPath(username, category),
  use_filename: true,
  unique_filename: true,
  overwrite: false,
});

export interface CloudinaryOptimizeOptions {
  width?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

/**
 * Transforms a Cloudinary delivery URL to include optimization parameters (f_auto, q_auto, width limits).
 * Strictly idempotent and safely preserves existing transformations, version strings, or non-Cloudinary URLs.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options?: CloudinaryOptimizeOptions
): string {
  if (!url || typeof url !== 'string') return '';

  // If not a Cloudinary URL or if it's a raw/attachment download (e.g. resume), return untouched
  if (!url.includes('res.cloudinary.com') || url.includes('/upload/fl_attachment') || url.includes('/raw/upload/')) {
    return url;
  }

  const uploadMarker = '/image/upload/';
  const uploadIndex = url.indexOf(uploadMarker);
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + uploadMarker.length);
  const rest = url.substring(uploadIndex + uploadMarker.length);

  const format = options?.format || 'f_auto';
  const quality = options?.quality ? `q_${options.quality}` : 'q_auto';
  const crop = options?.crop || 'c_limit';
  const widthParam = options?.width ? `w_${options.width}` : '';

  const newParams: string[] = [];
  if (!rest.includes('f_auto') && !rest.includes('f_webp') && !rest.includes('f_avif')) {
    newParams.push(format);
  }
  if (!rest.includes('q_auto') && !rest.includes('q_')) {
    newParams.push(quality);
  }
  if (widthParam && !rest.includes('w_')) {
    newParams.push(widthParam);
    if (!rest.includes('c_')) {
      newParams.push(crop);
    }
  }

  if (newParams.length === 0) {
    return url;
  }

  const transformString = newParams.join(',');
  return `${prefix}${transformString}/${rest}`;
}

