import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Category from '@/models/Category';
import { CMSDashboardStats, AdminProject } from './types';

/**
 * Retrieves aggregated CMS statistics and recent projects for the admin dashboard.
 * Returns serializable plain JavaScript objects safe for Server Components.
 */
export async function getCMSDashboardStats(
  userId?: string
): Promise<CMSDashboardStats> {
  if (!userId) {
    return {
      projectCount: 0,
      featuredCount: 0,
      skillCount: 0,
      latestProjects: [],
    };
  }

  await dbConnect();

  const [projectCount, featuredCount, skillCount, rawLatestProjects] = await Promise.all([
    Project.countDocuments({ userId }),
    Project.countDocuments({ userId, featured: true }),
    Skill.countDocuments({ userId }),
    Project.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: 'category', model: Category, select: 'name' })
      .lean(),
  ]);

  const latestProjects = JSON.parse(JSON.stringify(rawLatestProjects || []));

  return {
    projectCount,
    featuredCount,
    skillCount,
    latestProjects,
  };
}

/**
 * Retrieves all projects owned by a user for the admin project manager.
 * Populates category taxonomy and returns clean serialized plain objects.
 */
export async function getAdminProjects(
  userId?: string
): Promise<AdminProject[]> {
  if (!userId) return [];

  await dbConnect();

  const projects = await Project.find({ userId })
    .populate({ path: 'category', model: Category, select: 'name' })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(projects || []));
}
