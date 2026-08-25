/**
 * Media Domain Types
 */

export type MediaCategory = 'Profile_Photos' | 'Resumes' | 'Project_Images';

export type MediaUploadPurpose = 'project-thumbnail' | 'profile-avatar' | 'resume';

export interface ImageOptimizeOptions {
  width?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export interface PresignUploadParams {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
}

export interface ValidateAssetReferenceOptions {
  username: string;
  purpose: MediaUploadPurpose;
}
