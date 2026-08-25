'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { validateAssetReference } from '@/lib/domains/media';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import mongoose from 'mongoose';

export async function createProject(prevState: any, formData: FormData) {
  const session = await auth();

  if (!session?.user?.username) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const description = formData.get('description') as string;
  const categoryJson = formData.get('category') as string;
  const techStackJson = formData.get('techStack') as string;
  
  let categoryIds = [];
  let techStackIds = [];

  try {
    const rawCategories = categoryJson ? JSON.parse(categoryJson) : [];
    categoryIds = (Array.isArray(rawCategories) ? rawCategories : [rawCategories])
      .map(id => new mongoose.Types.ObjectId(id));
  } catch (e) {
    return { error: 'Invalid category data' };
  }

  try {
    const rawTechStack = techStackJson ? JSON.parse(techStackJson) : [];
    techStackIds = (Array.isArray(rawTechStack) ? rawTechStack : [rawTechStack])
      .map(id => new mongoose.Types.ObjectId(id));
  } catch (e) {
    return { error: 'Invalid tech stack data' };
  }

  const liveLink = formData.get('liveLink') as string;
  const githubLink = formData.get('githubLink') as string;
  const imageUrl = (formData.get('image') as string)?.trim();
  const featured = formData.get('featured') === 'on';

  // 1. Validate Asset Reference via Media domain boundary
  if (!imageUrl) {
    return { error: 'Project image is required' };
  }

  const validation = validateAssetReference(imageUrl, {
    username: session.user.username,
    purpose: 'project-thumbnail',
  });

  if (!validation.valid) {
    return { error: validation.error || 'Invalid project image reference' };
  }

  // 2. Save to Database
  try {
    const newProject = new Project({
      userId: session.user.id,
      title,
      slug,
      summary,
      description,
      category: categoryIds,
      liveLink,
      githubLink,
      image: imageUrl,
      featured,
      techStack: techStackIds,
    });
    
    await newProject.save();

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: 'Slug must be unique' };
    }
    return { error: error.message || 'Failed to create project' };
  }

  redirect('/admin?success=true');
}

export async function updateProject(projectId: string, prevState: any, formData: FormData) {
  const session = await auth();

  if (!session?.user?.username) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const description = formData.get('description') as string;
  const categoryJson = formData.get('category') as string;
  const techStackJson = formData.get('techStack') as string;
  const liveLink = formData.get('liveLink') as string;
  const githubLink = formData.get('githubLink') as string;
  const imageUrl = (formData.get('image') as string)?.trim();
  const featured = formData.get('featured') === 'on';

  let categoryIds = [];
  let techStackIds = [];

  try {
    const rawCategories = categoryJson ? JSON.parse(categoryJson) : [];
    categoryIds = (Array.isArray(rawCategories) ? rawCategories : [rawCategories])
      .map(id => new mongoose.Types.ObjectId(id));
  } catch (e) {
    return { error: 'Invalid category data' };
  }

  try {
    const rawTechStack = techStackJson ? JSON.parse(techStackJson) : [];
    techStackIds = (Array.isArray(rawTechStack) ? rawTechStack : [rawTechStack])
      .map(id => new mongoose.Types.ObjectId(id));
  } catch (e) {
    return { error: 'Invalid tech stack data' };
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId: session.user.id });
    if (!project) {
      return { error: 'Project not found' };
    }

    // Validate asset reference if updated
    if (imageUrl && imageUrl !== project.image) {
      const validation = validateAssetReference(imageUrl, {
        username: session.user.username,
        purpose: 'project-thumbnail',
      });
      if (!validation.valid) {
        return { error: validation.error || 'Invalid project image reference' };
      }
      project.image = imageUrl;
    } else if (!imageUrl) {
      return { error: 'Project image is required' };
    }

    project.title = title;
    project.slug = slug;
    project.summary = summary;
    project.description = description;
    project.category = categoryIds;
    project.techStack = techStackIds;
    project.liveLink = liveLink;
    project.githubLink = githubLink;
    project.featured = featured;

    await project.save();

    revalidatePath('/admin');
    revalidatePath(`/admin/projects/edit/${projectId}`);
    revalidatePath('/');
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: 'Slug must be unique' };
    }
    return { error: error.message || 'Failed to update project' };
  }

  redirect('/admin?success=true');
}

export async function deleteProject(projectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    const project = await Project.findOneAndDelete({
      _id: projectId,
      userId: session.user.id,
    });

    if (!project) {
      return { error: 'Project not found or unauthorized' };
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete project' };
  }
}
