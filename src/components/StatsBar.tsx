"use client";

interface StatsBarProps {
    nombre: string;
    repetidas: number;
    faltantes: number;
    totalMatches: number;
}

export default function StatsBar({ nombre, repetidas, faltantes, totalMatches }: StatsBarProps) {
    return (
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-4 mb-4 shadow-md shadow-sky-200">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sky-100 text-xs font-medium">Hola,</p>
                    <h2 className="text-white font-black text-lg leading-tight">
                        {nombre} 👋
                    </h2>
                </div>
                <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                    <div className="text-white font-black text-lg leading-none">{totalMatches}</div>
                    <div className="text-sky-100 text-[10px] font-medium mt-0.5">Matches</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <div className="text-white font-black text-lg leading-none">{repetidas}</div>
                    <div className="text-sky-100 text-[10px] font-medium mt-0.5">Mis repetidas</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <div className="text-white font-black text-lg leading-none">{faltantes}</div>
                    <div className="text-sky-100 text-[10px] font-medium mt-0.5">Me faltan</div>
                </div>
            </div>
        </div>
    );
}
