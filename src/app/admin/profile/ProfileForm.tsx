'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, checkUsernameAvailability } from './actions';
import { 
  User, 
  Briefcase, 
  FileText, 
  Globe, 
  Save, 
  Loader2, 
  AlertCircle,
  Image as ImageIcon,
  FileDown,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { cn, isPdf } from '@/lib/utils';
import { uploadDirectToMediaProvider } from '@/lib/domains/media/client';
import { toast } from 'sonner';

interface InitialProfileData {
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

interface ProfileUserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface ProfileFormProps {
  initialData: InitialProfileData | null;
  userData: ProfileUserData;
}

const initialState: { success?: boolean; error?: string } = {};

export default function ProfileForm({ initialData, userData }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  
  const [resumePreview, setResumePreview] = useState<string>(initialData?.resumeUrl || '');
  const [resumeUrl, setResumeUrl] = useState<string>(initialData?.resumeUrl || '');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);

  const [username, setUsername] = useState(userData?.username || '');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Debounced username check
  useEffect(() => {
    const checkAvailability = async () => {
      if (username === userData?.username) {
        setIsUsernameAvailable(true);
        return;
      }
      if (username.length < 3) {
        setIsUsernameAvailable(null);
        return;
      }
      setIsCheckingUsername(true);
      const result = await checkUsernameAvailability(username);
      setIsUsernameAvailable(result.available);
      setIsCheckingUsername(false);
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, userData?.username]);

  useEffect(() => {
    if (state?.success) {
      toast.success('Profile updated successfully!');
      router.refresh();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selected file must be an image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsUploadingImage(true);

    try {
      const result = await uploadDirectToMediaProvider(file, 'profile-avatar');
      setImageUrl(result.secureUrl);
      toast.success('Profile image uploaded successfully');
    } catch (err: unknown) {
      console.error('Avatar direct upload failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to upload profile image';
      toast.error(message);
      setImagePreview(initialData?.image || '');
      setImageUrl(initialData?.image || '');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageUrl('');
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume file size must be less than 5MB');
      return;
    }

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const lowerFileName = file.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some(ext => lowerFileName.endsWith(ext));

    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!isAllowedExt && !allowedMimeTypes.includes(file.type)) {
      toast.error('Resume must be a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    setResumeFileName(file.name);
    setIsUploadingResume(true);
    // Show immediate progress preview
    setResumePreview('uploading');

    try {
      const result = await uploadDirectToMediaProvider(file, 'resume');
      setResumeUrl(result.secureUrl);
      setResumePreview(result.secureUrl);
      toast.success('Resume uploaded successfully');
    } catch (err: unknown) {
      console.error('Resume direct upload failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to upload resume document';
      toast.error(message);
      setResumeUrl(initialData?.resumeUrl || '');
      setResumePreview(initialData?.resumeUrl || '');
      setResumeFileName('');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const clearResume = () => {
    setResumePreview('');
    setResumeUrl('');
    setResumeFileName('');
  };

  const handleDownload = async () => {
    if (!resumePreview || !resumePreview.startsWith('http')) return;
    
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(resumePreview)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const isPdfFile = isPdf(resumePreview);
      const fileName = `Harish_Ghorui_Resume${isPdfFile ? '.pdf' : '.docx'}`;
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      const proxyUrl = `/api/download?url=${encodeURIComponent(resumePreview)}`;
      window.location.assign(proxyUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-8 h-8 text-blue-600" />
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your public profile information and social links.
        </p>
      </div>

      {!initialData && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Let&apos;s set up your profile to get started!</p>
        </div>

      )}

      <form action={formAction} className="space-y-8">
        {/* User Account Info */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <User className="w-5 h-4 text-gray-400" />
            Account Information
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Upload */}
            <div className="flex-shrink-0">
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                Profile Image
              </label>
              <div className="relative w-40 h-40 group">
                {!imagePreview ? (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer h-full w-full overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage || isUploadingResume}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="mt-1 text-[10px] text-gray-500 text-center px-2">Click to upload</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Local blob: avatar preview and in-flight upload cannot be optimized by next/image */}
                    <img 
                      src={imagePreview} 
                      alt="Profile Preview" 
                      className={cn("w-full h-full object-cover", isUploadingImage && "opacity-50")} 
                      referrerPolicy="no-referrer"
                    />
                    {isUploadingImage ? (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-1">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[9px] font-bold">Uploading...</span>
                      </div>
                    ) : (
                      /* Overlay for Change/Remove */
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative cursor-pointer mb-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-blue-600 px-2 py-1 rounded">Change</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="text-[10px] text-white font-bold uppercase tracking-wider bg-red-600 px-2 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <input type="hidden" name="image" value={imageUrl} />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={userData?.firstName || ''}
                  required
                  pattern=".{2,}"
                  title="Minimum 2 characters"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={userData?.lastName || ''}
                  required
                  pattern=".{2,}"
                  title="Minimum 2 characters"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  Username (Public URL)
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">portfolio-cms.com/</span>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      required
                      pattern="^[a-zA-Z0-9_-]{3,15}$"
                      title="3-15 characters, letters, numbers, underscores and hyphens only"
                      className={cn(
                        "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isUsernameAvailable === false && "border-red-500 focus:ring-red-500",
                        isUsernameAvailable === true && username !== userData?.username && "border-green-500 focus:ring-green-500"
                      )}
                    />
                  </div>
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {isUsernameAvailable === false && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      This username is already taken
                    </p>
                  )}
                  {isUsernameAvailable === true && username !== userData?.username && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Username is available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <Briefcase className="w-5 h-5 text-gray-400" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                defaultValue={initialData?.headline || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Full Stack Developer | Next.js Expert"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Bio
              </label>
              <textarea
                name="bio"
                defaultValue={initialData?.bio || ''}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Tell the world about yourself..."
              />
            </div>

            {/* Resume Upload - Direct Browser Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileDown className="w-4 h-4 text-gray-500" />
                Resume (PDF, Word)
              </label>
              <div className="flex flex-col gap-4">
                {!resumePreview ? (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group h-32">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      disabled={isUploadingResume || isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="mt-2 text-sm text-gray-500 text-center">Click to upload resume (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="relative bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl flex items-center justify-between gap-3 h-24 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {isUploadingResume ? (
                          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                          {isUploadingResume ? (resumeFileName || 'Uploading resume...') : (resumeFileName || 'Resume Uploaded')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isUploadingResume ? 'Uploading directly to Cloudinary...' : 'Stored on Cloud'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {!isUploadingResume && resumePreview.startsWith('http') && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Download
                        </button>
                      )}
                      {!isUploadingResume && (
                        <button
                          type="button"
                          onClick={clearResume}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input type="hidden" name="resumeUrl" value={resumeUrl} />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <Globe className="w-5 h-5 text-gray-400" />
            Social Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FaGithub className="w-4 h-4 text-gray-500" />
                GitHub
              </label>
              <input
                type="text"
                name="github"
                defaultValue={initialData?.socialLinks?.github || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FaLinkedin className="w-4 h-4 text-gray-500" />
                LinkedIn
              </label>
              <input
                type="text"
                name="linkedin"
                defaultValue={initialData?.socialLinks?.linkedin || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FaTwitter className="w-4 h-4 text-gray-500" />
                Twitter
              </label>
              <input
                type="text"
                name="twitter"
                defaultValue={initialData?.socialLinks?.twitter || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Personal Website
              </label>
              <input
                type="text"
                name="website"
                defaultValue={initialData?.socialLinks?.website || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || isUploadingImage || isUploadingResume || isUsernameAvailable === false}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 min-w-[200px]"
          >
            {isPending || isUploadingImage || isUploadingResume ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isUploadingResume ? 'Uploading Resume...' : isUploadingImage ? 'Uploading Image...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
