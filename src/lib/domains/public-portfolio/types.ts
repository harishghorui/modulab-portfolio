/**
 * Public Portfolio Domain Types
 */

export interface PublicPortfolioUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PublicPortfolioProfile {
  _id: string;
  userId: string;
  headline?: string;
  bio?: string;
  image?: string;
  resumeUrl?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface PublicPortfolioSkill {
  _id: string;
  name: string;
  icon: string;
  category?: {
    _id: string;
    name: string;
  };
}

export interface PublicPortfolioSkillCategory {
  _id: string;
  name: string;
}

export interface PublicPortfolioProjectCategory {
  _id: string;
  name: string;
  slug?: string;
}

export interface PublicPortfolioProject {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image: string;
  featured?: boolean;
  liveLink?: string;
  githubLink?: string;
  category?: PublicPortfolioProjectCategory[];
  techStack?: PublicPortfolioSkill[];
  createdAt: string;
}

export interface PublicPortfolioData {
  user: PublicPortfolioUser;
  profile: PublicPortfolioProfile | null;
  projects: PublicPortfolioProject[];
  skills: PublicPortfolioSkill[];
  skillCategories: PublicPortfolioSkillCategory[];
}
