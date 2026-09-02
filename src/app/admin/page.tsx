import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileByUserId, isProfileComplete as checkProfileComplete } from "@/lib/domains/profile";
import {
  getCMSDashboardStats,
  DashboardProjectSummary,
  DashboardProjectCategory,
} from "@/lib/domains/portfolio";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import {
  LayoutGrid,
  Star,
  UserCircle,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [cmsStats, profile] = await Promise.all([
    getCMSDashboardStats(session.user.id),
    getProfileByUserId(session.user.id),
  ]);

  const { projectCount, featuredCount, skillCount, latestProjects } = cmsStats;
  const isProfileComplete = checkProfileComplete(profile, skillCount);

  const stats = [
    {
      label: 'Total Projects',
      shortLabel: 'Projects',
      value: projectCount,
      icon: LayoutGrid,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Featured Projects',
      shortLabel: 'Featured',
      value: featuredCount,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      label: 'Profile Status',
      shortLabel: 'Profile',
      value: isProfileComplete ? 'Complete' : 'Incomplete',
      icon: UserCircle,
      color: isProfileComplete ? 'text-green-600' : 'text-rose-600',
      bg: isProfileComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-rose-50 dark:bg-rose-900/20'
    }
  ];

  const portfolioBaseUrl = siteConfig.url;
  const portfolioUrl = `${portfolioBaseUrl.replace(/\/$/, '')}/${session.user.username || ''}`;


  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminDashboard />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session.user.firstName}!
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your portfolio.
          </p>
        </div>
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm group w-full sm:w-auto flex-shrink-0"
        >
          <span>View Public Portfolio</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Stats Grid - Compact & Space-Efficient */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 p-2.5 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 transition-all"
          >
            <div className={cn(stat.bg, "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0")}>
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                <span className="sm:hidden">{stat.shortLabel}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Latest Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Latest Projects
            </h2>
            <Link href="/admin/projects" className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm divide-y divide-gray-100 dark:divide-zinc-800">
            {latestProjects.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-sm text-gray-500">
                No projects yet. Create your first one!
              </div>
            ) : (
              latestProjects.map((project: DashboardProjectSummary) => (
                <div key={project._id.toString()} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors first:rounded-t-xl sm:first:rounded-t-2xl last:rounded-b-xl sm:last:rounded-b-2xl">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{project.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {project.category?.map((c: DashboardProjectCategory) => c.name).join(', ') || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0 text-right">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/admin/projects/new"
              className="group bg-blue-600 hover:bg-blue-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white transition-all shadow-md flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-base sm:text-lg">Add New Project</div>
                <div className="text-blue-100 text-xs sm:text-sm">Showcase your latest work</div>
              </div>
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>

            <Link
              href="/admin/profile"
              className="group bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-600 transition-all shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">Update Profile</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Keep your bio and skills fresh</div>
              </div>
              <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 dark:text-zinc-700 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </Link>
          </div>

          {!isProfileComplete && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-900 dark:text-rose-400 text-sm">Profile Incomplete</div>
                <p className="text-rose-700 dark:text-rose-500 text-xs mt-1">
                  Add a bio and at least one skill to make your public profile look great.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
