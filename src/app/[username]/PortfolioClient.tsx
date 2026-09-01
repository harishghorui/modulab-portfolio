'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileDown
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
      staggerChildren: 0.05
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }
} as const;

export default function PortfolioClient({ data }: PortfolioClientProps) {
  const { user, profile, projects, skills, skillCategories } = data;
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(false);
  const projectsPerPage = 3;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      const offset = 80; // Account for fixed nav
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

  const fullName = `${user.firstName} ${user.lastName}`;
  const visibleProjects = projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const groupedSkills = skillCategories.map(cat => ({
    ...cat,
    skills: skills.filter(s => s.category?._id === cat._id)
  })).filter(cat => cat.skills.length > 0);

  // Ensure resume URL has fl_attachment for direct download
  const resumeDownloadUrl = profile?.resumeUrl ? getDownloadUrl(profile.resumeUrl) : '';

  const handleDownload = async () => {
    if (!resumeDownloadUrl) return;
    
    try {
      // Append timestamp to bypass browser cache
      const fetchUrl = `${resumeDownloadUrl}${resumeDownloadUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const isPdfFile = isPdf(resumeDownloadUrl);
      const fileName = `Harish_Ghorui_Resume${isPdfFile ? '.pdf' : '.docx'}`;
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct link if fetch fails
      window.location.href = resumeDownloadUrl;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container max-w-6xl mx-auto z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <motion.div 
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex-1 text-center md:text-left order-2 md:order-1"
            >
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-8 border border-blue-100 dark:border-blue-900/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Available for new opportunities
                </span>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
                I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">{user.firstName}</span>
              </h1>
              
              <p className="text-2xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-200 mb-8 leading-tight">
                {profile?.headline || "Creative Developer & Designer"}
              </p>
              
              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-xl leading-relaxed font-medium">
                {profile?.bio || "I build high-performance web applications with a focus on user experience and clean code."}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <motion.a 
                  href="#projects" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[20px] font-black text-lg shadow-2xl shadow-zinc-400/20 dark:shadow-none transition-all flex items-center gap-3"
                >
                  Selected Work
                  <ChevronRight className="w-5 h-5" />
                </motion.a>

                {resumeDownloadUrl && (
                  <motion.button 
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-2 border-zinc-200 dark:border-zinc-800 rounded-[20px] font-black text-lg shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <FileDown className="w-6 h-6" />
                    Resume
                  </motion.button>
                )}
                
                <div className="flex items-center gap-5 md:ml-4 pt-4 md:pt-0">
                  {profile?.socialLinks?.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all transform hover:scale-110">
                      <FaGithub className="w-7 h-7" />
                    </a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#0077b5] transition-all transform hover:scale-110">
                      <FaLinkedin className="w-7 h-7" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative order-1 md:order-2"
            >
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative z-10 w-64 h-64 md:w-[450px] md:h-[450px] rounded-[60px] md:rounded-[100px] overflow-hidden border-[12px] border-white dark:border-zinc-900 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)]"
              >
                {profile?.image ? (
                  <Image 
                    src={getOptimizedImageUrl(profile.image, { width: 900 })} 
                    alt={fullName} 
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 768px) 256px, 450px"
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-8xl font-black">
                    {user.firstName[0]}
                  </div>
                )}
              </motion.div>
              {/* Background accent for image */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[70px] md:rounded-[110px] blur-2xl opacity-20 -z-10 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: hasScrolled ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Scroll</span>
          <div className="w-[2px] h-12 bg-gradient-to-b from-blue-600 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-32 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-8">
            <div className="relative">
              <motion.span 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                className="absolute -top-4 left-0 h-1 bg-blue-600 rounded-full" 
              />
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Selected Work</h2>
            </div>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-sm font-medium leading-relaxed">
              Crafting digital experiences through precise code and intentional design.
            </p>
          </div>

          <div className="flex flex-col gap-32 md:gap-48">
            {visibleProjects.map((project, idx) => (
              <motion.div 
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className={`group relative grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start pb-24 md:pb-32 ${
                  idx !== visibleProjects.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-900' : ''
                }`}
              >
                {/* Image Side */}
                <div className="lg:col-span-7 order-1 lg:order-1 lg:sticky lg:top-32">
                  <div className="relative aspect-[16/10] rounded-[32px] md:rounded-[48px] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-700">
                    <Image 
                      src={getOptimizedImageUrl(project.image, { width: 1200 })} 
                      alt={project.title} 
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 58vw, 644px"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-8 backdrop-blur-md">
                      {project.liveLink && (
                        <motion.a 
                          whileHover={{ scale: 1.1, y: -5 }}
                          whileTap={{ scale: 0.9 }}
                          href={project.liveLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl text-black flex items-center justify-center shadow-2xl transition-all"
                        >
                          <ExternalLink className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.a>
                      )}
                      {project.githubLink && (
                        <motion.a 
                          whileHover={{ scale: 1.1, y: -5 }}
                          whileTap={{ scale: 0.9 }}
                          href={project.githubLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 rounded-2xl md:rounded-3xl text-white flex items-center justify-center shadow-2xl border border-zinc-800 transition-all"
                        >
                          <FaGithub className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.a>
                      )}
                    </div>
                    {project.featured && (
                      <div className="absolute top-4 left-4 md:top-10 md:left-10 px-4 py-1.5 md:px-6 md:py-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3 border border-white/20 shadow-xl z-20">
                        <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        Featured
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-5 order-2 lg:order-2 lg:pt-4 h-full flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.category?.map((cat: PublicPortfolioProjectCategory) => (
                      <span key={cat._id} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 px-4 py-1.5 rounded-full border border-blue-100/50 dark:border-blue-900/20">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-[0.95] group-hover:text-blue-600 transition-colors duration-500">
                    {project.title}
                  </h3>
                  
                  {/* Stable Height Container for Summary and Description */}
                  <div className="relative min-h-[auto] md:min-h-[260px] mb-6 overflow-hidden">
                    {/* Summary - Visible by default, hidden on hover */}
                    <motion.div 
                      className="relative md:absolute inset-0 transition-all duration-500 group-hover:opacity-0 group-hover:pointer-events-none flex flex-col h-full"
                    >
                      <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        {project.summary}
                      </p>
                      
                      <div className="mt-6 md:mt-auto hidden md:flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest animate-bounce-x">
                        Hover to explore details
                        <ChevronRight className="w-4 h-4" />
                      </div>

                      {/* Mobile view description toggle */}
                      <div className="mt-8 md:hidden">
                        <button 
                          onClick={() => toggleProject(project._id)}
                          className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-6"
                        >
                          {expandedProjects[project._id] ? 'Hide Details' : 'View Details'}
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedProjects[project._id] ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {expandedProjects[project._id] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <ProjectDetail description={project.description} />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Detailed Description - Visible on hover, scrollable (Desktop Only) */}
                    <motion.div 
                      className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 overflow-y-auto custom-scrollbar pr-4"
                    >
                      <div className="pb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-6 block">In-depth Project Details</span>
                        <ProjectDetail description={project.description} />
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {project.techStack?.map((skill: PublicPortfolioSkill) => (
                        <div key={skill._id} className="group/tech relative w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-4 border-white dark:border-[#050505] p-2 shadow-sm flex items-center justify-center transition-transform hover:scale-110 hover:z-50" title={skill.name}>
                          <Devicon icon={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" />
                          {/* Minimal Tooltip */}
                          <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/tech:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {skill.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      &copy; {new Date(project.createdAt).getFullYear()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-24 flex items-center justify-center gap-2">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-32 px-6 relative overflow-hidden bg-white dark:bg-[#050505]">
        {/* Subtle grid background for technical feel */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-zinc-200 dark:border-zinc-800"
            >
              Expertise
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-black tracking-tighter mb-8"
            >
              Technical <span className="text-blue-600">Arsenal</span>.
            </motion.h2>
          </div>

          <div className="space-y-24 md:space-y-32">
            {groupedSkills.map((category, idx) => (
              <div 
                key={category._id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16"
              >
                {/* Category Header */}
                <div className="lg:col-span-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  >
                    <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-zinc-900 dark:text-white">
                      {category.name}
                    </h3>
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                    <p className="mt-6 text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-xs">
                      Specialized tools and technologies I use to build high-quality {category.name.toLowerCase()} solutions.
                    </p>
                  </motion.div>
                </div>
                
                {/* Skills Grid */}
                <div className="lg:col-span-8">
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="flex flex-wrap gap-4 md:gap-6"
                  >
                    {category.skills.map((skill: PublicPortfolioSkill) => (
                      <motion.div 
                        key={skill._id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group/skill relative px-5 py-4 md:px-6 md:py-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_20px_50px_-20px_rgba(37,99,235,0.2)] dark:hover:bg-zinc-900"
                      >
                        {/* Subtle Background Glow on Hover */}
                        <div className="absolute inset-0 bg-blue-500/0 group-hover/skill:bg-blue-500/5 rounded-2xl transition-all duration-500" />
                        
                        <Devicon 
                          icon={skill.icon} 
                          alt={skill.name} 
                          className="w-8 h-8 md:w-10 md:h-10 object-contain relative z-10 transition-all duration-500 drop-shadow-sm group-hover/skill:drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                        />
                        <div className="relative z-10">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover/skill:text-zinc-900 dark:group-hover/skill:text-white transition-colors">
                            {skill.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-zinc-100 dark:text-zinc-900/10 pointer-events-none -z-10 select-none tracking-tighter uppercase whitespace-nowrap opacity-50">
          Technologies
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="py-32 px-6">
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 dark:bg-white rounded-[60px] p-12 md:p-24 text-white dark:text-zinc-900 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] dark:bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-none">
                Start a <span className="text-blue-500">project</span>.
              </h2>
              
              <p className="text-xl md:text-2xl text-zinc-400 dark:text-zinc-500 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                I&apos;m currently accepting new projects and would love to hear about yours.
              </p>
              
              <motion.a 
                href={`mailto:${user.email}`} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-[28px] font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all"
              >
                <Mail className="w-7 h-7" />
                Say Hello
              </motion.a>

              <div className="mt-24 flex flex-wrap items-center justify-center gap-10">
                {profile?.socialLinks?.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white dark:hover:text-black transition-all transform hover:scale-125">
                    <FaGithub className="w-8 h-8" />
                  </a>
                )}
                {profile?.socialLinks?.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white dark:hover:text-black transition-all transform hover:scale-125">
                    <FaLinkedin className="w-8 h-8" />
                  </a>
                )}
                {profile?.socialLinks?.twitter && (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white dark:hover:text-black transition-all transform hover:scale-125">
                    <FaTwitter className="w-8 h-8" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 px-4 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <div>&copy; {new Date().getFullYear()} {fullName}</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-blue-600 transition-colors">Back to top</a>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <span>Built with <a href={siteConfig.platformUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Modulab</a></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
