"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MI_USUARIO } from "@/lib/mockData";
import { getOfertas } from "@/lib/ofertasStore";

const NAV_ITEMS = [
    {
        href: "/",
        label: "Tu feed",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: "/mis-figuritas",
        label: "Mi Álbum",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        href: "/ofertas",
        label: "Mis ofertas",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
    },
    {
        href: "/perfil",
        label: "Mi perfil",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const pendingCount = getOfertas().filter(o => o.estado === "pendiente_yo").length;

    return (
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-40 px-4 py-6">
            {/* Logo */}
            <Link href="/" className="flex items-center mb-8 px-2">
                <Image
                    src="/logo.png"
                    alt="FiguMatch"
                    width={200}
                    height={70}
                    className="h-12 w-auto object-contain"
                    priority
                />
            </Link>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const isOfertas = item.href === "/ofertas";
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${isActive
                                    ? "bg-sky-50 text-sky-700 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <span className={isActive ? "text-sky-500" : "text-gray-400"}>
                                {item.icon}
                            </span>
                            {item.label}
                            <span className="ml-auto flex items-center gap-1.5">
                                {isOfertas && pendingCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                        {pendingCount}
                                    </span>
                                )}
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                )}
                            </span>
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
