"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/upload";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
    };

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Unable to sign in.");
        return;
      }

      setSuccessMessage(data?.message || "Signin successful.");
      form.reset();
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 to-gray-800 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Resumind</p>
        <h1 className="mt-2 text-3xl font-black bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Sign in</h1>
        <p className="mt-1 text-sm text-gray-300">Welcome back. Enter your details.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none ring-0 placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none ring-0 placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {error ? (
            <p className="rounded-md border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-md border border-emerald-500/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
              {successMessage}
            </p>
          ) : null}
        </form>

        <p className="mt-4 text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-purple-300 hover:text-purple-200 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
