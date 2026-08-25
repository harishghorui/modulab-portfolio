import { v2 as cloudinary } from 'cloudinary';

// Centralized provider configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates signed upload authorization parameters using Cloudinary utils.
 */
export function createCloudinaryUploadSignature(paramsToSign: Record<string, string | number>): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
} {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error('Cloudinary credentials are not configured on the server');
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp: Number(paramsToSign.timestamp),
    apiKey,
    cloudName,
  };
}

/**
 * Generates a signed Cloudinary fetch URL from an existing asset URL.
 */
export function generateSignedCloudinaryUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  try {
    // Parse the URL to get resource_type, delivery_type, and public_id
    // Pattern: /<resource_type>/<delivery_type>/<transformations>/v<version>/<public_id>
    const regex = /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/(upload|authenticated|private)\/(?:.[^/]+\/)*(?:v\d+\/)?([^?#]+)$/;
    const match = url.split('?')[0].match(regex);

    if (!match) {
      return url;
    }

    const resourceType = match[1] as 'image' | 'video' | 'raw';
    const deliveryType = match[2];
    let publicId = match[3];

    // For images/videos, remove the extension from public_id as the SDK adds it
    if (resourceType !== 'raw') {
      publicId = publicId.replace(/\.[^/.]+$/, '');
    }

    // Generate signed URL
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: deliveryType,
      sign_url: true,
      secure: true,
    });
  } catch (error) {
    console.error('Error generating signed Cloudinary URL:', error);
    return url;
  }
}
