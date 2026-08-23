'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { saveSkill, deleteSkill, saveSkillCategory, deleteSkillCategory } from './actions';
import { Plus, Trash2, Tag, Loader2, AlertCircle, Pencil, X, Brain, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Devicon } from '@/components/ui/Devicon';

interface Category {
  _id: string;
  name: string;
}

interface Skill {
  _id: string;
  name: string;
  category: Category;
  icon: string;
}

interface DeviconItem {
  name: string;
  versions: {
    svg?: string[];
    font?: string[];
  };
}

interface SkillManagerProps {
  initialSkills: Skill[];
  initialCategories: Category[];
}

export default function SkillManager({ initialSkills, initialCategories }: SkillManagerProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [categories, setCategories] = useState(initialCategories);
  
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [devicons, setDevicons] = useState<DeviconItem[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isColored, setIsColored] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const skillFormRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch Devicons
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/devicons/devicon/master/devicon.json');
        const data = await response.json();
        setDevicons(data);
      } catch (error) {
        console.error('Failed to fetch devicons:', error);
      }
    };
    fetchIcons();
  }, []);

  // Filter icons based on search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredIcons([]);
      return;
    }

    const results: string[] = [];
    devicons.forEach(icon => {
      if (icon.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        const versions = (icon.versions.svg && icon.versions.svg.length > 0)
          ? icon.versions.svg
          : (icon.versions.font || ['original']);
        versions.forEach(version => {
          results.push(`devicon-${icon.name}-${version}`);
        });
      }
    });
    setFilteredIcons(results.slice(0, 10));
  }, [searchQuery, devicons]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Skill Category Action
  const [catState, catAction, catPending] = useActionState(
    saveSkillCategory,
    { success: false, category: null, error: undefined }
  );

  // Skill Action
  const [skillState, skillAction, skillPending] = useActionState(
    saveSkill,
    { success: false, skill: null, error: undefined }
  );

  const lastProcessedCatStateRef = useRef(catState);
  const lastProcessedSkillStateRef = useRef(skillState);

  // Handle Category updates
  useEffect(() => {
    if (catState !== lastProcessedCatStateRef.current) {
      lastProcessedCatStateRef.current = catState;
      
      if (catState.success && catState.category) {
        const updatedCat = catState.category;
        const isEdit = categories.some(c => c._id === updatedCat._id);
        
        toast.success(isEdit ? 'Category updated' : 'Category added');

        setCategories(prev => {
          if (isEdit) return prev.map(c => c._id === updatedCat._id ? updatedCat : c);
          return [...prev, updatedCat];
        });
        
        setEditingCategory(null);
        categoryFormRef.current?.reset();
      }
      if (catState.error) {
        toast.error(catState.error);
      }
    }
  }, [catState, categories]);

  // Handle Skill updates
  useEffect(() => {
    if (skillState !== lastProcessedSkillStateRef.current) {
      lastProcessedSkillStateRef.current = skillState;
      
      if (skillState.success && skillState.skill) {
        const updatedSkill = skillState.skill;
        const isEdit = skills.some(s => s._id === updatedSkill._id);

        toast.success(isEdit ? 'Skill updated' : 'Skill added');

        setSkills(prev => {
          if (isEdit) return prev.map(s => s._id === updatedSkill._id ? updatedSkill : s);
          return [...prev, updatedSkill];
        });

        setEditingSkill(null);
        setSelectedIcon('');
        setSearchQuery('');
        skillFormRef.current?.reset();
      }
      if (skillState.error) {
        toast.error(skillState.error);
      }
    }
  }, [skillState, skills]);

  const startEditingSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSelectedIcon(skill.icon.replace(' colored', ''));
    setIsColored(skill.icon.includes('colored'));
    setSearchQuery('');
    // Reset state to avoid showing success from previous actions
    if (skillState) {
      skillState.error = null;
      skillState.success = false;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await deleteSkillCategory(id);
    if (result.success) {
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Category deleted');
    } else {
      toast.error(result.error || 'Failed to delete category');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const result = await deleteSkill(id);
    if (result.success) {
      setSkills(skills.filter(s => s._id !== id));
      toast.success('Skill deleted');
    } else {
      toast.error(result.error || 'Failed to delete skill');
    }
  };

  const finalIconClass = selectedIcon ? `${selectedIcon}${isColored ? ' colored' : ''}` : '';

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Manage Skills & Categories
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Organize your technical expertise with Devicon integration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* CATEGORIES SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Categories</h2>
          </div>

          <form ref={categoryFormRef} action={catAction} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              {editingCategory && (
                <button type="button" onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {catState?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <p>{catState.error}</p>
              </div>
            )}

            {editingCategory && <input type="hidden" name="id" value={editingCategory._id} />}

            <div className="flex gap-2">
              <input
                key={editingCategory?._id || 'new-cat'}
                type="text"
                name="name"
                defaultValue={editingCategory?.name || ''}
                required
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="e.g. Frontend"
              />
              <button
                type="submit"
                disabled={catPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                {catPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCategory ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {categories.map(cat => (
                  <tr key={cat._id} className={editingCategory?._id === cat._id ? "bg-blue-50 dark:bg-blue-900/10" : ""}>
                    <td className="px-6 py-3 font-medium">{cat.name}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => setEditingCategory(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <ConfirmDialog
                        trigger={
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        }
                        title="Delete Category?"
                        description="Categories with skills cannot be deleted. This action cannot be undone."
                        onConfirm={() => handleDeleteCategory(cat._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Skills</h2>
          </div>

          <form ref={skillFormRef} action={skillAction} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              {editingSkill && (
                <button type="button" onClick={() => {
                  setEditingSkill(null);
                  setSelectedIcon('');
                  setSearchQuery('');
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {skillState?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <p>{skillState.error}</p>
              </div>
            )}

            {editingSkill && <input type="hidden" name="id" value={editingSkill._id} />}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Skill Name</label>
                <input
                  key={editingSkill?._id || 'new-skill-name'}
                  type="text"
                  name="name"
                  defaultValue={editingSkill?.name || ''}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g. React"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                <select
                  key={editingSkill?._id || 'new-skill-cat'}
                  name="category"
                  defaultValue={editingSkill?.category?._id || ''}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Icon Search */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Search Icon</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    placeholder="Search Devicon (e.g. react, node)"
                  />
                  
                  {showSuggestions && filteredIcons.length > 0 && (
                    <div ref={suggestionsRef} className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredIcons.map((iconClass) => (
                        <button
                          key={iconClass}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(iconClass);
                            setShowSuggestions(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <Devicon icon={iconClass} className="w-5 h-5 object-contain" />
                            <span className="text-sm font-medium">{iconClass}</span>
                          </div>
                          {selectedIcon === iconClass && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Box */}
                <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 p-2">
                  {selectedIcon ? (
                    <Devicon icon={finalIconClass} className="w-8 h-8 object-contain transition-all" />
                  ) : (
                    <span className="text-[10px] text-gray-400 text-center px-1 leading-tight">No Icon</span>
                  )}
                </div>
              </div>

              {selectedIcon && (
                <div className="flex items-center gap-2 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isColored} 
                      onChange={(e) => setIsColored(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase">Use Colored Version</span>
                  </label>
                </div>
              )}
              
              <input type="hidden" name="icon" value={finalIconClass} />
            </div>

            <button
              type="submit"
              disabled={skillPending || !selectedIcon}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            >
              {skillPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSkill ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </button>
          </form>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Skill</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {skills.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500">No skills added yet.</td></tr>
                ) : (
                  skills.map(skill => (
                    <tr key={skill._id} className={editingSkill?._id === skill._id ? "bg-blue-50 dark:bg-blue-900/10" : ""}>
                      <td className="px-6 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-50 dark:bg-zinc-800 p-1 flex items-center justify-center border border-gray-100 dark:border-zinc-700">
                            <Devicon icon={skill.icon} alt={skill.name} className="w-6 h-6 object-contain" />
                          </div>
                          {skill.name}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[11px] font-semibold">
                          {skill.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button onClick={() => startEditingSkill(skill)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <ConfirmDialog
                          trigger={
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          }
                          title="Delete Skill?"
                          description={`Are you sure you want to delete "${skill.name}"? This action cannot be undone.`}
                          onConfirm={() => handleDeleteSkill(skill._id)}
                        />
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
