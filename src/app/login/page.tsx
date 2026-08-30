"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          toast.error("Invalid email or password");
        } else {
          toast.success("Welcome back!");
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Account created successfully! Please sign in.");
          setIsLogin(true);
          // Optional: Clear sensitive fields but keep email for convenience
          setFormData(prev => ({
            ...prev,
            password: "",
            username: "",
            firstName: "",
            lastName: ""
          }));
        } else {
          toast.error(data.error || "Registration failed. Please try again.");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-8">
            <Image
              src="/branding/logo-full.png"
              alt="Modulab"
              width={200}
              height={56}
              className="h-10 w-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {isLogin ? "Sign in to account" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Welcome back! Please enter your details." : "Join us to manage your portfolio easily."}
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      name="firstName"
                      type="text"
                      required={!isLogin}
                      className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="relative">
                    <input
                      name="lastName"
                      type="text"
                      required={!isLogin}
                      className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isLogin ? "Sign in" : "Create account"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
