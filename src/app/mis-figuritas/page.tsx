"use client";

import { useState, useEffect, useCallback } from "react";
import { getOnboardingData, completeOnboarding } from "@/lib/onboardingStore";
import Navbar from "@/components/Navbar";

const MIN_NUM = 0;
const MAX_NUM = 980;

// ─── Add sticker modal ────────────────────────────────────────────────────────
function AddModal({
    titulo, color, existentes, opuestas, onAdd, onClose,
}: {
    titulo: string; color: "sky" | "amber";
    existentes: Set<number>; opuestas: Set<number>;
    onAdd: (nums: number[]) => void; onClose: () => void;
}) {
    const [input, setInput] = useState("");
    const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
    const [aReubicar, setARebicar] = useState<number[]>([]);
    const [error, setError] = useState("");

    const headerBg = color === "sky" ? "bg-gradient-to-r from-sky-500 to-sky-600" : "bg-gradient-to-r from-amber-400 to-yellow-400";
    const headerText = color === "sky" ? "text-white" : "text-amber-900";
    const btnBg = color === "sky" ? "bg-sky-500 text-white hover:bg-sky-600" : "bg-amber-400 text-amber-900 hover:bg-amber-500";
    const chipBg = color === "sky" ? "bg-sky-100 text-sky-700 border-sky-200" : "bg-amber-100 text-amber-700 border-amber-200";
    const tipoOpuesto = color === "sky" ? "faltantes" : "repetidas";
    const tipoActual = color === "sky" ? "repetidas" : "faltantes";

    const agregar = () => {
        const num = parseInt(input.trim(), 10);
        if (isNaN(num) || num < MIN_NUM || num > MAX_NUM) {
            setError(`El número debe estar entre ${MIN_NUM} y ${MAX_NUM}`); return;
        }
        if (seleccionadas.includes(num) || aReubicar.includes(num)) {
            setError(`Ya agregaste el #${String(num).padStart(2, "0")} en esta sesión`); return;
        }
        if (existentes.has(num)) {
            setError(`El #${String(num).padStart(2, "0")} ya está en tus ${tipoActual}`); return;
        }
        if (opuestas.has(num)) {
            setARebicar(prev => [...prev, num]);
            setInput(""); setError(""); return;
        }
        setSeleccionadas(prev => [...prev, num]);
        setInput(""); setError("");
    };

    const fmt = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className={`${headerBg} px-5 pt-5 pb-5`}>
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <h2 className={`font-black text-lg ${headerText}`}>{titulo}</h2>
                    <p className={`text-sm mt-0.5 ${color === "sky" ? "text-sky-100" : "text-amber-800"}`}>
                        Ingresá el número de cada figurita ({MIN_NUM}–{MAX_NUM})
                    </p>
                </div>
                <div className="px-5 py-5">
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">#</span>
                            <input type="text" inputMode="numeric" pattern="[0-9]*"
                                placeholder={`Ej: 00, 42, 312, 820...`}
                                value={input}
                                onChange={e => { setInput(e.target.value.replace(/[^0-9]/g, "")); setError(""); }}
                                onKeyDown={e => e.key === "Enter" && agregar()}
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                                autoFocus />
                        </div>
                        <button onClick={agregar} className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 ${btnBg}`}>
                            + Agregar
                        </button>
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium mb-3">⚠ {error}</p>}

                    {aReubicar.length > 0 && (
                        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                            <p className="text-[11px] text-amber-700 font-bold mb-1.5">
                                ⚠️ Estas ya están en tus {tipoOpuesto} — se moverán a {tipoActual}:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {aReubicar.map(n => (
                                    <button key={n} onClick={() => setARebicar(p => p.filter(x => x !== n))}
                                        className="flex items-center gap-1 text-xs border rounded-full px-2.5 py-1 font-bold bg-amber-100 text-amber-800 border-amber-300 hover:opacity-70 transition-all">
                                        #{fmt(n)}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {seleccionadas.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4 max-h-32 overflow-y-auto">
                            {seleccionadas.map(n => (
                                <button key={n} onClick={() => setSeleccionadas(p => p.filter(x => x !== n))}
                                    className={`flex items-center gap-1 text-xs border rounded-full px-2.5 py-1 font-bold transition-all hover:opacity-70 ${chipBg}`}>
                                    #{fmt(n)}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    ) : aReubicar.length === 0 ? (
                        <div className="py-4 text-center text-gray-400 text-sm mb-2">Todavía no agregaste ninguna</div>
                    ) : null}

                    <div className="flex gap-2 mt-2">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
                        <button
                            onClick={() => {
                                const total = [...seleccionadas, ...aReubicar];
                                if (total.length > 0) { onAdd(total); onClose(); }
                            }}
                            disabled={seleccionadas.length === 0 && aReubicar.length === 0}
                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${
                                seleccionadas.length > 0 || aReubicar.length > 0 ? btnBg + " shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}>
                            Guardar {(seleccionadas.length + aReubicar.length) > 0 ? `(${seleccionadas.length + aReubicar.length})` : ""}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Special price modal ──────────────────────────────────────────────────────
function EspecialModal({ numero, precioActual, onSave, onRemove, onClose }: {
    numero: number; precioActual: number | null;
    onSave: (precio: number) => void; onRemove: () => void; onClose: () => void;
}) {
    const [precio, setPrecio] = useState(precioActual ?? 3);
    const fmt = (n: number) => String(n).padStart(2, "0");
    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-400 px-5 pt-5 pb-5">
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-amber-900 text-lg flex-shrink-0">#{fmt(numero)}</div>
                        <div>
                            <p className="text-amber-800 text-xs font-semibold">Figurita especial</p>
                            <h2 className="text-amber-900 font-black text-base">¿Cuánto vale?</h2>
                        </div>
                        <div className="ml-auto text-2xl">⭐</div>
                    </div>
                </div>
                <div className="px-5 py-5">
                    <p className="text-xs text-gray-400 mb-4">Al pedir esta figurita, el otro deberá ofrecer <strong>{precio}</strong> figurita{precio !== 1 ? "s" : ""} a cambio.</p>
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => setPrecio(p => Math.max(2, p - 1))} className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-black text-lg flex items-center justify-center hover:bg-gray-200 active:scale-95">−</button>
                        <div className="flex-1 text-center">
                            <div className="text-4xl font-black text-amber-500">{precio}</div>
                            <div className="text-xs text-gray-400 font-medium">figuritas normales</div>
                        </div>
                        <button onClick={() => setPrecio(p => Math.min(10, p + 1))} className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-black text-lg flex items-center justify-center hover:bg-gray-200 active:scale-95">+</button>
                    </div>
                    <div className="flex gap-2 mb-5">
                        {[2, 3, 5, 7, 10].map(p => (
                            <button key={p} onClick={() => setPrecio(p)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${precio === p ? "bg-amber-400 text-amber-900" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                ×{p}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {precioActual !== null && (
                            <button onClick={onRemove} className="px-4 py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50">Quitar ⭐</button>
                        )}
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
                        <button onClick={() => onSave(precio)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 font-black text-sm active:scale-[0.98]">Guardar ⭐</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sticker chip ─────────────────────────────────────────────────────────────
function StickerChip({ numero, color, esEspecial, precio, onRemove, onEspecialClick }: {
    numero: number; color: "sky" | "amber";
    esEspecial: boolean; precio: number | null;
    onRemove: () => void; onEspecialClick?: () => void;
}) {
    const base = color === "sky" ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-amber-50 border-amber-200 text-amber-800";
    const numBg = color === "sky" ? "bg-sky-500 text-white" : "bg-amber-400 text-amber-900";
    const specialRing = esEspecial ? "ring-2 ring-amber-400 ring-offset-1" : "";
    const fmt = String(numero).padStart(2, "0");

    return (
        <div className={`relative flex flex-col items-center rounded-xl border-2 p-2 gap-1 transition-all ${base} ${specialRing}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${numBg}`}>#{fmt}</div>
            {esEspecial && precio && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">×{precio}</div>
            )}
            <div className="flex items-center gap-1">
                {onEspecialClick && (
                    <button onClick={onEspecialClick}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${esEspecial ? "bg-amber-400 text-amber-900" : "bg-gray-200 text-gray-400 hover:bg-amber-200 hover:text-amber-700"}`}
                        title={esEspecial ? `Vale ×${precio}` : "Marcar especial"}>⭐</button>
                )}
                <button onClick={onRemove} className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MiAlbumPage() {
    const session = getOnboardingData();
    const mongoId = session.mongoId ?? "";

    const [repetidas, setRepetidas] = useState<number[]>([]);
    const [faltantes, setFaltantes] = useState<number[]>([]);
    const [especiales, setEspeciales] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modal, setModal] = useState<"repetidas" | "faltantes" | null>(null);
    const [modalEspecial, setModalEspecial] = useState<number | null>(null);

    // ── Cargar datos desde MongoDB ────────────────────────────────────────────
    useEffect(() => {
        if (!mongoId) { setLoading(false); return; }
        fetch(`/api/usuarios/${mongoId}`)
            .then(r => r.json())
            .then(u => {
                const toNum = (arr: unknown[]) =>
                    arr.map(Number).filter(n => !isNaN(n) && n >= MIN_NUM && n <= MAX_NUM);
                setRepetidas(toNum(u.repetidas ?? []));
                setFaltantes(toNum(u.faltantes ?? []));
                setEspeciales(u.especiales
                    ? Object.fromEntries(
                        Object.entries(u.especiales)
                            .map(([k, v]) => [Number(k), v as number])
                            .filter(([k]) => !isNaN(k as number))
                      )
                    : {});
            })
            .finally(() => setLoading(false));
    }, [mongoId]);

    // ── Guardar en MongoDB ────────────────────────────────────────────────────
    const guardar = useCallback(async (patch: { repetidas?: number[]; faltantes?: number[]; especiales?: Record<number, number> }) => {
        if (!mongoId) return;
        // Sanitizar — nunca guardar NaN ni valores fuera de rango
        const clean = (arr: number[]) => arr.filter(n => !isNaN(n) && n >= MIN_NUM && n <= MAX_NUM);
        const sanitized = {
            ...patch,
            ...(patch.repetidas !== undefined && { repetidas: clean(patch.repetidas) }),
            ...(patch.faltantes !== undefined && { faltantes: clean(patch.faltantes) }),
        };
        setSaving(true);
        try {
            const res = await fetch(`/api/usuarios/${mongoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitized),
            });
            const u = await res.json();
            completeOnboarding({
                ...session,
                repetidas: (u.repetidas ?? []).map(String),
                faltantes: (u.faltantes ?? []).map(String),
            });
            // Notificar al RightPanel para que se refresque
            window.dispatchEvent(new Event("album-updated"));
        } finally {
            setSaving(false);
        }
    }, [mongoId, session]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const agregarRepetidas = (nums: number[]) => {
        const nuevasRep = [...new Set([...repetidas, ...nums])];
        const nuevasFal = faltantes.filter(n => !nums.includes(n));
        setRepetidas(nuevasRep);
        setFaltantes(nuevasFal);
        guardar({ repetidas: nuevasRep, faltantes: nuevasFal });
    };

    const agregarFaltantes = (nums: number[]) => {
        const nuevasFal = [...new Set([...faltantes, ...nums])];
        const nuevasRep = repetidas.filter(n => !nums.includes(n));
        const newEsp = { ...especiales };
        nums.forEach(n => delete newEsp[n]);
        setFaltantes(nuevasFal);
        setRepetidas(nuevasRep);
        setEspeciales(newEsp);
        guardar({ repetidas: nuevasRep, faltantes: nuevasFal, especiales: newEsp });
    };

    const quitarRepetida = (n: number) => {
        const nuevasRep = repetidas.filter(x => x !== n);
        const newEsp = { ...especiales };
        delete newEsp[n];
        setRepetidas(nuevasRep);
        setEspeciales(newEsp);
        guardar({ repetidas: nuevasRep, especiales: newEsp });
    };

    const quitarFaltante = (n: number) => {
        const nuevasFal = faltantes.filter(x => x !== n);
        setFaltantes(nuevasFal);
        guardar({ faltantes: nuevasFal });
    };

    const handleSaveEspecial = (precio: number) => {
        if (modalEspecial === null) return;
        const newEsp = { ...especiales, [modalEspecial]: precio };
        setEspeciales(newEsp);
        guardar({ especiales: newEsp });
        setModalEspecial(null);
    };

    const handleRemoveEspecial = () => {
        if (modalEspecial === null) return;
        const newEsp = { ...especiales };
        delete newEsp[modalEspecial];
        setEspeciales(newEsp);
        guardar({ especiales: newEsp });
        setModalEspecial(null);
    };

    const nEspeciales = Object.keys(especiales).filter(k => repetidas.includes(Number(k))).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm text-gray-400 font-medium">Cargando álbum...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-lg mx-auto px-4 pt-20 pb-24 lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-12 lg:pb-8 xl:mr-72">
                <div className="mb-5 mt-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">📒 Mi Álbum</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Figuritas del 00 al 980</p>
                    </div>
                    {saving && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Guardando...
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-sky-500 rounded-2xl p-4 text-center shadow-md shadow-sky-200">
                        <div className="text-white font-black text-3xl leading-none">{repetidas.length}</div>
                        <div className="text-sky-100 text-xs font-semibold mt-1">Repetidas</div>
                        {nEspeciales > 0 && (
                            <div className="text-amber-300 text-[10px] font-bold mt-0.5">⭐ {nEspeciales} especial{nEspeciales !== 1 ? "es" : ""}</div>
                        )}
                    </div>
                    <div className="bg-amber-400 rounded-2xl p-4 text-center shadow-md shadow-amber-200">
                        <div className="text-amber-900 font-black text-3xl leading-none">{faltantes.length}</div>
                        <div className="text-amber-800 text-xs font-semibold mt-1">Me faltan</div>
                        <div className="text-amber-700 text-[10px] font-medium mt-0.5">de 981 totales</div>
                    </div>
                </div>

                {/* ── REPETIDAS ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-sky-500" />
                            <h2 className="font-black text-gray-900 text-sm">Repetidas</h2>
                            <span className="text-xs text-gray-400 font-medium">({repetidas.length})</span>
                        </div>
                        <button onClick={() => setModal("repetidas")}
                            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                        </button>
                    </div>
                    <div className="p-3">
                        {repetidas.length === 0 ? (
                            <div className="py-6 text-center">
                                <div className="text-3xl mb-2">📦</div>
                                <p className="text-sm text-gray-400 font-medium">No tenés repetidas todavía</p>
                                <button onClick={() => setModal("repetidas")} className="text-sky-500 text-xs font-bold mt-1">+ Agregar</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3">
                                    <span className="text-sm flex-shrink-0">⭐</span>
                                    <p className="text-xs text-amber-700 font-medium">Tocá ⭐ para marcar una figurita como especial y definir su precio de canje.</p>
                                </div>
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                                    {[...repetidas].sort((a, b) => a - b).map(n => (
                                        <StickerChip key={n} numero={n} color="sky"
                                            esEspecial={!!especiales[n]} precio={especiales[n] ?? null}
                                            onRemove={() => quitarRepetida(n)}
                                            onEspecialClick={() => setModalEspecial(n)} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── ME FALTAN ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <h2 className="font-black text-gray-900 text-sm">Me faltan</h2>
                            <span className="text-xs text-gray-400 font-medium">({faltantes.length})</span>
                        </div>
                        <button onClick={() => setModal("faltantes")}
                            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-900 text-xs font-black px-3 py-1.5 rounded-lg transition-colors active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                        </button>
                    </div>
                    <div className="p-3">
                        {faltantes.length === 0 ? (
                            <div className="py-6 text-center">
                                <div className="text-3xl mb-2">🎉</div>
                                <p className="text-sm text-gray-400 font-medium">¡Álbum completo!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                                {[...faltantes].sort((a, b) => a - b).map(n => (
                                    <StickerChip key={n} numero={n} color="amber"
                                        esEspecial={false} precio={null}
                                        onRemove={() => quitarFaltante(n)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {modal === "repetidas" && (
                <AddModal titulo="Agregar repetidas" color="sky"
                    existentes={new Set(repetidas)} opuestas={new Set(faltantes)}
                    onAdd={agregarRepetidas} onClose={() => setModal(null)} />
            )}
            {modal === "faltantes" && (
                <AddModal titulo="Agregar faltantes" color="amber"
                    existentes={new Set(faltantes)} opuestas={new Set(repetidas)}
                    onAdd={agregarFaltantes} onClose={() => setModal(null)} />
            )}
            {modalEspecial !== null && (
                <EspecialModal
                    numero={modalEspecial}
                    precioActual={especiales[modalEspecial] ?? null}
                    onSave={handleSaveEspecial}
                    onRemove={handleRemoveEspecial}
                    onClose={() => setModalEspecial(null)} />
            )}
        </div>
    );
}
