import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 to-gray-800 p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Resumind</p>
        <h1 className="mt-3 text-3xl font-black bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Resume Analyzer
        </h1>
        <p className="mt-3 text-sm text-gray-300">Sign in or create an account to analyze your resume.</p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600"
          >
            Go to Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-purple-500/60 px-4 py-2.5 text-sm font-semibold text-purple-200 transition-all hover:bg-purple-950/30"
          >
            Go to Sign up
          </Link>
        </div>
      </div>
    </main>
    
  );
}
