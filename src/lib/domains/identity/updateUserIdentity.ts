import dbConnect from '@/lib/db';
import User from '@/models/User';

export interface UpdateUserIdentityInput {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface UpdateUserIdentityResult {
  success: boolean;
  error?: string;
}

/**
 * Updates core user identity attributes within the Identity & Auth domain boundary.
 * Validates cross-tenant username uniqueness before mutating.
 */
export async function updateUserIdentity({
  userId,
  firstName,
  lastName,
  username,
}: UpdateUserIdentityInput): Promise<UpdateUserIdentityResult> {
  await dbConnect();

  const cleanUsername = username.toLowerCase().trim();

  // Validate username uniqueness against all other users
  const existingUserWithUsername = await User.findOne({
    username: cleanUsername,
    _id: { $ne: userId },
  });

  if (existingUserWithUsername) {
    return { success: false, error: 'Username is already taken' };
  }

  await User.findByIdAndUpdate(userId, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    username: cleanUsername,
  });

  return { success: true };
}

/**
 * Checks whether a given username is available across the platform.
 */
export async function checkUsernameAvailability(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  await dbConnect();

  const cleanUsername = username.toLowerCase().trim();
  const query: { username: string; _id?: { $ne: string } } = { username: cleanUsername };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query);
  return !existingUser;
}

/**
 * Retrieves sanitized user identity details by ID.
 */
export async function getUserIdentity(userId?: string) {
  if (!userId) return null;
  await dbConnect();
  const user = await User.findById(userId).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}
