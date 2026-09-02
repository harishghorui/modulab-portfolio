import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ChangePasswordForm from './ChangePasswordForm';

export const metadata = {
  title: 'Security Settings | Modulab Portfolio Admin',
  description: 'Manage your account password and security settings',
};

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <ChangePasswordForm />;
}
