"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("author@example.com");
  const [password, setPassword] = useState("dev-only-placeholder");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
        const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        });


      const data = await res.json();

      if (!res.ok || !data?.success) {
        const message =
          data?.error ||
          data?.message ||
          "Login failed. Please check your credentials.";
        setError(message);
        setIsSubmitting(false);
        return;
      }

      // At this point, the backend should have set the auth cookie.
      // We will manage user info more formally later; for now just route.
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Unexpected error logging in. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">StoryForge Login</h1>
      <p className="text-sm text-slate-400 mb-4">
        Use your seeded dev user credentials.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}