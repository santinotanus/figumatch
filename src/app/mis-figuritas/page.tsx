"use client";

import { useState, useMemo } from "react";
import { TODAS_LAS_FIGURITAS } from "@/lib/mockData";
import { getEspeciales, setEspecial, removeEspecial } from "@/lib/especialesStore";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
// We store sticker IDs in two sets: repetidas (have duplicates) and faltantes (missing)
// "tengo" (have exactly one) is implicit — not shown in the album

// ─── Add sticker modal ────────────────────────────────────────────────────────
function AddModal({
    titulo,
    color,
    existentes,
    onAdd,
    onClose,
}: {
    titulo: string;
    color: "sky" | "amber";
    existentes: Set<string>;
    onAdd: (ids: string[]) => void;
    onClose: () => void;
}) {
    const [input, setInput] = useState("");
    const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
    const [error, setError] = useState("");

    const headerBg = color === "sky"
        ? "bg-gradient-to-r from-sky-500 to-sky-600"
        : "bg-gradient-to-r from-amber-400 to-yellow-400";
    const headerText = color === "sky" ? "text-white" : "text-amber-900";
    const btnBg = color === "sky"
        ? "bg-sky-500 text-white hover:bg-sky-600"
        : "bg-amber-400 text-amber-900 hover:bg-amber-500";
    const chipBg = color === "sky"
        ? "bg-sky-100 text-sky-700 border-sky-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

    const MAX_FIGURITA = 940;

    const agregarNumero = () => {
        const num = input.trim();
        if (!num) return;

        const numInt = parseInt(num, 10);
        if (isNaN(numInt) || numInt < 1 || numInt > MAX_FIGURITA) {
            setError(`El número debe estar entre 1 y ${MAX_FIGURITA}`);
            return;
        }

        // Find sticker by number
        const fig = TODAS_LAS_FIGURITAS.find(f => f.numero === numInt);
        if (!fig) {
            setError(`No existe la figurita #${num}`);
            return;
        }
        if (seleccionadas.includes(fig.id)) {
            setError(`Ya agregaste la #${num}`);
            return;
        }
        setSeleccionadas(prev => [...prev, fig.id]);
        setInput("");
        setError("");
    };

    const quitar = (id: string) => setSeleccionadas(prev => prev.filter(x => x !== id));

    const confirmar = () => {
        if (seleccionadas.length === 0) return;
        onAdd(seleccionadas);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`${headerBg} px-5 pt-5 pb-5`}>
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <h2 className={`font-black text-lg ${headerText}`}>{titulo}</h2>
                    <p className={`text-sm mt-0.5 ${color === "sky" ? "text-sky-100" : "text-amber-800"}`}>
                        Ingresá el número de cada figurita
                    </p>
                </div>

                <div className="px-5 py-5">
                    {/* Input row */}
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">#</span>
                            <input
                                type="number"
                                min="1"
                                max="940"
                                placeholder="1 – 940"
                                value={input}
                                onChange={e => { setInput(e.target.value); setError(""); }}
                                onKeyDown={e => e.key === "Enter" && agregarNumero()}
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={agregarNumero}
                            className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 ${btnBg}`}
                        >
                            + Agregar
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 font-medium mb-3">⚠ {error}</p>
                    )}

                    {/* Selected chips */}
                    {seleccionadas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 max-h-32 overflow-y-auto">
                            {seleccionadas.map(id => {
                                const fig = TODAS_LAS_FIGURITAS.find(f => f.id === id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => quitar(id)}
                                        className={`flex items-center gap-1 text-xs border rounded-full px-2.5 py-1 font-bold transition-all hover:opacity-70 ${chipBg}`}
                                    >
                                        #{fig?.numero}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {seleccionadas.length === 0 && (
                        <div className="py-4 text-center text-gray-400 text-sm mb-2">
                            Todavía no agregaste ninguna
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmar}
                            disabled={seleccionadas.length === 0}
                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98]
                ${seleccionadas.length > 0 ? btnBg + " shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        >
                            Guardar {seleccionadas.length > 0 ? `(${seleccionadas.length})` : ""}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Special price modal ──────────────────────────────────────────────────────
function EspecialModal({
    numero,
    figId,
    precioActual,
    onSave,
    onRemove,
    onClose,
}: {
    numero: number;
    figId: string;
    precioActual: number | null;
    onSave: (precio: number) => void;
    onRemove: () => void;
    onClose: () => void;
}) {
    const [precio, setPrecio] = useState(precioActual ?? 3);

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-400 px-5 pt-5 pb-5">
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-amber-900 text-lg flex-shrink-0">
                            #{numero}
                        </div>
                        <div>
                            <p className="text-amber-800 text-xs font-semibold">Figurita especial</p>
                            <h2 className="text-amber-900 font-black text-base">¿Cuánto vale?</h2>
                        </div>
                        <div className="ml-auto text-2xl">⭐</div>
                    </div>
                </div>

                <div className="px-5 py-5">
                    <p className="text-xs text-gray-400 mb-4">
                        Al pedir esta figurita, el otro deberá ofrecer <strong>{precio}</strong> figurita{precio !== 1 ? "s" : ""} a cambio.
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => setPrecio(p => Math.max(2, p - 1))}
                            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-black text-lg flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">−</button>
                        <div className="flex-1 text-center">
                            <div className="text-4xl font-black text-amber-500">{precio}</div>
                            <div className="text-xs text-gray-400 font-medium">figuritas normales</div>
                        </div>
                        <button onClick={() => setPrecio(p => Math.min(10, p + 1))}
                            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-black text-lg flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">+</button>
                    </div>

                    <div className="flex gap-2 mb-5">
                        {[2, 3, 5, 7, 10].map(p => (
                            <button key={p} onClick={() => setPrecio(p)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all
                  ${precio === p ? "bg-amber-400 text-amber-900" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                ×{p}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {precioActual !== null && (
                            <button onClick={onRemove}
                                className="px-4 py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
                                Quitar ⭐
                            </button>
                        )}
                        <button onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={() => onSave(precio)}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 font-black text-sm shadow-sm hover:from-amber-500 hover:to-yellow-500 transition-all active:scale-[0.98]">
                            Guardar ⭐
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sticker chip ─────────────────────────────────────────────────────────────
function StickerChip({
    figId,
    color,
    esEspecial,
    precio,
    onRemove,
    onEspecialClick,
}: {
    figId: string;
    color: "sky" | "amber";
    esEspecial: boolean;
    precio: number | null;
    onRemove: () => void;
    onEspecialClick?: () => void;
}) {
    const fig = TODAS_LAS_FIGURITAS.find(f => f.id === figId);
    const num = fig?.numero ?? "?";

    const base = color === "sky"
        ? "bg-sky-50 border-sky-200 text-sky-800"
        : "bg-amber-50 border-amber-200 text-amber-800";
    const numBg = color === "sky" ? "bg-sky-500 text-white" : "bg-amber-400 text-amber-900";
    const specialRing = esEspecial ? "ring-2 ring-amber-400 ring-offset-1" : "";

    return (
        <div className={`relative flex flex-col items-center rounded-xl border-2 p-2 gap-1 transition-all ${base} ${specialRing}`}>
            {/* Number */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${numBg}`}>
                #{num}
            </div>

            {/* Special badge */}
            {esEspecial && precio && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    ×{precio}
                </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-1">
                {/* Star button (only for repetidas) */}
                {onEspecialClick && (
                    <button
                        onClick={onEspecialClick}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all
              ${esEspecial ? "bg-amber-400 text-amber-900" : "bg-gray-200 text-gray-400 hover:bg-amber-200 hover:text-amber-700"}`}
                        title={esEspecial ? `Vale ×${precio}` : "Marcar especial"}
                    >
                        ⭐
                    </button>
                )}
                {/* Remove */}
                <button
                    onClick={onRemove}
                    className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
                >
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
    // Repetidas: IDs de figuritas que tengo de más
    const [repetidas, setRepetidas] = useState<string[]>([
        "ARG-1", "BRA-1", "FRA-1", "ESP-1", "GER-1", "POR-1", "URU-1", "ESP-TROFEO",
    ]);
    // Faltantes: IDs de figuritas que me faltan
    const [faltantes, setFaltantes] = useState<string[]>([
        "ARG-2", "ARG-3", "BRA-2", "BRA-3", "FRA-2", "ESP-2", "ESP-3", "GER-2", "ENG-1", "ENG-2", "URU-2", "ESP-LOGO", "ESP-MASCOTA",
    ]);

    const [especiales, setEspecialesLocal] = useState<Record<string, number>>(() => getEspeciales());
    const [modal, setModal] = useState<"repetidas" | "faltantes" | null>(null);
    const [modalEspecial, setModalEspecial] = useState<string | null>(null); // figId

    const agregarRepetidas = (ids: string[]) => {
        setRepetidas(prev => {
            const nuevas = ids.filter(id => !prev.includes(id));
            return [...prev, ...nuevas];
        });
        // Remove from faltantes if present
        setFaltantes(prev => prev.filter(id => !ids.includes(id)));
    };

    const agregarFaltantes = (ids: string[]) => {
        setFaltantes(prev => {
            const nuevas = ids.filter(id => !prev.includes(id));
            return [...prev, ...nuevas];
        });
        // Remove from repetidas if present
        setRepetidas(prev => prev.filter(id => !ids.includes(id)));
    };

    const quitarRepetida = (id: string) => {
        setRepetidas(prev => prev.filter(x => x !== id));
        removeEspecial(id);
        setEspecialesLocal(getEspeciales());
    };

    const quitarFaltante = (id: string) => setFaltantes(prev => prev.filter(x => x !== id));

    const handleSaveEspecial = (precio: number) => {
        if (!modalEspecial) return;
        setEspecial(modalEspecial, precio);
        setEspecialesLocal(getEspeciales());
        setModalEspecial(null);
    };

    const handleRemoveEspecial = () => {
        if (!modalEspecial) return;
        removeEspecial(modalEspecial);
        setEspecialesLocal(getEspeciales());
        setModalEspecial(null);
    };

    const nEspeciales = Object.keys(especiales).filter(id => repetidas.includes(id)).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="
                max-w-lg mx-auto px-4 pt-20 pb-24
                lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-12 lg:pb-8
                xl:mr-72
            ">
                {/* Header */}
                <div className="mb-5 mt-2">
                    <h1 className="text-2xl font-black text-gray-900">Mi Álbum</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Gestioná tus figuritas repetidas y las que te faltan
                    </p>
                </div>

                {/* Stats bar */}
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
                        <button
                            onClick={() => setModal("repetidas")}
                            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                        >
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
                                <p className="text-sm text-gray-400 font-medium">No tenés repetidas</p>
                                <button onClick={() => setModal("repetidas")} className="text-sky-500 text-xs font-bold mt-1">+ Agregar</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3">
                                    <span className="text-sm flex-shrink-0">⭐</span>
                                    <p className="text-xs text-amber-700 font-medium">
                                        Tocá ⭐ en una figurita para marcarla como especial y definir su precio de canje.
                                    </p>
                                </div>
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                                    {repetidas.map(id => (
                                        <StickerChip
                                            key={id}
                                            figId={id}
                                            color="sky"
                                            esEspecial={!!especiales[id]}
                                            precio={especiales[id] ?? null}
                                            onRemove={() => quitarRepetida(id)}
                                            onEspecialClick={() => setModalEspecial(id)}
                                        />
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
                        <button
                            onClick={() => setModal("faltantes")}
                            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-900 text-xs font-black px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                        >
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
                                <p className="text-sm text-gray-400 font-medium">¡No te falta ninguna!</p>
                                <button onClick={() => setModal("faltantes")} className="text-amber-500 text-xs font-bold mt-1">+ Agregar</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                                {faltantes.map(id => (
                                    <StickerChip
                                        key={id}
                                        figId={id}
                                        color="amber"
                                        esEspecial={false}
                                        precio={null}
                                        onRemove={() => quitarFaltante(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add modal */}
            {modal === "repetidas" && (
                <AddModal
                    titulo="Agregar repetidas"
                    color="sky"
                    existentes={new Set(repetidas)}
                    onAdd={agregarRepetidas}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === "faltantes" && (
                <AddModal
                    titulo="Agregar faltantes"
                    color="amber"
                    existentes={new Set(faltantes)}
                    onAdd={agregarFaltantes}
                    onClose={() => setModal(null)}
                />
            )}

            {/* Special modal */}
            {modalEspecial && (() => {
                const fig = TODAS_LAS_FIGURITAS.find(f => f.id === modalEspecial);
                return fig ? (
                    <EspecialModal
                        numero={fig.numero}
                        figId={modalEspecial}
                        precioActual={especiales[modalEspecial] ?? null}
                        onSave={handleSaveEspecial}
                        onRemove={handleRemoveEspecial}
                        onClose={() => setModalEspecial(null)}
                    />
                ) : null;
            })()}
        </div>
    );
}
