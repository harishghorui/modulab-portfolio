import { getCloudinaryPath } from './transform';
import { ValidateAssetReferenceOptions } from './types';

const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

/**
 * Validates that an asset URL belongs to the expected Cloudinary namespace and authenticated tenant.
 * Prevents tenants from submitting arbitrary URLs or other users' media assets.
 */
export function validateAssetReference(
  url: string | null | undefined,
  options: ValidateAssetReferenceOptions
): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Asset URL is required' };
  }

  const cleanUrl = url.trim();

  // Must be a Cloudinary delivery URL
  if (
    !cleanUrl.startsWith('https://res.cloudinary.com/') &&
    !cleanUrl.startsWith('http://res.cloudinary.com/')
  ) {
    return { valid: false, error: 'Asset URL must be hosted on Cloudinary' };
  }

  // Derive the expected folder for the user and purpose
  let expectedFolder: string;
  switch (options.purpose) {
    case 'project-thumbnail':
      expectedFolder = getCloudinaryPath(options.username, 'Project_Images');
      break;
    case 'profile-avatar':
      expectedFolder = getCloudinaryPath(options.username, 'Profile_Photos');
      break;
    case 'resume':
      expectedFolder = getCloudinaryPath(options.username, 'Resumes');
      break;
    default:
      return { valid: false, error: `Invalid validation purpose: ${options.purpose}` };
  }

  // Ensure URL contains the authenticated user's exact namespace
  if (!cleanUrl.includes(`/${expectedFolder}/`)) {
    return {
      valid: false,
      error: 'Asset URL does not belong to the authenticated user namespace',
    };
  }

  // Specific validation for raw resume documents
  if (options.purpose === 'resume') {
    // Must be a raw resource
    if (!cleanUrl.includes('/raw/')) {
      return {
        valid: false,
        error: 'Resume document must be stored as a raw resource type',
      };
    }

    // Must have a valid document extension
    const urlWithoutQuery = cleanUrl.split('?')[0].split('#')[0].toLowerCase();
    const hasValidExt = ALLOWED_RESUME_EXTENSIONS.some((ext) =>
      urlWithoutQuery.endsWith(ext)
    );

    if (!hasValidExt) {
      return {
        valid: false,
        error: 'Resume document must be a PDF or Word document (.pdf, .doc, .docx)',
      };
    }
  }

  return { valid: true };
}
