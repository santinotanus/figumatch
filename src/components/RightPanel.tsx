"use client";

import { MI_USUARIO, TODAS_LAS_FIGURITAS } from "@/lib/mockData";

const TOTAL_FIGURITAS = 980;

export default function RightPanel() {
    const misRepetidas = [...new Set(MI_USUARIO.repetidas)];
    const misFaltantes = MI_USUARIO.faltantes;
    const tengo = TOTAL_FIGURITAS - misFaltantes.length;
    const progreso = Math.round((tengo / TOTAL_FIGURITAS) * 100);

    return (
        <aside className="hidden xl:flex flex-col w-72 fixed top-0 right-0 h-screen bg-white border-l border-gray-100 z-40 px-4 py-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-1">Mi álbum</h2>
                <p className="text-xs text-gray-400">Resumen de tu colección</p>
            </div>

            {/* Progress */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-4 mb-5 shadow-md shadow-sky-100">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sky-100 text-xs font-medium">Completado</p>
                        <p className="text-white font-black text-3xl leading-none">{progreso}%</p>
                    </div>
                    <div className="text-4xl">🏆</div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                        className="bg-amber-400 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${progreso}%` }}
                    />
                </div>
                <p className="text-sky-100 text-xs">
                    {tengo} de {TOTAL_FIGURITAS} figuritas
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                    <p className="text-sky-600 font-black text-xl leading-none">{misRepetidas.length}</p>
                    <p className="text-sky-500 text-[11px] font-medium mt-1">Repetidas</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <p className="text-amber-600 font-black text-xl leading-none">{misFaltantes.length}</p>
                    <p className="text-amber-500 text-[11px] font-medium mt-1">Me faltan</p>
                </div>
            </div>

            {/* Mis repetidas */}
            <div>
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide mb-3">
                    Mis repetidas ({misRepetidas.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {misRepetidas.map((id) => {
                        const fig = TODAS_LAS_FIGURITAS.find((f) => f.id === id);
                        if (!fig) return null;
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center px-2 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-[11px] font-bold"
                            >
                                #{fig.numero}
                            </span>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
