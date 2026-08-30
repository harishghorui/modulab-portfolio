'use client';

import { useActionState, useState, useEffect } from 'react';
import { createProject, updateProject, type ProjectActionState } from '../actions';
import { 
  LayoutGrid, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  Tag, 
  Save, 
  ArrowLeft, 
  Loader2, 
  Upload, 
  X, 
  Brain, 
  Search, 
  Check,
  AlertCircle 
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { uploadDirectToMediaProvider } from '@/lib/domains/media/client';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { Devicon } from '@/components/ui/Devicon';

const initialState: ProjectActionState = undefined;

interface InitialProjectData {
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  category?: string[];
  techStack?: string[];
  liveLink?: string;
  githubLink?: string;
  image?: string;
  featured?: boolean;
}

interface ProjectFormProps {
  categories: { _id: string; name: string }[];
  skills: { _id: string; name: string; icon: string }[];
  initialData?: InitialProjectData;
}

export default function ProjectForm({ categories, skills, initialData }: ProjectFormProps) {
  const isEdit = Boolean(initialData?._id);
  const action = initialData?._id ? updateProject.bind(null, initialData._id) : createProject;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image || '');
  const [preview, setPreview] = useState<string>(initialData?.image || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.techStack || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.category || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    if (state?.error) {
      setLocalError(state.error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLocalError(null);
    
    let hasError = false;
    if (isUploading) {
      setLocalError('Image is still uploading. Please wait a moment.');
      hasError = true;
    } else if (selectedCategories.length === 0) {
      setLocalError('Please select at least one category.');
      hasError = true;
    } else if (selectedSkills.length === 0) {
      setLocalError('Please select at least one skill for the tech stack.');
      hasError = true;
    } else if (!imageUrl) {
      setLocalError('Project image is required.');
      hasError = true;
    } else if (!description || description === '<p></p>') {
      setLocalError('Project description is required.');
      hasError = true;
    }

    if (hasError) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId]
    );
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) 
        : [...prev, catId]
    );
  };

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(catSearchQuery.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Selected file must be an image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError('Image file size must be under 10MB.');
      return;
    }

    setLocalError(null);
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const result = await uploadDirectToMediaProvider(file, 'project-thumbnail');
      setImageUrl(result.secureUrl);
      toast.success('Image uploaded successfully');
    } catch (err: unknown) {
      console.error('Direct upload failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to upload image to media provider';
      setLocalError(message);
      setPreview(initialData?.image || '');
      setImageUrl(initialData?.image || '');
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setPreview('');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            {isEdit ? 'Update Project' : 'Add New Project'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update your project details.' : 'Create a new showcase for your portfolio.'}
          </p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        {(localError || state?.error) && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{localError || state?.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialData?.title}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. My Awesome Portfolio"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              Slug (for URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              required
              defaultValue={initialData?.slug}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. my-awesome-portfolio"
            />
          </div>

          {/* Categories - Multi-Select UI */}
          <div className="space-y-4 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-gray-500" />
              Project Categories <span className="text-red-500">*</span> (Selected {selectedCategories.length})
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="Search categories..."
                value={catSearchQuery}
                onChange={(e) => setCatSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
              {filteredCategories.length === 0 ? (
                <div className="col-span-full py-4 text-center text-sm text-gray-500">
                  No categories found matching &quot;{catSearchQuery}&quot;
                </div>

              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat._id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all group relative text-left",
                        isSelected
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700"
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && (
                        <div className="ml-auto flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <input type="hidden" name="category" value={JSON.stringify(selectedCategories)} />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              Project Image <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-4">
              {!preview ? (
                <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    required={!isEdit && !imageUrl}
                  />
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="mt-2 text-sm text-gray-500">Click or drag to upload</p>
                </div>
              ) : (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Local blob: preview URLs and in-flight uploads cannot be optimized by next/image */}
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className={cn("w-full h-full object-cover", isUploading && "opacity-50")}
                    referrerPolicy="no-referrer"
                  />
                  {isUploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-medium">Uploading to cloud...</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <input type="hidden" name="image" value={imageUrl} />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-500" />
              Tech Stack <span className="text-red-500">*</span> (Selected {selectedSkills.length})
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
              {filteredSkills.length === 0 ? (
                <div className="col-span-full py-4 text-center text-sm text-gray-500">
                  No skills found matching &quot;{searchQuery}&quot;
                </div>

              ) : (
                filteredSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill._id);
                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkill(skill._id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all group relative text-left",
                        isSelected
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700"
                      )}
                    >
                      <div className="w-6 h-6 flex-shrink-0 bg-white dark:bg-zinc-950 rounded p-1 border border-gray-100 dark:border-zinc-800 group-hover:scale-110 transition-transform flex items-center justify-center">
                        <Devicon icon={skill.icon} alt={skill.name} className="w-4 h-4 object-contain" />
                      </div>
                      <span className="truncate">{skill.name}</span>
                      {isSelected && (
                        <div className="ml-auto flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Selected Skills Pills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedSkills.map(id => {
                  const skill = skills.find(s => s._id === id);
                  if (!skill) return null;
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-md text-xs border border-gray-200 dark:border-zinc-700">
                      <Devicon icon={skill.icon} alt={skill.name} className="w-3.5 h-3.5 object-contain" />
                      {skill.name}
                      <button type="button" onClick={() => toggleSkill(id)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <input type="hidden" name="techStack" value={JSON.stringify(selectedSkills)} />
          </div>

          {/* Summary */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Short Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="summary"
              required
              defaultValue={initialData?.summary}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Short hook for the project card"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor 
              content={description} 
              onChange={setDescription} 
              placeholder="Explain what the project is about..."
            />
            <input type="hidden" name="description" value={description} />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              Live Link
            </label>
            <input
              type="text"
              name="liveLink"
              defaultValue={initialData?.liveLink}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FaGithub className="w-4 h-4 text-gray-500" />
              GitHub Link
            </label>
            <input
              type="text"
              name="githubLink"
              defaultValue={initialData?.githubLink}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="https://github.com/..."
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              defaultChecked={initialData?.featured}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
            />
            <label htmlFor="featured" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              Show on Homepage (Featured)
            </label>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isPending || isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isUploading ? 'Uploading Image...' : isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
          <Link
            href="/admin"
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
