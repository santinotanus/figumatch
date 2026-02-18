"use client";

import { MI_USUARIO } from "@/lib/mockData";

interface StatsBarProps {
    totalMatches: number;
}

export default function StatsBar({ totalMatches }: StatsBarProps) {
    const misRepetidas = [...new Set(MI_USUARIO.repetidas)].length;
    const misFaltantes = MI_USUARIO.faltantes.length;

    return (
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-4 mb-4 shadow-md shadow-sky-200">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sky-100 text-xs font-medium">Hola,</p>
                    <h2 className="text-white font-black text-lg leading-tight">
                        {MI_USUARIO.nombre} 👋
                    </h2>
                </div>
                {/* Trofeo dorado */}
                <div className="bg-amber-400 rounded-xl px-3 py-1.5 text-center shadow-sm">
                    <div className="text-amber-900 font-black text-xl leading-none">{totalMatches}</div>
                    <div className="text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                        usuarios
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <div className="text-white font-black text-lg leading-none">{misRepetidas}</div>
                    <div className="text-sky-100 text-[10px] font-medium mt-0.5">Mis repetidas</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <div className="text-white font-black text-lg leading-none">{misFaltantes}</div>
                    <div className="text-sky-100 text-[10px] font-medium mt-0.5">Me faltan</div>
                </div>
            </div>
        </div>
    );
}
