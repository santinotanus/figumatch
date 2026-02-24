"use client";

import { useEffect, useState } from "react";
import { getOnboardingData } from "@/lib/onboardingStore";

const TOTAL_FIGURITAS = 981; // 00 al 980

export default function RightPanel() {
    const session = getOnboardingData();
    const mongoId = session.mongoId ?? "";

    const [repetidas, setRepetidas] = useState<number[]>([]);
    const [faltantes, setFaltantes] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const cargar = () => {
        if (!mongoId) { setLoading(false); return; }
        fetch(`/api/usuarios/${mongoId}`)
            .then(r => r.json())
            .then(u => {
                setRepetidas((u.repetidas ?? []).map(Number).filter((n: number) => !isNaN(n)));
                setFaltantes((u.faltantes ?? []).map(Number).filter((n: number) => !isNaN(n)));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargar();
        window.addEventListener("album-updated", cargar);
        return () => window.removeEventListener("album-updated", cargar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mongoId]);

    const tengo = TOTAL_FIGURITAS - faltantes.length;
    const progreso = Math.round((tengo / TOTAL_FIGURITAS) * 100);
    const repetidasOrdenadas = [...new Set(repetidas)].sort((a, b) => a - b);

    return (
        <aside className="hidden xl:flex flex-col w-72 fixed top-0 right-0 h-screen bg-white border-l border-gray-100 z-40 px-4 py-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-1">Mi álbum</h2>
                <p className="text-xs text-gray-400">Resumen de tu colección</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <svg className="w-6 h-6 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            ) : (
                <>
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
                            <p className="text-sky-600 font-black text-xl leading-none">{repetidasOrdenadas.length}</p>
                            <p className="text-sky-500 text-[11px] font-medium mt-1">Repetidas</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                            <p className="text-amber-600 font-black text-xl leading-none">{faltantes.length}</p>
                            <p className="text-amber-500 text-[11px] font-medium mt-1">Me faltan</p>
                        </div>
                    </div>

                    {/* Mis repetidas */}
                    {repetidasOrdenadas.length > 0 ? (
                        <div>
                            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide mb-3">
                                Mis repetidas ({repetidasOrdenadas.length})
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {repetidasOrdenadas.map(n => (
                                    <span key={n}
                                        className="inline-flex items-center px-2 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-[11px] font-bold">
                                        #{String(n).padStart(2, "0")}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-400 font-medium">Todavía no tenés repetidas</p>
                            <p className="text-xs text-gray-300 mt-1">Agregá figuritas en Mi Álbum</p>
                        </div>
                    )}
                </>
            )}
        </aside>
    );
}
