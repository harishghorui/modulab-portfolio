import dbConnect from '@/lib/db';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import SkillCategory from '@/models/SkillCategory';
import Category from '@/models/Category';
import { getDownloadUrl } from '@/lib/domains/media/transform';
import {
  PublicPortfolioData,
  PublicPortfolioProfile,
  PublicPortfolioProject,
  PublicPortfolioSkill,
  PublicPortfolioSkillCategory,
} from './types';

/**
 * Assembles and serializes the complete public portfolio projection for a given username.
 * Returns null if the user does not exist.
 */
export async function getPublicPortfolioData(
  username?: string
): Promise<PublicPortfolioData | null> {
  if (!username) return null;

  try {
    await dbConnect();

    // Ensure models are registered for Mongoose populate
    const _models = [User, Profile, Project, Skill, SkillCategory, Category];
    if (!_models.every((m) => !!m)) {
      console.error('One or more Mongoose models failed to initialize.');
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername }).lean<{ _id: unknown; username: string; firstName: string; lastName: string; email: string } | null>();

    if (!user) return null;

    const [profile, projects, skills, skillCategories] = await Promise.all([
      Profile.findOne({ userId: user._id }).lean<PublicPortfolioProfile | null>(),
      Project.find({ userId: user._id })
        .populate('techStack')
        .populate('category')
        .sort({ featured: -1, createdAt: -1 })
        .lean<PublicPortfolioProject[]>(),
      Skill.find({ userId: user._id }).populate('category').lean<PublicPortfolioSkill[]>(),
      SkillCategory.find({ userId: user._id }).sort({ name: 1 }).lean<PublicPortfolioSkillCategory[]>(),
    ]);

    const transformedProfile = profile ? { ...profile } : null;
    if (transformedProfile && transformedProfile.resumeUrl) {
      transformedProfile.resumeUrl = getDownloadUrl(transformedProfile.resumeUrl);
    }

    return {
      user: JSON.parse(JSON.stringify(user || {})),
      profile: JSON.parse(JSON.stringify(transformedProfile || null)),
      projects: JSON.parse(JSON.stringify(projects || [])),
      skills: JSON.parse(JSON.stringify(skills || [])),
      skillCategories: JSON.parse(JSON.stringify(skillCategories || [])),
    };
  } catch (error) {
    console.error(`Error aggregating public portfolio data for ${username}:`, error);
    throw error;
  }
}
