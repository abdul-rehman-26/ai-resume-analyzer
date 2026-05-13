"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            await fetch("/api/logout", { method: "POST" });
        } finally {
            router.push("/signin");
            router.refresh();
            setIsLoggingOut(false);
        }
    }

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
                            RESUMIND
                        </h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/upload"
                            className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                        >
                            Upload Resume
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="px-6 py-2 border border-gray-500 text-gray-200 rounded-full font-semibold hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
