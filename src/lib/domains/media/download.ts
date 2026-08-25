import { generateSignedCloudinaryUrl } from './cloudinary';

/**
 * Returns a signed fetch URL for private or restricted media assets.
 */
export function getSignedAssetFetchUrl(url: string): string {
  return generateSignedCloudinaryUrl(url);
}
