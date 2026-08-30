'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Skill from '@/models/Skill';
import SkillCategory from '@/models/SkillCategory';
import { revalidatePath } from 'next/cache';

// Skill Category Actions
export async function saveSkillCategory(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  try {
    let category;

    if (id) {
      category = await SkillCategory.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { name },
        { new: true }
      );
      if (!category) return { error: 'Category not found or unauthorized' };
    } else {
      const newCategory = new SkillCategory({
        name,
        userId: session.user.id,
      });
      category = await newCategory.save();
    }

    revalidatePath('/admin/skills');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return { error: 'Category name must be unique' };
    }
    return { error: err.message || 'Failed to save category' };
  }
}

export async function deleteSkillCategory(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    // Check if any skills are using this category
    const skillsUsing = await Skill.countDocuments({ category: id });
    if (skillsUsing > 0) {
      return { error: 'Cannot delete category that is being used by skills' };
    }

    await SkillCategory.findOneAndDelete({ _id: id, userId: session.user.id });
    revalidatePath('/admin/skills');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || 'Failed to delete category' };
  }
}

// Skill Actions
export async function saveSkill(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const icon = formData.get('icon') as string;

  try {
    let skill;

    if (id) {
      // Update existing
      skill = await Skill.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { name, category, icon },
        { new: true }
      ).populate('category');
      
      if (!skill) return { error: 'Skill not found or unauthorized' };
    } else {
      // Create new
      if (!icon) return { error: 'Skill icon is required' };

      const newSkill = new Skill({
        name,
        category,
        icon,
        userId: session.user.id,
      });
      skill = await newSkill.save();
      // Populate for the immediate UI update
      await skill.populate('category');
    }

    revalidatePath('/admin/skills');
    return { success: true, skill: JSON.parse(JSON.stringify(skill)) };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return { error: 'Skill name must be unique' };
    }
    return { error: err.message || 'Failed to save skill' };
  }
}

export async function deleteSkill(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    await Skill.findOneAndDelete({ _id: id, userId: session.user.id });
    revalidatePath('/admin/skills');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || 'Failed to delete skill' };
  }
}
