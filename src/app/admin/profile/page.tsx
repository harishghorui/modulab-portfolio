import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserIdentity } from '@/lib/domains/identity';
import { getProfileByUserId } from '@/lib/domains/profile';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [user, profile] = await Promise.all([
    getUserIdentity(session.user.id),
    getProfileByUserId(session.user.id),
  ]);

  if (!user) {
    redirect('/login');
  }

  return <ProfileForm initialData={profile} userData={user} />;
}
