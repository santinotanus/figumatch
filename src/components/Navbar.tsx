"use client";

import Link from "next/link";
import Image from "next/image";
import { MI_USUARIO } from "@/lib/mockData";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm lg:hidden">
            <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                {/* Text Logo for Mobile - Cleaner than image on small screens */}
                <Link href="/feed" className="flex items-center mx-auto py-2">
                    <div className="flex items-center select-none">
                        <span className="text-3xl font-black text-sky-400 drop-shadow-[0_2px_0_rgba(15,23,42,1)] tracking-tight">Figu</span>
                        <span className="text-3xl font-black text-yellow-400 drop-shadow-[0_2px_0_rgba(15,23,42,1)] tracking-tight">Match</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
