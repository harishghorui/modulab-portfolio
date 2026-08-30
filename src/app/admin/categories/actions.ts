'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';

export async function saveCategory(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  try {
    let category;

    if (id) {
      // Update existing
      category = await Category.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { name, slug },
        { new: true }
      );
      if (!category) return { error: 'Category not found or unauthorized' };
    } else {
      // Create new
      const newCategory = new Category({
        name,
        slug,
        userId: session.user.id,
      });
      category = await newCategory.save();
    }

    revalidatePath('/admin/categories');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return { error: 'Category or slug already exists' };
    }
    return { error: err.message || 'Failed to save category' };
  }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    await Category.findOneAndDelete({
      _id: categoryId,
      userId: session.user.id,
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || 'Failed to delete category' };
  }
}
