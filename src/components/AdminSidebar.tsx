'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  UserCircle, 
  LogOut, 
  ChevronRight,
  User,
  Tag,
  Brain
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface SidebarProps {
  user: {
    firstName?: string;
    email?: string | null;
  };
  profile?: {
    image?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
    };
  } | null;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'My Projects',
    href: '/admin/projects',
    icon: FolderKanban,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    title: 'Skills',
    href: '/admin/skills',
    icon: Brain,
  },
  {
    title: 'Profile Settings',
    href: '/admin/profile',
    icon: UserCircle,
  },
];

export function AdminSidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();
  const socialLinks = profile?.socialLinks;
  const hasSocialLinks = socialLinks && (socialLinks.github || socialLinks.linkedin || socialLinks.twitter);

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0">
      <Link href="/admin" className="flex flex-col items-start px-6 py-4">
        <Image
          src="/branding/logo-full.png"
          alt="Modulab"
          width={220}
          height={72}
          priority
          className="h-11 w-auto"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400 pl-2">
          Portfolio
        </span>
      </Link>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )} />
                {item.title}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
            {profile?.image ? (
              <Image src={profile.image} alt="User Avatar" width={36} height={36} className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user.firstName || 'Admin'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {hasSocialLinks && (
          <div className="flex items-center justify-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        <ConfirmDialog
          title="Logout Confirmation"
          description="Are you sure you want to log out? You will need to sign in again to access the admin dashboard."
          confirmText="Logout"
          onConfirm={() => signOut({ callbackUrl: '/login' })}
          trigger={
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          }
        />
      </div>
    </aside>
  );
}
