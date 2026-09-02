'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { changePassword, ChangePasswordState } from './actions';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ChangePasswordState | null, FormData>(
    changePassword,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track the latest processed timestamp to prevent duplicate notifications
  const lastProcessedRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!state) return;

    if (state.success && state.timestamp !== lastProcessedRef.current) {
      lastProcessedRef.current = state.timestamp;
      toast.success('Password updated successfully');
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          Security Settings
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your account credentials and password.
        </p>
      </div>

      {/* Success Notification Banner */}
      {state?.success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Your password has been changed successfully.</p>
        </div>
      )}

      {/* Error Notification Banner */}
      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-4 text-gray-900 dark:text-white">
          <Lock className="w-5 h-5 text-gray-400" />
          Change Password
        </h2>

        <form ref={formRef} action={formAction} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label 
              htmlFor="currentPassword" 
              className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-200"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isPending}
                placeholder="Enter your current password"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label 
              htmlFor="newPassword" 
              className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-200"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                placeholder="Enter new password (min. 8 characters)"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters and different from your current password.
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-200"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                placeholder="Confirm your new password"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 min-w-[180px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
