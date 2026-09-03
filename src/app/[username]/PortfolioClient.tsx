'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileDown,
  ArrowRight,
  ArrowUp,
  Menu,
  X,
  Lock,
  Cpu,
  FolderKanban,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Devicon } from '@/components/ui/Devicon';
import Image from 'next/image';
import ProjectDetail from '@/components/ProjectDetail';
import { getDownloadUrl, isPdf, getOptimizedImageUrl } from '@/lib/utils';
import {
  PublicPortfolioData,
  PublicPortfolioProjectCategory,
  PublicPortfolioSkill,
} from '@/lib/domains/public-portfolio';
import { siteConfig } from '@/config/site';

interface PortfolioClientProps {
  data: PublicPortfolioData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
} as const;

export default function PortfolioClient({ data }: PortfolioClientProps) {
  const { user, profile, projects, skills, skillCategories } = data;
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const projectsPerPage = 3;

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  // Dynamically group skills by category
  const groupedSkills = useMemo(() => {
    return skillCategories
      .map(cat => ({
        ...cat,
        skills: skills.filter(s => s.category?._id === cat._id)
      }))
      .filter(cat => cat.skills.length > 0);
  }, [skills, skillCategories]);

  // Dynamically derive project filter categories
  const projectCategories = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => {
      p.category?.forEach(c => {
        if (c.name) {
          map.set(c.name, (map.get(c.name) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [projects]);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.category?.some(c => c.name === selectedCategory));
  }, [projects, selectedCategory]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const visibleProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const projectsSection = document.getElementById('work') || document.getElementById('projects');
    if (projectsSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = projectsSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Dedicated public portfolio navbar links
  const navLinks = [
    { label: 'Work', href: '#work', show: projects.length > 0 },
    { label: 'Tech Stack', href: '#skills', show: groupedSkills.length > 0 },
    { label: 'About', href: '#about', show: true },
    { label: 'Contact', href: '#contact', show: true },
  ].filter(link => link.show);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileNavOpen(false);
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const navOffset = 70;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Ensure resume URL has fl_attachment for direct download
  const resumeDownloadUrl = profile?.resumeUrl ? getDownloadUrl(profile.resumeUrl) : '';

  const handleDownload = async () => {
    if (!resumeDownloadUrl) return;
    
    try {
      const fetchUrl = `${resumeDownloadUrl}${resumeDownloadUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const isPdfFile = isPdf(resumeDownloadUrl);
      const fileName = `${user.firstName}_${user.lastName}_Resume${isPdfFile ? '.pdf' : '.docx'}`;
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.location.href = resumeDownloadUrl;
    }
  };

  // Dynamically computed real metrics from CMS data
  const featuredCount = projects.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#08090c] text-zinc-900 dark:text-[#e3e2e6] selection:bg-blue-500/20 antialiased font-sans transition-colors">
      {/* 0. PUBLIC PORTFOLIO DEDICATED NAVBAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/85 dark:bg-[#08090c]/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div className="container max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo on Left */}
          <Link href="/" className="flex flex-col items-start group" aria-label="Modulab Portfolio Home">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={110}
              height={28}
              priority
              className="h-5 sm:h-5.5 w-auto"
            />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
              Portfolio
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {resumeDownloadUrl && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#161b22] hover:bg-zinc-100 dark:hover:bg-[#1f242c] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Resume</span>
              </button>
            )}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-zinc-950 text-xs font-bold shadow-xs transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Get in Touch</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-zinc-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0e1117]/95 backdrop-blur-xl px-4 py-4 space-y-1"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col gap-2">
                {resumeDownloadUrl && (
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleDownload();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>Download Resume</span>
                  </button>
                )}
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 dark:bg-cyan-500 text-white dark:text-zinc-950 text-xs font-bold shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Me</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="w-full relative overflow-hidden">
        {/* Atmospheric Ambient Lighting Gradients */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-blue-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-96 -left-32 w-80 h-80 bg-blue-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-[800px] -right-32 w-96 h-96 bg-indigo-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* 1. HERO SECTION */}
        <section id="about" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24 w-full scroll-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Hero Text Content (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left order-2 lg:order-1">
              {/* Availability Signal Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#1b1b1f] border border-zinc-200/80 dark:border-white/[0.08] mb-6 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  AVAILABLE FOR NEW OPPORTUNITIES
                </span>
              </div>

              {/* Main Greeting & Name */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08] mb-3">
                I&apos;m{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 text-transparent bg-clip-text">
                  {user.firstName}
                </span>
              </h1>

              {/* Professional Headline */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-800 dark:text-zinc-200 tracking-tight mb-4 max-w-xl leading-snug">
                {profile?.headline || "Full-Stack Software Engineer & Solutions Architect"}
              </h2>

              {/* Bio Summary */}
              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-8 leading-relaxed font-normal">
                {profile?.bio || "I build high-performance web applications with a focus on user experience, distributed reliability, and clean code."}
              </p>

              {/* CTAs & Social Links */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <a
                  href="#work"
                  onClick={(e) => handleNavClick(e, '#work')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-sm shadow-md hover:scale-[1.02] transition-all group"
                >
                  <span>Selected Work</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {resumeDownloadUrl && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1b1b1f] dark:hover:bg-[#25252b] text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-white/[0.08] font-bold text-sm transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>Resume</span>
                  </button>
                )}

                {/* Social Channels */}
                <div className="flex items-center gap-2 ml-1">
                  {profile?.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#21262d] transition-all"
                      title="GitHub Profile"
                      aria-label="GitHub Profile"
                    >
                      <FaGithub className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-[#0077b5] hover:bg-zinc-200 dark:hover:bg-[#21262d] transition-all"
                      title="LinkedIn Profile"
                      aria-label="LinkedIn Profile"
                    >
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-[#1da1f2] hover:bg-zinc-200 dark:hover:bg-[#21262d] transition-all"
                      title="Twitter / X Profile"
                      aria-label="Twitter Profile"
                    >
                      <FaTwitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#21262d] transition-all"
                      title="Personal Website"
                      aria-label="Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Dynamic Telemetry Stats Bar (Computed 100% from CMS data) */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50/80 dark:bg-[#0d0e11]/70 border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-md p-4 rounded-2xl shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-cyan-400 font-sans">
                    {projects.length}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Total Projects
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                    {skills.length}+
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Technologies
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-sans">
                    {groupedSkills.length}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Skill Domains
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-sans">
                    {featuredCount > 0 ? `${featuredCount} Featured` : '100% Live'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Portfolio Status
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Avatar Container (5 cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-indigo-500/20 rounded-[2.5rem] blur-2xl -z-10" />
              <div className="relative w-full max-w-[360px] p-3 bg-zinc-100/90 dark:bg-[#1b1b1f]/90 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                {/* Inner Image Canvas */}
                <div className="relative overflow-hidden rounded-[2rem] aspect-[4/4.8] bg-zinc-200 dark:bg-[#292a2d] group">
                  {profile?.image ? (
                    <Image
                      src={getOptimizedImageUrl(profile.image, { width: 800 })}
                      alt={fullName}
                      fill
                      priority
                      sizes="(max-width: 768px) 300px, 360px"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-7xl font-black">
                      {user.firstName[0]}
                    </div>
                  )}

                  {/* Bottom gradient scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Floating Micro Badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 px-3.5 rounded-xl bg-white/95 dark:bg-[#1f1f23]/95 backdrop-blur-md flex items-center justify-between border border-zinc-200/60 dark:border-white/[0.08] shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[140px]">
                        {user.username}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-400 tracking-wider uppercase">
                      PORTFOLIO LIVE
                    </span>
                  </div>
                </div>

                {/* Accent Tag */}
                <div className="absolute -top-2.5 -right-2.5 px-3 py-1 rounded-full bg-blue-600 dark:bg-[#343538] text-white dark:text-cyan-300 font-mono text-[10px] font-bold shadow-md flex items-center gap-1 border border-blue-500/30 dark:border-white/[0.08]">
                  <Sparkles className="w-3 h-3" />
                  <span>VERIFIED CMS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SELECTED WORK / SHOWCASE SECTION */}
        <section id="work" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full scroll-mt-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-[2px] bg-blue-600 dark:bg-cyan-400" />
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 tracking-widest uppercase">
                  SELECTED PORTFOLIO
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                Selected Work
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed md:text-right">
              Crafting high-throughput digital experiences through precise code, clean architectures, and intentional UI design.
            </p>
          </div>

          {/* Dynamic Category Filter Bar (Generated from CMS categories) */}
          {projectCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-10 scrollbar-none">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 dark:bg-cyan-400 text-white dark:text-zinc-950 shadow-md shadow-blue-500/20'
                    : 'bg-zinc-100 dark:bg-[#161b22] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All Projects ({projects.length})
              </button>
              {projectCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600 dark:bg-cyan-400 text-white dark:text-zinc-950 shadow-md shadow-blue-500/20'
                      : 'bg-zinc-100 dark:bg-[#161b22] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          )}

          {/* Projects Stack */}
          <div className="flex flex-col gap-10 sm:gap-12">
            {visibleProjects.map((project) => (
              <article
                key={project._id}
                className="p-4 sm:p-8 lg:p-9 rounded-2xl sm:rounded-3xl bg-zinc-50/90 dark:bg-[#0e1117]/90 border border-zinc-200/80 dark:border-white/[0.07] backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                  {/* Browser Mockup Preview (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#08090c] border border-zinc-200/80 dark:border-white/[0.07] shadow-xl">
                    {/* Window Chrome Header (Proportionally scaled on mobile, full desktop chrome preserved) */}
                    <div className="h-7 sm:h-9 bg-zinc-100/90 dark:bg-[#161b22]/90 px-2.5 sm:px-4 flex items-center justify-between border-b border-zinc-200/60 dark:border-white/[0.06] select-none gap-1.5 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400/80 dark:bg-red-500/60" />
                        <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/60" />
                        <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-0.5 rounded-md bg-white dark:bg-[#0d0e11] text-[9px] sm:text-[11px] font-mono text-zinc-500 dark:text-zinc-400 min-w-0 max-w-[150px] sm:max-w-[240px] truncate border border-zinc-200/60 dark:border-white/[0.05]">
                        <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          {project.liveLink ? project.liveLink.replace(/^https?:\/\//, '') : (project.githubLink ? project.githubLink.replace(/^https?:\/\//, '') : 'portfolio.modulab.online')}
                        </span>
                      </div>
                      <span className="font-mono text-[8.5px] sm:text-[10px] font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{project.liveLink ? 'LIVE' : 'SOURCE'}</span>
                      </span>
                    </div>

                    {/* Mockup Graphic Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-[#121316]">
                      <Image
                        src={getOptimizedImageUrl(project.image, { width: 1200 })}
                        alt={project.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 58vw, 644px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Architecture category badge overlay */}
                      {project.category && project.category.length > 0 && (
                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 p-1 px-2 sm:p-1.5 sm:px-3 rounded-md sm:rounded-lg bg-black/85 backdrop-blur-md flex items-center gap-1 sm:gap-1.5 border border-white/10 shadow-md max-w-[calc(100%-1rem)]">
                          <FolderKanban className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-mono text-[9px] sm:text-[11px] text-white truncate">
                            {project.category.map(c => c.name).join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details & Spec (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col items-start justify-center">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {project.featured && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-500/20">
                          FEATURED
                        </span>
                      )}
                      {project.category?.map((cat: PublicPortfolioProjectCategory) => (
                        <span
                          key={cat._id}
                          className="px-2 py-0.5 rounded bg-blue-50 dark:bg-[#161b22] text-blue-600 dark:text-cyan-400 font-mono text-[10px] font-bold uppercase border border-blue-200/50 dark:border-white/[0.06]"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed font-normal">
                      {project.summary}
                    </p>

                    {/* Mobile & Desktop Rich Details Toggle */}
                    {project.description && (
                      <div className="w-full mb-4">
                        <button
                          type="button"
                          onClick={() => toggleProject(project._id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline uppercase tracking-wider cursor-pointer mb-2"
                        >
                          <span>{expandedProjects[project._id] ? 'Hide Case Study' : 'View Case Study'}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedProjects[project._id] ? 'rotate-90' : ''}`} />
                        </button>
                        {expandedProjects[project._id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.06] text-xs max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            <ProjectDetail description={project.description} />
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Tech Chips with Devicons */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.techStack.map((skill: PublicPortfolioSkill) => (
                          <span
                            key={skill._id}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.06] font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs"
                          >
                            <Devicon icon={skill.icon} alt={skill.name} className="w-3.5 h-3.5 object-contain" />
                            <span>{skill.name}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Conditional Project Actions (View Live & GitHub) */}
                    <div className="flex items-center gap-3 w-full pt-3 border-t border-zinc-200/70 dark:border-white/[0.06]">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-zinc-950 font-bold text-xs shadow-sm hover:scale-105 transition-all"
                        >
                          <span>View Live</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-[#1f242c] dark:hover:bg-[#282f3a] text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-all"
                        >
                          <FaGithub className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      <span className="ml-auto font-mono text-[11px] text-zinc-400">
                        &copy; {new Date(project.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 dark:bg-cyan-400 text-white dark:text-zinc-950 shadow-md shadow-blue-500/20'
                        : 'border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* 3. TECHNICAL ARSENAL / SKILLS BENTO GRID */}
        {groupedSkills.length > 0 && (
          <section id="skills" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full scroll-mt-16">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#161b22] border border-zinc-200/80 dark:border-white/[0.08] mb-3">
                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-cyan-400 tracking-widest uppercase">
                  EXPERTISE
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                Technical{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 text-transparent bg-clip-text">
                  Arsenal
                </span>
                <span className="text-blue-600 dark:text-cyan-400">.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mt-2">
                Technologies, frameworks, and developer tooling cataloged directly from Modulab CMS.
              </p>
            </div>

            {/* Dynamic Bento Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {groupedSkills.map((category, idx) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  className="p-6 sm:p-7 rounded-2xl bg-zinc-50/90 dark:bg-[#0e1117]/90 border border-zinc-200/80 dark:border-white/[0.07] backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-cyan-500/40 transition-all group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-400/20">
                        <Cpu className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">
                        {String(idx + 1).padStart(2, '0')} / {category.name.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1.5">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                      Specialized technologies and tools in {category.name}.
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200/60 dark:border-white/[0.05]">
                    {category.skills.map((skill) => (
                      <div
                        key={skill._id}
                        className="p-2 px-3 rounded-xl bg-white dark:bg-[#161b22] border border-zinc-200/60 dark:border-white/[0.05] flex items-center gap-2 hover:border-blue-500/30 dark:hover:border-cyan-400/30 transition-colors shadow-2xs"
                      >
                        <Devicon
                          icon={skill.icon}
                          alt={skill.name}
                          className="w-4 h-4 object-contain shrink-0"
                        />
                        <span className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {skill.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* 4. HEADLESS CMS ARCHITECTURE BANNER */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 dark:from-[#0e1117] dark:via-[#161b22] dark:to-[#0e1117] border border-zinc-200/80 dark:border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-cyan-400/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  Headless Portfolio Architecture
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Powered by Modulab Core: dynamic CMS feeds, Cloudinary CDN asset pipeline, and sub-second edge SSR rendering.
                </p>
              </div>
            </div>
            <a
              href={siteConfig.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#1f242c] hover:bg-zinc-50 dark:hover:bg-[#282f3a] text-zinc-800 dark:text-cyan-300 font-mono text-xs font-bold border border-zinc-200/80 dark:border-white/[0.08] shrink-0 transition-all shadow-2xs"
            >
              <span>Explore Platform</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* 5. RADIANT GLOBAL CTA CARD (LEVEL 3 CONTRAST FOCAL CONTAINER) */}
        <section id="contact" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full scroll-mt-16">
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-8 sm:p-14 md:p-18 text-center shadow-2xl border border-zinc-800 dark:border-zinc-200">
            {/* Subtle Top Glow Decoration */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 dark:bg-cyan-500/20 blur-3xl pointer-events-none rounded-full" />
            
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="font-mono text-[11px] font-bold text-blue-400 dark:text-blue-600 tracking-widest uppercase mb-3">
                GET IN TOUCH
              </span>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4">
                Let&apos;s build something{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 dark:from-blue-600 dark:to-indigo-600 text-transparent bg-clip-text">
                  exceptional
                </span>
                .
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-400 dark:text-zinc-600 mb-8 max-w-lg leading-relaxed font-normal">
                I&apos;m currently accepting new engineering opportunities, full-stack projects, and technical consulting. Feel free to reach out anytime.
              </p>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                <motion.a
                  href={`mailto:${user.email}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Say Hello</span>
                </motion.a>
              </div>

              {/* Verified Social Anchors */}
              {(profile?.socialLinks?.github || profile?.socialLinks?.linkedin || profile?.socialLinks?.twitter || profile?.socialLinks?.website) && (
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10 dark:border-zinc-200 text-zinc-400 dark:text-zinc-600">
                  {profile?.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:text-white dark:hover:text-black transition-colors"
                      title="GitHub"
                      aria-label="GitHub"
                    >
                      <FaGithub className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:text-[#0077b5] transition-colors"
                      title="LinkedIn"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:text-[#1da1f2] transition-colors"
                      title="Twitter / X"
                      aria-label="Twitter"
                    >
                      <FaTwitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.socialLinks?.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:text-white dark:hover:text-black transition-colors"
                      title="Website"
                      aria-label="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 6. TECHNICAL FOOTER */}
      <footer className="w-full bg-zinc-50 dark:bg-[#050608] border-t border-zinc-200/80 dark:border-white/[0.07] py-10 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                {fullName}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-[#161b22] font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                MODULAB CORE
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} {fullName}. Powered by{' '}
              <a href={siteConfig.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-cyan-400 hover:underline font-semibold">
                Modulab Portfolio
              </a>.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {profile?.socialLinks?.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <FaGithub className="w-3.5 h-3.5" />
                <span>GITHUB</span>
              </a>
            )}
            {profile?.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <FaLinkedin className="w-3.5 h-3.5" />
                <span>LINKEDIN</span>
              </a>
            )}
            {profile?.socialLinks?.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <FaTwitter className="w-3.5 h-3.5" />
                <span>X/TWITTER</span>
              </a>
            )}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 rounded-full bg-zinc-200/80 dark:bg-[#161b22] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-[#21262d] transition-all cursor-pointer shadow-2xs"
              title="Back to top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
