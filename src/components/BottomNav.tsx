"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOfertasPendientes } from "@/lib/useOfertasPendientes";

const NAV_ITEMS = [
    {
        href: "/feed",
        label: "Matches",
        icon: () => (
            // Users/Matches icon
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
    },
    {
        href: "/mis-figuritas",
        label: "Mi Álbum",
        icon: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        href: "/ofertas",
        label: "Ofertas",
        icon: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
    },
    {
        href: "/perfil",
        label: "Perfil",
        icon: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();
    const pendingCount = useOfertasPendientes();

    return (
        <nav className="
            fixed bottom-0 left-0 right-0 z-50
            bg-white/95 backdrop-blur-md
            border-t border-gray-100
            shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
            lg:hidden
            safe-area-bottom
        ">
            {/* Safe area spacer for iOS home indicator */}
            <div className="flex items-stretch h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const isOfertas = item.href === "/ofertas";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
                        >
                            {/* Active indicator pill */}
                            {isActive && (
                                <span className="absolute top-2 w-8 h-1 bg-sky-500 rounded-full" />
                            )}

                            {/* Icon + badge */}
                            <div className="relative mt-1">
                                <span className={`transition-colors duration-150 ${isActive ? "text-sky-500" : "text-gray-400 group-hover:text-gray-600"
                                    }`}>
                                    {item.icon()}
                                </span>

                                {/* Notification badge */}
                                {isOfertas && pendingCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 border border-white">
                                        {pendingCount > 9 ? "9+" : pendingCount}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-bold transition-colors duration-150 ${isActive ? "text-sky-500" : "text-gray-400 group-hover:text-gray-600"
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* iOS safe area padding */}
            <div className="h-safe-bottom bg-white" />
        </nav>
    );
}
