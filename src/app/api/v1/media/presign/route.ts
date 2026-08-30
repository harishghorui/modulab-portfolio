import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createUploadSignature } from '@/lib/domains/media';
import { MediaUploadPurpose } from '@/lib/domains/media/types';

const ALLOWED_PURPOSES: MediaUploadPurpose[] = [
  'project-thumbnail',
  'profile-avatar',
  'resume',
];

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.username) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const purpose = body?.purpose as MediaUploadPurpose;

    if (!purpose || !ALLOWED_PURPOSES.includes(purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or unsupported upload purpose' },
        { status: 400 }
      );
    }

    const presignData = createUploadSignature(session.user.username, purpose);

    return NextResponse.json({
      success: true,
      data: presignData,
    });
  } catch (error: unknown) {
    console.error('Media presign authorization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload authorization',
      },
      { status: 500 }
    );
  }
}
