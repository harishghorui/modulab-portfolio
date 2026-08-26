import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { SerializedProfile } from './types';

/**
 * Retrieves sanitized developer profile details by user ID.
 * Returns a serialized plain JavaScript object safe for Server-to-Client component transfer.
 */
export async function getProfileByUserId(
  userId?: string
): Promise<SerializedProfile | null> {
  if (!userId) return null;

  await dbConnect();
  const profile = await Profile.findOne({ userId }).lean();

  if (!profile) return null;

  return JSON.parse(JSON.stringify(profile)) as SerializedProfile;
}

/**
 * Evaluates whether a user's profile is considered complete based on bio and skills presence.
 */
export function isProfileComplete(
  profile?: SerializedProfile | null,
  skillCount: number = 0
): boolean {
  if (!profile) return false;

  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);
  const hasSkills = skillCount > 0 || Boolean(profile.skills && profile.skills.length > 0);

  return hasBio && hasSkills;
}
