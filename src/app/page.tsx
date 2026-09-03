'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FolderKanban,
  Brain,
  UserCheck,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  Menu,
  X,
  ChevronRight,
  Layers,
  Terminal,
  Cpu,
  Eye,
  Database,
  Cloud
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { siteConfig } from '@/config/site';

// Subtle scroll animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } }
};

// Polished browser mockup frame for application screenshots
function BrowserMockupFrame({
  url,
  children,
  statusText = 'Live Preview',
  className = '',
}: {
  url: string;
  children: React.ReactNode;
  statusText?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-zinc-900/10 dark:shadow-blue-500/5 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/10 ${className}`}
    >
      {/* Browser Window Header (Proportionally scaled on mobile, full desktop chrome preserved) */}
      <div className="h-7 sm:h-11 px-2.5 sm:px-5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 select-none gap-1.5 sm:gap-3">
        {/* Window Dots */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-red-400/80 dark:bg-red-500/40 border border-red-500/30" />
          <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/80 dark:bg-amber-500/40 border border-amber-500/30" />
          <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-green-400/80 dark:bg-green-500/40 border border-green-500/30" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white dark:bg-zinc-800/80 text-[9px] sm:text-xs font-mono text-zinc-600 dark:text-zinc-400 min-w-0 max-w-[140px] sm:max-w-md truncate border border-zinc-200 dark:border-zinc-700/50 shadow-xs">
          <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[70px] sm:max-w-none">{statusText}</span>
        </div>
      </div>

      {/* Frame Screen Content */}
      <div className="relative bg-zinc-100 dark:bg-black overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function PortfolioLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'dashboard' | 'projects' | 'skills' | 'profile'>('dashboard');

  const loginUrl = '/login';
  const demoPortfolioUrl = '/harishghorui';

  const showcaseTabs = [
    {
      id: 'dashboard',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      badge: 'Step 01 / Control Center',
      title: 'Real-Time Portfolio Health & Metrics',
      description:
        'Track published project counts, featured work, and profile completion indicators from a single command dashboard with instantaneous quick actions.',
      screenshot: '/screenshots/admin-dashboard.png',
      url: 'portfolio.modulab.online/admin',
      highlights: [
        'Real-time metrics: Total Projects, Featured Count & Profile Status',
        'Quick action triggers for rapid project publishing',
        'Direct link to view public portfolio at any time',
      ],
    },
    {
      id: 'projects',
      label: 'Project Manager',
      icon: FolderKanban,
      badge: 'Step 02 / Project Authoring',
      title: 'Comprehensive Project Case Studies',
      description:
        'Showcase your best engineering work. Author rich descriptions using the TipTap rich-text editor, assign taxonomy tags, and highlight key projects.',
      screenshot: '/screenshots/projects.png',
      url: 'portfolio.modulab.online/admin/projects',
      highlights: [
        'Full TipTap rich-text editor with clean markdown support',
        'Category tagging and featured status prioritization',
        'Live deployment preview links and GitHub source code links',
      ],
    },
    {
      id: 'skills',
      label: 'Skills & Devicons',
      icon: Brain,
      badge: 'Step 03 / Tech Stack',
      title: 'Devicon-Integrated Skills Matrix',
      description:
        'Organize your technical competencies across customizable categories like Frontend, Backend, AI Tools, and DevOps with official Devicon brand vector icons.',
      screenshot: '/screenshots/skills-categories.png',
      url: 'portfolio.modulab.online/admin/skills',
      highlights: [
        'Integrated with the official Devicon CDN ecosystem',
        'Customizable taxonomy categories for tailored stacks',
        'Dynamic visual icon badges on public portfolios',
      ],
    },
    {
      id: 'profile',
      label: 'Profile & Resume',
      icon: UserCheck,
      badge: 'Step 04 / Identity',
      title: 'Professional Identity & Asset Pipeline',
      description:
        'Customize your headline, bio, and social channels. Upload PDF or Word resumes directly to Cloudinary with secure streaming download links.',
      screenshot: '/screenshots/profile-settings.png',
      url: 'portfolio.modulab.online/admin/profile',
      highlights: [
        'Personalized username routing (portfolio.modulab.online/username)',
        'Direct Cloudinary asset uploads with instant preview',
        'One-click resume download stream integration',
      ],
    },
  ] as const;

  const currentTab = showcaseTabs.find((t) => t.id === activeShowcaseTab) || showcaseTabs[0];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 selection:bg-blue-500/20 antialiased">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl transition-colors">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start group">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Public Showcase
            </a>
            <a href="#tech" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Tech Stack
            </a>
          </nav>

          {/* Desktop Action */}
          <div className="hidden sm:flex items-center">
            <Link
              href={loginUrl}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
              >
                How It Works
              </a>
              <a
                href="#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
              >
                Public Showcase
              </a>
              <a
                href="#tech"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
              >
                Tech Stack
              </a>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                  href={loginUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Ambient Radial Mesh Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="container max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            {/* Pill Badge */}
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide border border-blue-200/70 dark:border-blue-800/40 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developer Portfolio Management Platform</span>
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 sm:mb-8 leading-[1.08]">
              Build & Showcase Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
                Developer Masterpiece.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
              The purpose-built portfolio platform for software engineers. Curate rich project case studies, catalog technical competencies with official Devicons, and publish a high-performance public portfolio at your custom URL.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={loginUrl}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Create Your Portfolio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={demoPortfolioUrl}
                className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Explore Live Demo</span>
              </Link>
              <a
                href="https://github.com/harishghorui/modulab-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <FaGithub className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Hero Product Preview Mockup: Admin Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="container max-w-6xl mx-auto mt-12 sm:mt-16 px-2 sm:px-4"
        >
          <div className="relative group">
            <BrowserMockupFrame
              url="portfolio.modulab.online/admin"
              statusText="Admin Dashboard"
            >
              <Image
                src="/screenshots/admin-dashboard.png"
                alt="Modulab Portfolio Admin Dashboard Preview"
                width={1851}
                height={936}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1150px"
                className="w-full h-auto object-cover block"
              />
            </BrowserMockupFrame>

            {/* Subtle Gradient Glow Behind Mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 dark:opacity-40 -z-10 group-hover:opacity-70 transition-opacity" />
          </div>
        </motion.div>
      </section>

      {/* QUICK VALUE PROPOSITION BAR */}
      <section className="py-8 sm:py-10 border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-3.5 min-w-0 p-3 sm:p-0 rounded-xl bg-white/50 dark:bg-zinc-900/30 sm:bg-transparent sm:dark:bg-transparent border border-zinc-200/50 dark:border-zinc-800/50 sm:border-0">
              <div className="p-2.5 rounded-xl bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">Personalized URL</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">portfolio.modulab.online/[name]</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 min-w-0 p-3 sm:p-0 rounded-xl bg-white/50 dark:bg-zinc-900/30 sm:bg-transparent sm:dark:bg-transparent border border-zinc-200/50 dark:border-zinc-800/50 sm:border-0">
              <div className="p-2.5 rounded-xl bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">Tech Stack Taxonomy</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">100+ Official Devicons</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 min-w-0 p-3 sm:p-0 rounded-xl bg-white/50 dark:bg-zinc-900/30 sm:bg-transparent sm:dark:bg-transparent border border-zinc-200/50 dark:border-zinc-800/50 sm:border-0">
              <div className="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">Media Pipeline</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">Cloudinary CDN & Resumes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 min-w-0 p-3 sm:p-0 rounded-xl bg-white/50 dark:bg-zinc-900/30 sm:bg-transparent sm:dark:bg-transparent border border-zinc-200/50 dark:border-zinc-800/50 sm:border-0">
              <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">Fast Edge Delivery</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">Next.js 16 Server Engine</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Section Heading */}
          <motion.div {...fadeInUp} className="text-center mb-14 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Core Platform Features
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2 mb-4">
              Everything You Need to Showcase Your Craft
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Engineered specifically for developers who value speed, clean presentation, and complete control over their professional portfolio.
            </p>
          </motion.div>

          {/* 6 Feature Cards Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Feature 1: Project CMS */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Project Showcase CMS
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Author comprehensive project case studies with the TipTap rich-text editor. Highlight featured projects, assign taxonomy tags, and link live demos and GitHub repos.
              </p>
            </motion.div>

            {/* Feature 2: Skills & Devicon */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Skills & Devicon Taxonomy
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Organize technical skills into categories like Frontend, Backend, DevOps, and Mobile. Search and attach official Devicon CDN vector brand icons with real-time previews.
              </p>
            </motion.div>

            {/* Feature 3: Public Portfolio */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Personalized Public Delivery
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Instant edge-rendered public portfolio at <span className="font-mono text-xs text-blue-600 dark:text-blue-400">portfolio.modulab.online/[username]</span> with dynamic SEO metadata, OpenGraph tags, and sanitized HTML.
              </p>
            </motion.div>

            {/* Feature 4: Profile & Resume */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Profile & Resume Pipeline
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Maintain your professional headline, bio, and verified social profiles. Direct Cloudinary upload pipeline for PDF and Word resumes with secure download streaming.
              </p>
            </motion.div>

            {/* Feature 5: Real-time Admin Dashboard */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Mobile-Ready Admin Dashboard
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Clean, space-efficient control panel featuring a 3-column stats bar, quick action buttons, responsive project list views, and off-canvas mobile drawer navigation.
              </p>
            </motion.div>

            {/* Feature 6: Security & Credentials */}
            <motion.div
              variants={fadeInUp}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Account & Password Security
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Secure session management powered by NextAuth.js v5 and bcrypt password encryption (12 salt rounds), complete with a dedicated admin Security Settings center.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS / PRODUCT SHOWCASE */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100/60 dark:bg-zinc-950/60 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="container max-w-6xl mx-auto">
          {/* Section Heading */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Interactive Showcase
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2 mb-4">
              Explore the Modulab CMS Experience
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Take an inside look at how you curate, organize, and publish your portfolio with ease.
            </p>
          </motion.div>

          {/* Showcase Tabs Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {showcaseTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeShowcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcaseTab(tab.id as typeof activeShowcaseTab)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Showcase Card */}
          <motion.div
            key={currentTab.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text description on left */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {currentTab.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                {currentTab.title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {currentTab.description}
              </p>

              <div className="space-y-3 pt-2">
                {currentTab.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-1 flex-shrink-0" />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-300">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href={loginUrl}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Try it yourself in the admin portal</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Browser frame on right */}
            <div className="lg:col-span-7">
              <BrowserMockupFrame
                url={currentTab.url}
                statusText="CMS Workspace"
              >
                <Image
                  src={currentTab.screenshot}
                  alt={currentTab.title}
                  width={1533}
                  height={933}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="w-full h-auto object-cover block"
                />
              </BrowserMockupFrame>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PUBLIC PORTFOLIO SHOWCASE (THE FINAL RESULT) */}
      <section id="showcase" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Section Heading */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              The Published Result
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2 mb-4">
              A Public Portfolio That Impresses
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              From back-office CMS to a high-converting public profile. Here is what recruiters, hiring managers, and clients experience.
            </p>
          </motion.div>

          {/* 4-Step Workflow Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { num: '01', title: 'Manage', desc: 'Input case studies and skills in the CMS' },
              { num: '02', title: 'Customize', desc: 'Fine-tune your bio, headline, and resume' },
              { num: '03', title: 'Publish', desc: 'Instant sub-second static & SSR deployment' },
              { num: '04', title: 'Share', desc: 'Share your personalized URL everywhere' }
            ].map((step, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs"
              >
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{step.num}</span>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mt-1 mb-1">{step.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Public Portfolio Screenshot Mockup */}
          <motion.div {...fadeInUp} className="relative group">
            <BrowserMockupFrame
              url="portfolio.modulab.online/harishghorui"
              statusText="Live Public Portfolio"
            >
              <Image
                src="/screenshots/public-portfolio.png"
                alt="Live Developer Public Portfolio Experience"
                width={1843}
                height={933}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 1150px"
                className="w-full h-auto object-cover block"
              />
            </BrowserMockupFrame>

            {/* Bottom floating button */}
            <div className="mt-8 text-center">
              <Link
                href={demoPortfolioUrl}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
              >
                <span>View Live Demo Portfolio</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TECH STACK & ARCHITECTURE SECTION */}
      <section id="tech" className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100/60 dark:bg-zinc-950/60 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="container max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Architecture & Stack
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2 mb-4">
              Engineered with Modern Standards
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Built as a robust modular monolith with domain encapsulation and industry best practices.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8"
          >
            {[
              {
                icon: <Terminal className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />,
                title: 'Next.js 16',
                badge: 'Framework',
                desc: 'App Router, Turbopack, and React 19 Server Components for instant rendering.',
              },
              {
                icon: <Database className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />,
                title: 'MongoDB & Mongoose',
                badge: 'Database',
                desc: 'Strict Single-Writer domain architecture with encapsulated models and TTL caching.',
              },
              {
                icon: <ShieldCheck className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />,
                title: 'NextAuth.js v5',
                badge: 'Security',
                desc: 'JWT session tokens with bcrypt encryption (12 salt rounds) and proxy-level protection.',
              },
              {
                icon: <Cloud className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400" />,
                title: 'Cloudinary CDN',
                badge: 'Media Pipeline',
                desc: 'Direct client-side uploads, automatic image optimization, and signed resume streams.',
              },
              {
                icon: <Layers className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />,
                title: 'Tailwind CSS v4',
                badge: 'Design System',
                desc: 'Automatic device light/dark mode adaptation with zero layout shifts or theme flicker.',
              },
              {
                icon: <Cpu className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />,
                title: 'Devicon Ecosystem',
                badge: 'Iconography',
                desc: 'CDN-powered developer vector icons for accurate technology stack visualization.',
              },
            ].map((tech, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-3.5 sm:p-6 md:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-4">
                    <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
                      {tech.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-right leading-tight break-words">
                      {tech.badge}
                    </span>
                  </div>
                  <h3 className="text-[13px] sm:text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 sm:mb-2 leading-snug sm:leading-normal">
                    {tech.title}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed sm:leading-relaxed">
                  {tech.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-black text-white p-8 sm:p-14 md:p-20 rounded-3xl border border-blue-500/20 dark:border-zinc-800 relative overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-none text-center"
          >
            {/* Ambient Radial Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 dark:bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold mb-6 border border-white/20 dark:border-blue-800/40">
                <Sparkles className="w-3.5 h-3.5" />
                Launch in Minutes
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6">
                Ready to Build Your Developer Masterpiece?
              </h2>
              <p className="text-base sm:text-lg text-blue-100 dark:text-zinc-400 mb-8 sm:mb-10 font-medium leading-relaxed">
                Create your account, organize your work, and share a portfolio that truly reflects your engineering expertise.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={loginUrl}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 hover:bg-zinc-100 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Your Portfolio Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={demoPortfolioUrl}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm border border-white/20 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Explore Demo</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-14 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#050505] transition-colors">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex flex-col items-start group">
                <Image
                  src="/branding/logo-full.png"
                  alt="Modulab"
                  width={120}
                  height={32}
                  className="h-6 w-auto"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                  Portfolio
                </span>
              </Link>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                The modern developer portfolio management platform. Curate projects, organize skills, and publish at scale.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Product</p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href="#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Public Showcase
                  </a>
                </li>
                <li>
                  <a href="#tech" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Tech Stack
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Platform</p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="/admin" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/security" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Security Settings
                  </Link>
                </li>
                <li>
                  <Link href={loginUrl} className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Sign In / Register
                  </Link>
                </li>
                <li>
                  <Link href={demoPortfolioUrl} className="hover:text-blue-600 dark:hover:text-white transition-colors">
                    Live Demo Portfolio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Links */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Resources</p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <a
                    href="https://github.com/harishghorui/modulab-portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <FaGithub className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/harishghorui"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    Personal GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Modulab Platform</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Modulab Portfolio. Built for modern software engineers.</p>
            <p className="flex items-center gap-2">
              <span>Next.js 16</span>
              <span>•</span>
              <span>MongoDB</span>
              <span>•</span>
              <span>Cloudinary</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
