/**
 * Developer Profile Domain Types
 */

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface SerializedProfile {
  _id: string;
  userId: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  image?: string;
  resumeUrl?: string;
  socialLinks?: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
}
