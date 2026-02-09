import React from "react";
import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
      
      <div className="w-full max-w-md border border-white/10 rounded-[40px] p-10 bg-slate-900/40">

        <h2 className="text-3xl font-black text-center mb-2">Welcome Back</h2>

        <p className="text-slate-400 text-center mb-8 text-sm">
          Continue engineering ATS-proof resumes
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Email
            </label>
            <input
              className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-white/10"
              placeholder="you@mail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-white/10"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm">
            Enter ATSense
          </button>
        </form>

        <div className="mt-6 text-center text-slate-500 text-xs">
          Don’t have an account?{" "}
          <Link href="/editor" className="text-blue-400">
            Create Resume First
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-600 text-xs">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
