import { createCloudinaryUploadSignature } from './cloudinary';
import { getCloudinaryPath } from './transform';
import { MediaUploadPurpose, PresignUploadParams } from './types';

/**
 * Creates a signed upload session for the authenticated user and given purpose.
 * Folder and resource type are derived strictly on the server to prevent unauthorized uploads.
 */
export function createUploadSignature(
  username: string,
  purpose: MediaUploadPurpose
): PresignUploadParams {
  if (!username) {
    throw new Error('Username is required for media upload authorization');
  }

  let folder: string;
  let resourceType: 'image' | 'raw' = 'image';

  switch (purpose) {
    case 'project-thumbnail':
      folder = getCloudinaryPath(username, 'Project_Images');
      resourceType = 'image';
      break;
    case 'profile-avatar':
      folder = getCloudinaryPath(username, 'Profile_Photos');
      resourceType = 'image';
      break;
    case 'resume':
      folder = getCloudinaryPath(username, 'Resumes');
      resourceType = 'raw';
      break;
    default:
      throw new Error(`Unsupported upload purpose: ${purpose}`);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const { signature, apiKey, cloudName } = createCloudinaryUploadSignature(paramsToSign);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    apiKey,
    timestamp,
    signature,
    folder,
    cloudName,
  };
}
