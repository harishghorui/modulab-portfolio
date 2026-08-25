'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Star,
  Loader2,
  FolderKanban
} from 'lucide-react';
import { deleteProject } from './actions';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getOptimizedImageUrl } from '@/lib/domains/media/transform';
import { formatDate } from '@/lib/utils';

interface Project {
  _id: string;
  title: string;
  image: string;
  category: { _id: string; name: string }[];
  featured: boolean;
  createdAt: string;
  slug: string;
}

interface ProjectsTableProps {
  initialProjects: Project[];
}

export default function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteProject(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setProjects(projects.filter(p => p._id !== id));
        toast.success('Project deleted successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your showcase of work.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Project</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Categories</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Created At</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FolderKanban className="w-12 h-12 opacity-20" />
                      <p>No projects found. Start by creating your first one!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
                          <img 
                            src={getOptimizedImageUrl(project.image, { width: 100 })} 
                            alt={project.title} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{project.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">/{project.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.category && project.category.length > 0 ? (
                          project.category.map((cat: any) => (
                            <span key={cat._id} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic text-[10px]">Uncategorized</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.featured ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/edit/${project._id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <ConfirmDialog
                          trigger={
                            <button
                              disabled={deletingId === project._id}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === project._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          }
                          title="Delete Project?"
                          description={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
                          onConfirm={() => handleDelete(project._id)}
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
  );
}
