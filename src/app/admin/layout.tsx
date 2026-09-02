import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { getProfileByUserId } from '@/lib/domains/profile';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const profile = await getProfileByUserId(session.user.id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      <AdminSidebar user={session.user} profile={profile} />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
