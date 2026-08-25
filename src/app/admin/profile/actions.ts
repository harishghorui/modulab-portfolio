'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { updateUserIdentity, checkUsernameAvailability as checkIdentityUsernameAvailability } from '@/lib/domains/identity';
import { validateAssetReference } from '@/lib/domains/media';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  await dbConnect();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const username = formData.get('username') as string;

  const headline = formData.get('headline') as string;
  const bio = formData.get('bio') as string;
  const imageUrl = (formData.get('image') as string)?.trim();
  const resumeUrl = (formData.get('resumeUrl') as string)?.trim();

  const socialLinks = {
    github: formData.get('github') as string,
    linkedin: formData.get('linkedin') as string,
    twitter: formData.get('twitter') as string,
    website: formData.get('website') as string,
  };

  try {
    // 1. Update User via Identity Domain boundary
    const identityResult = await updateUserIdentity({
      userId: session.user.id,
      firstName,
      lastName,
      username,
    });

    if (!identityResult.success) {
      return { error: identityResult.error || 'Failed to update user identity' };
    }

    // 2. Handle Media & Profile Data
    let finalImageUrl = '';
    let finalResumeUrl = '';
    
    // Get existing profile to keep old URLs if not changed
    const existingProfile = await Profile.findOne({ userId: session.user.id });
    if (existingProfile) {
      finalImageUrl = existingProfile.image || '';
      finalResumeUrl = existingProfile.resumeUrl || '';
    }

    // Validate avatar asset reference if updated
    if (imageUrl && imageUrl !== finalImageUrl) {
      const validation = validateAssetReference(imageUrl, {
        username: session.user.username!,
        purpose: 'profile-avatar',
      });
      if (!validation.valid) {
        return { error: validation.error || 'Invalid profile image reference' };
      }
      finalImageUrl = imageUrl;
    } else if (!imageUrl) {
      finalImageUrl = '';
    }

    // Validate resume asset reference if updated
    if (resumeUrl && resumeUrl !== finalResumeUrl) {
      const validation = validateAssetReference(resumeUrl, {
        username: session.user.username!,
        purpose: 'resume',
      });
      if (!validation.valid) {
        return { error: validation.error || 'Invalid resume document reference' };
      }
      finalResumeUrl = resumeUrl;
    } else if (!resumeUrl) {
      finalResumeUrl = '';
    }

    // 3. Update Profile
    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        headline,
        bio,
        // we keep the existing skills array as is, managed by separate skills page
        image: finalImageUrl,
        resumeUrl: finalResumeUrl,
        socialLinks,
      },
      { upsert: true, new: true, runValidators: true }
    );

    revalidatePath('/admin/profile');
    revalidatePath('/admin');
    revalidatePath(`/${username}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}

export async function checkUsernameAvailability(username: string) {
  const session = await auth();
  if (!session?.user?.id) return { available: false };

  const isAvailable = await checkIdentityUsernameAvailability(username, session.user.id);
  return { available: isAvailable };
}
