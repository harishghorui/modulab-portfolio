'use client';

import { useState, useEffect } from 'react';
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
  Brain,
  Menu,
  X
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

function NavLinks({
  pathname,
  onItemClick
}: {
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <nav className="flex-1 px-4 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
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
  );
}

function UserFooter({
  user,
  profile,
  onItemClick
}: {
  user: SidebarProps['user'];
  profile: SidebarProps['profile'];
  onItemClick?: () => void;
}) {
  const socialLinks = profile?.socialLinks;
  const hasSocialLinks = Boolean(socialLinks && (socialLinks.github || socialLinks.linkedin || socialLinks.twitter));

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4 flex-shrink-0">
      <Link
        href="/admin/profile"
        onClick={onItemClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 overflow-hidden flex-shrink-0">
          {profile?.image ? (
            <Image src={profile.image} alt="User Avatar" width={36} height={36} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {user.firstName || 'Admin'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {user.email}
          </p>
        </div>
      </Link>

      {hasSocialLinks && (
        <div className="flex items-center justify-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          {socialLinks?.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="GitHub Profile">
              <FaGithub className="w-5 h-5" />
            </a>
          )}
          {socialLinks?.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors" aria-label="LinkedIn Profile">
              <FaLinkedin className="w-5 h-5" />
            </a>
          )}
          {socialLinks?.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors" aria-label="Twitter Profile">
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
  );
}

export function AdminSidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close drawer on route change
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on resize to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Header (hidden on md and larger) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            className="p-2 -ml-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={100}
              height={28}
              priority
              className="h-5 w-auto"
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              Portfolio
            </span>
          </Link>
        </div>

        <Link
          href="/admin/profile"
          aria-label="Profile Settings"
          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center flex-shrink-0"
        >
          {profile?.image ? (
            <Image src={profile.image} alt="User Avatar" width={32} height={32} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          )}
        </Link>
      </header>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile Off-Canvas Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation drawer"
        className={cn(
          "fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 md:hidden flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <Link href="/admin" onClick={closeDrawer} className="flex flex-col items-start">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={120}
              height={32}
              priority
              className="h-6 w-auto"
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
              Portfolio
            </span>
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="p-2 -mr-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks pathname={pathname} onItemClick={closeDrawer} />
        </div>

        <UserFooter user={user} profile={profile} onItemClick={closeDrawer} />
      </aside>

      {/* Desktop Fixed/Sticky Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col h-screen sticky top-0 flex-shrink-0">
        <Link href="/admin" className="flex flex-col items-start px-6 py-4 flex-shrink-0">
          <Image
            src="/branding/logo-full.png"
            alt="Modulab"
            width={120}
            height={32}
            priority
            className="h-6 w-auto"
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
            Portfolio
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks pathname={pathname} />
        </div>

        <UserFooter user={user} profile={profile} />
      </aside>
    </>
  );
}
