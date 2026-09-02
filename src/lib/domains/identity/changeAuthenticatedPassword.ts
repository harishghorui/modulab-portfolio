import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export interface ChangeAuthenticatedPasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangeAuthenticatedPasswordResult {
  success: boolean;
  error?: string;
}

/**
 * Changes an authenticated user's password within the Identity & Auth domain boundary.
 * 
 * 1. Loads user including password field (select: false).
 * 2. Compares currentPassword with stored hash using bcrypt.compare.
 * 3. Validates newPassword strength and dissimilarity.
 * 4. Hashes newPassword with bcryptjs using 12 salt rounds.
 * 5. Updates user password in MongoDB.
 * 6. Never exposes password or password hash.
 */
export async function changeAuthenticatedPassword({
  userId,
  currentPassword,
  newPassword,
}: ChangeAuthenticatedPasswordInput): Promise<ChangeAuthenticatedPasswordResult> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }

  if (!currentPassword) {
    return { success: false, error: 'Current password is required.' };
  }

  if (!newPassword) {
    return { success: false, error: 'New password is required.' };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  if (newPassword.length > 128) {
    return { success: false, error: 'New password must not exceed 128 characters.' };
  }

  if (currentPassword === newPassword) {
    return { success: false, error: 'New password must be different from your current password.' };
  }

  try {
    await dbConnect();

    // Query user and explicitly select +password
    const user = await User.findById(userId).select('+password');

    if (!user || !user.password) {
      return { success: false, error: 'User account not found.' };
    }

    // Verify current password against stored bcrypt hash
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    // Hash new password using bcryptjs with 12 salt rounds
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update only the user's password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    return { success: true };
  } catch {
    // Return a safe error message without leaking internal database or crypto details
    return { success: false, error: 'Failed to update password. Please try again later.' };
  }
}
