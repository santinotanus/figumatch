"use client";

import Link from "next/link";
import Image from "next/image";
import { MI_USUARIO } from "@/lib/mockData";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm lg:hidden">
            <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                {/* Official logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="FiguMatch"
                        width={180}
                        height={60}
                        className="h-11 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button>

                    <Link href="/perfil">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            {MI_USUARIO.avatar}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
