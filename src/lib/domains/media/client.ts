'use client';

import { MediaUploadPurpose } from './types';

export interface DirectUploadResult {
  secureUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

/**
 * Uploads a File directly from the browser to Cloudinary via a signed upload session.
 * The application server NEVER receives the image binary or Base64 payload.
 */
export async function uploadDirectToMediaProvider(
  file: File,
  purpose: MediaUploadPurpose = 'project-thumbnail'
): Promise<DirectUploadResult> {
  // 1. Request presigned upload authorization from the Media domain API
  const presignRes = await fetch('/api/v1/media/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purpose }),
  });

  const presignData = await presignRes.json();

  if (!presignRes.ok || !presignData.success) {
    throw new Error(presignData.error || 'Failed to authorize media upload');
  }

  const { uploadUrl, apiKey, timestamp, signature, folder } = presignData.data;

  // 2. Perform direct multipart upload to Cloudinary CDN
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorJson = await uploadRes.json().catch(() => ({}));
    const message =
      errorJson.error?.message || `Direct upload failed with status ${uploadRes.status}`;
    throw new Error(message);
  }

  const uploadJson = await uploadRes.json();

  return {
    secureUrl: uploadJson.secure_url,
    publicId: uploadJson.public_id,
    format: uploadJson.format,
    bytes: uploadJson.bytes,
  };
}
