'use server';

import { auth } from '@/auth';
import { changeAuthenticatedPassword } from '@/lib/domains/identity';

export interface ChangePasswordState {
  success?: boolean;
  error?: string;
  timestamp?: number;
}

/**
 * Server action to handle password change requests from the Security settings form.
 * 
 * Invariants:
 * - Derives user identity exclusively from the authenticated session (never trusts client input).
 * - Delegates all password hashing and database mutation to the Identity domain boundary.
 * - Never logs passwords, hashes, or sensitive error internals.
 */
export async function changePassword(
  prevState: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const currentPassword = (formData.get('currentPassword') as string) || '';
  const newPassword = (formData.get('newPassword') as string) || '';
  const confirmPassword = (formData.get('confirmPassword') as string) || '';

  if (!currentPassword) {
    return { error: 'Current password is required.' };
  }

  if (!newPassword) {
    return { error: 'New password is required.' };
  }

  if (!confirmPassword) {
    return { error: 'Please confirm your new password.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters long.' };
  }

  if (newPassword.length > 128) {
    return { error: 'New password must not exceed 128 characters.' };
  }

  if (currentPassword === newPassword) {
    return { error: 'New password must be different from your current password.' };
  }

  try {
    const result = await changeAuthenticatedPassword({
      userId: session.user.id,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      return { error: result.error || 'Failed to update password.' };
    }

    return { success: true, timestamp: Date.now() };
  } catch {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
