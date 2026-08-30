'use client';

import { useState, useRef, useTransition } from 'react';
import { saveCategory, deleteCategory } from './actions';
import { Plus, Trash2, Tag, Loader2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryListProps {
  initialCategories: Category[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveCategory(null, formData);
      if (result?.success && result.category) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        if (editingCategory) {
          setCategories(categories.map(c => c._id === result.category._id ? result.category : c));
          setEditingCategory(null);
        } else {
          setCategories([...categories, result.category]);
        }
        formRef.current?.reset();
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);

    if (result.success) {
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Category deleted');
      if (editingCategory?._id === id) {
        setEditingCategory(null);
      }
    } else {
      toast.error(result.error || 'Failed to delete category');
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    formRef.current?.reset();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-8 h-8 text-blue-600" />
          Project Categories
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage dynamic categories for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Category Form (Add or Edit) */}
        <div className="md:col-span-1">
          <form 
            ref={formRef}
            action={handleFormSubmit}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4 sticky top-10"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {editingCategory ? (
                  <>
                    <Pencil className="w-5 h-5" />
                    Edit Category
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Category
                  </>
                )}
              </h2>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {editingCategory && (
              <input type="hidden" name="id" value={editingCategory._id} />
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </label>
              <input
                key={editingCategory?._id || 'new'}
                type="text"
                name="name"
                defaultValue={editingCategory?.name || ''}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="e.g. Full Stack"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Slug
              </label>
              <input
                key={editingCategory?._id || 'new'}
                type="text"
                name="slug"
                defaultValue={editingCategory?.slug || ''}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="e.g. full-stack"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                editingCategory ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />
              )}
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      No categories found. Add one above!
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id} className={cn(
                      "hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors",
                      editingCategory?._id === category._id && "bg-blue-50 dark:bg-blue-900/10"
                    )}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <ConfirmDialog
                            trigger={
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            }
                            title="Delete Category?"
                            description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
                            onConfirm={() => handleDelete(category._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
