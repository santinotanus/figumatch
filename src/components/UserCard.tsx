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

export default function UserCard({ match }: UserCardProps) {
    const { usuario, figuritasEnComun } = match;
    const matchCount = figuritasEnComun.length;
    const visibleChips = figuritasEnComun.slice(0, 4);
    const remaining = figuritasEnComun.length - visibleChips.length;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 active:scale-[0.99]">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {usuario.avatar}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                            {usuario.nombre}
                        </h3>
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

                {/* Match Badge — dorado como el trofeo */}
                <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-xl px-3 py-1.5 text-center shadow-sm">
                        <div className="text-lg font-black leading-none text-amber-900">{matchCount}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wide text-amber-800 opacity-90">
                            {matchCount === 1 ? "match" : "matches"}
                        </div>
                    </div>
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
                <button className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Hacer oferta
                </button>
            </Link>
        </div>
    );
}
