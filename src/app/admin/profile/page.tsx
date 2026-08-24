import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getUserIdentity } from '@/lib/domains/identity';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  const [user, profile] = await Promise.all([
    getUserIdentity(session.user.id),
    Profile.findOne({ userId: session.user.id }).lean(),
  ]);

  if (!user) {
    redirect('/login');
  }

  // Convert MongoDB _id and other special types to plain objects for the client component
  const serializedProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;

  return <ProfileForm initialData={serializedProfile} userData={user} />;
}
