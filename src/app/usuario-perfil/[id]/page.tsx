"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";

const TOTAL_FIGURITAS = 981; // 00 al 980

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => {
                const fill = Math.min(1, Math.max(0, value - (star - 1)));
                return (
                    <div key={star} className="relative w-5 h-5">
                        <svg className="w-5 h-5 text-gray-200 absolute inset-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Sticker chip ─────────────────────────────────────────────────────────────
function StickerChip({ num, variant }: { num: string; variant: "blue" | "amber" }) {
    const isEspecial = isNaN(Number(num));
    const colors = variant === "blue"
        ? "bg-sky-50 border-sky-200 text-sky-700"
        : "bg-amber-50 border-amber-200 text-amber-700";
    return (
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${colors}`}>
            {isEspecial && <span className="text-[9px]">⭐</span>}
            #{num}
        </span>
    );
}

// ─── Tipo usuario ─────────────────────────────────────────────────────────────
interface UsuarioPerfil {
    _id: string;
    nombre: string;
    email: string;
    ciudad: string;
    avatar: string;
    foto: string;
    premium: boolean;
    repetidas: string[];
    faltantes: string[];
    zonas: string[];
    reputacion: number;
    cambiosHechos: number;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UsuarioPerfilPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/usuarios/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) { setUsuario(null); }
                else { setUsuario(data); }
            })
            .catch(() => setUsuario(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-medium">Cargando perfil…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-gray-500 font-semibold">Usuario no encontrado</p>
                    <button onClick={() => router.back()} className="mt-4 text-sky-500 font-bold text-sm">← Volver</button>
                </div>
            </div>
        );
    }

    const rep = usuario.reputacion ?? 0;
    const cambios = usuario.cambiosHechos ?? 0;
    const zonas = usuario.zonas ?? [];
    const repetidas = [...new Set(usuario.repetidas ?? [])];
    const faltantes = usuario.faltantes ?? [];
    const tengo = TOTAL_FIGURITAS - faltantes.length;
    const progreso = Math.round((tengo / TOTAL_FIGURITAS) * 100);
    const isPremium = usuario.premium === true;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="px-4 pt-20 pb-24 lg:ml-64 lg:pt-8 lg:px-8 lg:pb-8 xl:mr-72">
                <div className="max-w-lg mx-auto lg:max-w-xl lg:mx-auto">

                    {/* Back */}
                    <button onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm mb-4 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>

                    {/* ── Hero ── */}
                    <div className={`rounded-3xl p-6 mb-5 relative overflow-hidden ${isPremium
                        ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md shadow-amber-200"
                        : "bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 shadow-xl shadow-sky-200"}`}>
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
                        {isPremium && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-white/60 via-yellow-200/80 to-white/60" />}

                        <div className="relative flex items-center gap-5">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className={`w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ${isPremium ? "ring-white/50" : "ring-white/30"}`}>
                                    {usuario.foto ? (
                                        <Image src={usuario.foto} alt={usuario.nombre} width={80} height={80} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${isPremium ? "bg-gradient-to-br from-yellow-200 to-amber-300" : "bg-gradient-to-br from-sky-300 to-sky-500"}`}>
                                            <span className={`font-black text-2xl ${isPremium ? "text-amber-900" : "text-white"}`}>
                                                {usuario.avatar || usuario.nombre.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isPremium && <span className="absolute -top-2.5 -right-1.5 text-[18px] leading-none select-none">👑</span>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className={`font-black text-xl leading-tight truncate ${isPremium ? "text-amber-900" : "text-white"}`}>
                                        {usuario.nombre}
                                    </h1>
                                    {isPremium && (
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="12" fill="#3B82F6" />
                                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                {isPremium && (
                                    <div className="inline-flex items-center gap-1 bg-white/30 rounded-full px-2.5 py-0.5 mb-2">
                                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide">⭐ Cuenta Premium</span>
                                    </div>
                                )}
                                {usuario.ciudad && (
                                    <div className="flex items-center gap-1 mb-3">
                                        <svg className={`w-3.5 h-3.5 ${isPremium ? "text-amber-700" : "text-sky-200"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className={`text-sm ${isPremium ? "text-amber-800" : "text-sky-100"}`}>{usuario.ciudad}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                                        <div className={`font-black text-lg leading-none ${isPremium ? "text-amber-900" : "text-white"}`}>{cambios}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${isPremium ? "text-amber-700" : "text-sky-100"}`}>cambios</div>
                                    </div>
                                    <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                                        <div className={`font-black text-lg leading-none ${isPremium ? "text-amber-900" : "text-amber-300"}`}>{rep.toFixed(1)}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${isPremium ? "text-amber-700" : "text-sky-100"}`}>reputación</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Reputación ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center"><span className="text-sm">⭐</span></div>
                            <h2 className="font-black text-gray-900 text-sm">Reputación</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center flex-shrink-0">
                                <div className="text-4xl font-black text-gray-900 leading-none">{rep.toFixed(1)}</div>
                                <div className="text-xs text-gray-400 mt-1">de 5.0</div>
                            </div>
                            <div className="flex-1">
                                <StarRating value={rep} />
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    Basado en <strong className="text-gray-700">{cambios}</strong> intercambio{cambios !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Álbum ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center"><span className="text-sm">📖</span></div>
                            <h2 className="font-black text-gray-900 text-sm">Su álbum</h2>
                        </div>
                        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sky-100 text-xs font-medium">Completado</span>
                                <span className="text-white font-black text-lg leading-none">{progreso}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                                <div className="bg-amber-400 rounded-full h-1.5 transition-all" style={{ width: `${progreso}%` }} />
                            </div>
                            <p className="text-sky-100 text-xs mt-1">{tengo} de {TOTAL_FIGURITAS} figuritas</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                                <div className="text-sky-600 font-black text-xl">{repetidas.length}</div>
                                <div className="text-sky-500 text-[11px] font-medium mt-0.5">Repetidas</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                                <div className="text-amber-600 font-black text-xl">{faltantes.length}</div>
                                <div className="text-amber-500 text-[11px] font-medium mt-0.5">Le faltan</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Zonas ── */}
                    {zonas.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><span className="text-sm">📍</span></div>
                                <h2 className="font-black text-gray-900 text-sm">Zonas de encuentro</h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                {zonas.map((zona, i) => (
                                    <div key={zona} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-[9px] font-black">{i + 1}</span>
                                        </div>
                                        <span className="font-bold text-emerald-800 text-sm">{zona}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Repetidas ── */}
                    {repetidas.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center"><span className="text-sm">🔵</span></div>
                                <h2 className="font-black text-gray-900 text-sm">Repetidas <span className="text-gray-400 font-semibold">({repetidas.length})</span></h2>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {repetidas.sort((a, b) => Number(a) - Number(b)).map(n => (
                                    <StickerChip key={n} num={n} variant="blue" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Le faltan ── */}
                    {faltantes.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center"><span className="text-sm">🟡</span></div>
                                <h2 className="font-black text-gray-900 text-sm">Le faltan <span className="text-gray-400 font-semibold">({faltantes.length})</span></h2>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {faltantes.sort((a, b) => Number(a) - Number(b)).map(n => (
                                    <StickerChip key={n} num={n} variant="amber" />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
