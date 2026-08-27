import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminProjects } from '@/lib/domains/portfolio';
import ProjectsTable from './ProjectsTable';

export default async function AdminProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const projects = await getAdminProjects(session.user.id);

  return <ProjectsTable initialProjects={projects} />;
}
