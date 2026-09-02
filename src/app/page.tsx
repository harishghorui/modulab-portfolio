'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaChevronRight,
  FaGithub,
  FaArrowRight,
} from 'react-icons/fa';
import {
  FiMonitor,
  FiDatabase,
  FiCloud,
  FiZap,
} from 'react-icons/fi';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function PortfolioProductPage() {
  const loginUrl = "/login";

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start group">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={240}
              height={64}
              priority
              className="h-6 w-auto"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
              Portfolio
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech" className="hover:text-white transition-colors">Tech Stack</a>
            <a href={loginUrl} className="hover:text-white transition-colors">Admin Login</a>
          </div>
          <a
            href={loginUrl}
            className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-500/20">
              Modulab Portfolio Module
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
              Your Work Deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Masterpiece</span>.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              The ultimate CMS for developers. Manage your projects, skills, and categories in a high-performance, dark-themed ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href={loginUrl}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[20px] font-black text-lg shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <FaChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://github.com/harishghorui/modulab-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-zinc-900 border border-white/10 rounded-[20px] font-black text-lg hover:bg-zinc-800 transition-all flex items-center gap-3"
              >
                <FaGithub className="w-6 h-6" />
                Source Code
              </a>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
          className="container max-w-7xl mx-auto mt-24 px-6"
        >
          <div className="relative group">
            {/* Mockup Frame */}
            <div className="relative z-10 bg-zinc-900 rounded-[32px] border border-white/10 p-4 shadow-2xl shadow-blue-500/20 overflow-hidden backdrop-blur-2xl">
              <div className="h-8 flex items-center gap-2 px-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <div className="ml-4 h-4 w-40 bg-white/5 rounded-full" />
              </div>

              {/* Fake Dashboard Content */}
              <div className="grid grid-cols-12 gap-6 p-4 bg-black/50 rounded-2xl min-h-[500px]">
                <div className="col-span-3 space-y-4">
                  <div className="h-10 bg-blue-600/20 rounded-xl border border-blue-500/20" />
                  <div className="h-8 bg-white/5 rounded-lg" />
                  <div className="h-8 bg-white/5 rounded-lg" />
                  <div className="h-8 bg-white/5 rounded-lg" />
                </div>
                <div className="col-span-9 space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                  </div>
                  <div className="h-64 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-white/10 rounded-full" />
                    <div className="h-4 w-full bg-white/5 rounded-full" />
                    <div className="h-4 w-full bg-white/5 rounded-full" />
                    <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                    <div className="mt-auto h-12 w-32 bg-blue-600 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative background for mockup */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[40px] blur-3xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity" />
          </div>
        </motion.div>
      </section>

      {/* Built for Scale Section */}
      <section id="tech" className="py-32 px-6 bg-zinc-950/50 border-y border-white/5">
        <div className="container max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Built for <span className="text-blue-500">Scale</span>.</h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Engineered with the most powerful technologies in the modern web ecosystem.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: <FiMonitor className="w-8 h-8 text-blue-500" />, title: "Next.js 15", desc: "App Router & React Server Components" },
              { icon: <FiDatabase className="w-8 h-8 text-green-500" />, title: "Mongoose", desc: "Reliable MongoDB Data Modeling" },
              { icon: <FiCloud className="w-8 h-8 text-amber-500" />, title: "Cloudinary", desc: "Optimized Media & File Management" },
              { icon: <FiZap className="w-8 h-8 text-purple-500" />, title: "Framer Motion", desc: "Immersive Production Animations" }
            ].map((tech, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-8 rounded-[32px] bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{tech.icon}</div>
                <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="container max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-zinc-900 to-black p-12 md:p-24 rounded-[60px] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8">Ready to showcase your journey?</h2>
              <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium">
                Join hundreds of developers who have elevated their professional presence.
              </p>
              <a
                href={loginUrl}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-[20px] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Start Your Portfolio
                <FaArrowRight className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex flex-col items-start opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={180}
              height={52}
              className="h-5 w-auto"
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              Portfolio
            </span>
          </Link>

          <div className="flex items-center gap-10 text-xs font-black uppercase tracking-widest text-zinc-500">
            <a href={loginUrl} className="hover:text-white transition-colors">Admin Dashboard</a>
            <a
              href="https://github.com/harishghorui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <FaGithub className="w-4 h-4" />
              Personal GitHub
            </a>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            &copy; {new Date().getFullYear()} Modulab Portfolio. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
