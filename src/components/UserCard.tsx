"use client";

import Link from "next/link";
import { Figurita, Match } from "@/types";

interface UserCardProps {
    match: Match;
}

const TIPO_COLORS: Record<string, string> = {
    jugador: "bg-sky-100 text-sky-700 border-sky-200",
    escudo: "bg-amber-100 text-amber-700 border-amber-200",
    estadio: "bg-purple-100 text-purple-700 border-purple-200",
    especial: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function FiguriteChip({ figurita }: { figurita: Figurita }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${TIPO_COLORS[figurita.tipo]}`}
        >
            #{figurita.numero}
        </span>
    );
}

// Checkmark SVG de verificación azul (estilo Twitter/Instagram)
function PremiumCheckmark() {
    return (
        <svg
            className="w-4 h-4 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-label="Cuenta premium"
        >
            <circle cx="12" cy="12" r="12" fill="#3B82F6" />
            <path
                d="M7 12.5l3.5 3.5 6.5-7"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function UserCard({ match }: UserCardProps) {
    const { usuario, figuritasEnComun } = match;
    const matchCount = figuritasEnComun.length;
    const visibleChips = figuritasEnComun.slice(0, 4);
    const remaining = figuritasEnComun.length - visibleChips.length;
    const isPremium = usuario.premium === true;

    return (
        <div
            className={`
                relative rounded-2xl p-4 transition-all duration-200 active:scale-[0.99]
                ${isPremium
                    ? "bg-white shadow-[0_0_0_2px_#F59E0B,0_4px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_0_0_2px_#F59E0B,0_6px_32px_rgba(251,191,36,0.5)]"
                    : "bg-white shadow-sm border border-gray-100 hover:shadow-md"
                }
            `}
            style={isPremium ? { animation: "premium-glow 3s ease-in-out infinite" } : undefined}
        >


            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`
                        relative w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm
                        ${isPremium
                            ? "bg-gradient-to-br from-amber-400 to-yellow-500 ring-2 ring-amber-300"
                            : "bg-gradient-to-br from-sky-400 to-sky-600"
                        }
                    `}>
                        {usuario.avatar}
                        {/* Premium crown on avatar */}
                        {isPremium && (
                            <span className="absolute -top-2 -right-1 text-[13px] leading-none select-none">👑</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900 text-base leading-tight">
                                {usuario.nombre}
                            </h3>
                            {isPremium && <PremiumCheckmark />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs text-gray-500">{usuario.ciudad}</span>
                        </div>
                    </div>
                </div>

                {/* Match Badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-xl px-3 py-1.5 text-center shadow-sm">
                        <div className="text-lg font-black leading-none text-amber-900">{matchCount}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wide text-amber-800 opacity-90">
                            {matchCount === 1 ? "match" : "matches"}
                        </div>
                    </div>
                    {isPremium && (
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ⭐ Premium
                        </span>
                    )}
                </div>
            </div>

            {/* Match description */}
            <p className="text-xs text-gray-500 mb-3 font-medium">
                ⚽ Tenés{" "}
                <span className="text-sky-600 font-bold">
                    {matchCount} {matchCount === 1 ? "figurita" : "figuritas"}
                </span>{" "}
                que estoy buscando
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {visibleChips.map((fig) => (
                    <FiguriteChip key={fig.id} figurita={fig} />
                ))}
                {remaining > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        +{remaining} más
                    </span>
                )}
            </div>

            {/* Action Button */}
            <Link href={`/usuario/${usuario.id}`} className="block">
                <button className={`
                    w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-white
                    ${isPremium
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
                    }
                `}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Hacer oferta
                </button>
            </Link>

            {/* Glow keyframe */}
            <style>{`
                @keyframes premium-glow {
                    0%, 100% {
                        box-shadow: 0 0 0 2px #F59E0B, 0 4px 24px rgba(251,191,36,0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 2px #FBBF24, 0 4px 32px rgba(251,191,36,0.6), 0 0 0 4px rgba(251,191,36,0.15);
                    }
                }
            `}</style>
        </div>
    );
}
