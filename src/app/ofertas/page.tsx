"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OfertaCompleta } from "@/types";
import {
    getOfertas,
    aceptarOferta,
    rechazarOferta,
    cancelarOferta,
} from "@/lib/ofertasStore";
import { FIGURITAS_MAP } from "@/lib/mockData";
import { getPrecio, isEspecial } from "@/lib/especialesStore";
import Navbar from "@/components/Navbar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FLAG: Record<string, string> = {
    Argentina: "🇦🇷", Brasil: "🇧🇷", Francia: "🇫🇷", España: "🇪🇸",
    Alemania: "🇩🇪", Portugal: "🇵🇹", Uruguay: "🇺🇾", Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", FIFA: "🌍",
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

function fmtFecha(fecha: string) {
    return new Date(fecha + "T12:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
    });
}

function StickerPill({ id, color }: { id: string; color: "sky" | "amber" }) {
    const fig = FIGURITAS_MAP[id];
    const especial = isEspecial(id);
    const precio = getPrecio(id);
    const bg = color === "sky"
        ? "bg-sky-100 text-sky-700 border-sky-200"
        : "bg-amber-100 text-amber-700 border-amber-200";
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] border rounded-full px-2 py-0.5 font-semibold whitespace-nowrap ${bg}`}>
            {fig ? `${FLAG[fig.pais] || "🌍"} #${fig.numero}` : `#${id}`}
            {especial && <span className="text-[9px]">⭐×{precio}</span>}
        </span>
    );
}

// ─── Mock history data ─────────────────────────────────────────────────────────
interface CanjeHistorial {
    id: string;
    fecha: string;
    usuarioNombre: string;
    usuarioAvatar: string;
    usuarioCiudad: string;
    figuritasRecibidas: string[];  // IDs
    figuritasEntregadas: string[]; // IDs
    lugar: string;
    horaEncuentro: string;
    rating: number; // 1-5 stars given
}

const HISTORIAL_MOCK: CanjeHistorial[] = [
    {
        id: "h1",
        fecha: "2026-02-15T10:30:00Z",
        usuarioNombre: "Martina López",
        usuarioAvatar: "ML",
        usuarioCiudad: "Palermo, Buenos Aires",
        figuritasRecibidas: ["ARG-1", "FRA-1"],
        figuritasEntregadas: ["BRA-1", "ESP-1"],
        lugar: "Obelisco, CABA",
        horaEncuentro: "15:00",
        rating: 5,
    },
    {
        id: "h2",
        fecha: "2026-02-10T09:00:00Z",
        usuarioNombre: "Carlos Ruiz",
        usuarioAvatar: "CR",
        usuarioCiudad: "San Isidro, GBA",
        figuritasRecibidas: ["GER-1", "POR-1"],
        figuritasEntregadas: ["URU-1", "ENG-1"],
        lugar: "Plaza San Martín, San Isidro",
        horaEncuentro: "11:30",
        rating: 4,
    },
    {
        id: "h3",
        fecha: "2026-02-03T16:00:00Z",
        usuarioNombre: "Sofía Herrera",
        usuarioAvatar: "SH",
        usuarioCiudad: "Caballito, Buenos Aires",
        figuritasRecibidas: ["ESP-TROFEO"],
        figuritasEntregadas: ["ARG-2", "ARG-3", "ARG-4"],
        lugar: "Patio Bullrich, Palermo",
        horaEncuentro: "18:00",
        rating: 0, // sin puntuar
    },
    {
        id: "h4",
        fecha: "2026-01-28T14:00:00Z",
        usuarioNombre: "Diego Morales",
        usuarioAvatar: "DM",
        usuarioCiudad: "Lanús, GBA",
        figuritasRecibidas: ["BRA-2", "BRA-3"],
        figuritasEntregadas: ["FRA-2", "FRA-3"],
        lugar: "Estación Constitución",
        horaEncuentro: "13:00",
        rating: 0, // sin puntuar
    },
];

const RATING_LABELS: Record<number, { emoji: string; text: string }> = {
    1: { emoji: "😞", text: "Muy malo" },
    2: { emoji: "😕", text: "Regular" },
    3: { emoji: "😐", text: "Bien" },
    4: { emoji: "😊", text: "Muy bien" },
    5: { emoji: "🤩", text: "¡Excelente!" },
};

// ─── Star display (read-only) ─────────────────────────────────────────────────
function StarDisplay({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className={`w-4 h-4 ${n <= value ? "text-amber-400" : "text-gray-200"}`}
                    viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

// ─── Historial Card ───────────────────────────────────────────────────────────
function HistorialCard({ canje, onClick }: { canje: CanjeHistorial; onClick: () => void }) {
    const sinPuntuar = canje.rating === 0;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] overflow-hidden border-2
                ${sinPuntuar
                    ? "border-amber-300 border-dashed"
                    : "border-gray-100"
                }`}
        >
            {/* Top row: avatar + name + badge */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center font-black text-emerald-700 text-sm flex-shrink-0">
                    {canje.usuarioAvatar}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{canje.usuarioNombre}</p>
                    <p className="text-xs text-gray-400 truncate">{canje.usuarioCiudad}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {sinPuntuar ? (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 uppercase tracking-wide whitespace-nowrap">
                            ⭐ Sin puntuar
                        </span>
                    ) : (
                        <>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                                ✅ Realizado
                            </span>
                            <StarDisplay value={canje.rating} />
                        </>
                    )}
                </div>
            </div>

            {/* Trade summary — compact single row, always fits mobile */}
            <div className="px-4 py-3 flex items-center gap-2">
                {/* Recibiste */}
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-wide mb-1.5">Recibiste</p>
                    <div className="flex flex-wrap gap-1">
                        {canje.figuritasRecibidas.slice(0, 4).map(id => {
                            const fig = FIGURITAS_MAP[id];
                            return (
                                <span key={id} className="inline-flex items-center gap-0.5 bg-sky-100 text-sky-700 border border-sky-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                                    {FLAG[fig?.pais] || "🌍"}<span>#{fig?.numero ?? id}</span>
                                </span>
                            );
                        })}
                        {canje.figuritasRecibidas.length > 4 && (
                            <span className="text-[10px] text-gray-400 font-bold self-center">+{canje.figuritasRecibidas.length - 4}</span>
                        )}
                    </div>
                </div>

                {/* Divider arrow */}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>

                {/* Entregaste */}
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide mb-1.5">Entregaste</p>
                    <div className="flex flex-wrap gap-1">
                        {canje.figuritasEntregadas.slice(0, 4).map(id => {
                            const fig = FIGURITAS_MAP[id];
                            return (
                                <span key={id} className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                                    {FLAG[fig?.pais] || "🌍"}<span>#{fig?.numero ?? id}</span>
                                </span>
                            );
                        })}
                        {canje.figuritasEntregadas.length > 4 && (
                            <span className="text-[10px] text-gray-400 font-bold self-center">+{canje.figuritasEntregadas.length - 4}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer: location + date */}
            <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-gray-400">📍 {canje.lugar}</span>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">{timeAgo(canje.fecha)}</span>
            </div>

            {/* CTA banner when unrated */}
            {sinPuntuar && (
                <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between">
                    <p className="text-xs text-amber-700 font-bold">¿Cómo salió el intercambio?</p>
                    <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        Puntuar <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </span>
                </div>
            )}
        </button>
    );
}

// ─── Interactive star picker ─────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)}
                    className="transition-transform active:scale-90"
                >
                    <svg
                        className={`w-9 h-9 transition-colors ${n <= (hover || value) ? "text-amber-400" : "text-gray-200"
                            }`}
                        viewBox="0 0 24 24" fill="currentColor"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

// ─── Historial Detail Modal ────────────────────────────────────────────────────
function HistorialDetailModal({ canje, onClose, onRated }: {
    canje: CanjeHistorial;
    onClose: () => void;
    onRated: (id: string, rating: number) => void;
}) {
    const sinPuntuar = canje.rating === 0;
    const [localRating, setLocalRating] = useState(canje.rating);
    const [guardado, setGuardado] = useState(false);

    const handleGuardar = () => {
        if (localRating === 0) return;
        onRated(canje.id, localRating);
        setGuardado(true);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-0 sm:px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

                {/* Header */}
                <div className={`px-5 pt-5 pb-5 flex-shrink-0 ${sinPuntuar && !guardado
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600"
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-base ring-2 ring-white/30 flex-shrink-0">
                            {canje.usuarioAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-medium">
                                {sinPuntuar && !guardado ? "Puntuar canje con" : "Canje realizado con"}
                            </p>
                            <h2 className="text-white font-black text-lg leading-tight truncate">{canje.usuarioNombre}</h2>
                            <p className="text-white/60 text-xs">{canje.usuarioCiudad}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Encuentro info */}
                    <div className="mt-3 bg-white/15 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-white text-xs">
                            <span>📍</span>
                            <span className="font-semibold">{canje.lugar}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <span>📅</span>
                            <span>{fmtFecha(canje.fecha.split("T")[0])}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <span>🕐</span>
                            <span>{canje.horaEncuentro} hs</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-5 py-5 flex flex-col gap-4">

                    {/* Rating section */}
                    {sinPuntuar && !guardado ? (
                        /* ── Interactive rating picker ── */
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-4 flex flex-col items-center gap-3">
                            <p className="font-black text-gray-900 text-sm text-center">¿Cómo fue el intercambio?</p>
                            <StarPicker value={localRating} onChange={setLocalRating} />
                            {localRating > 0 && (
                                <div className="flex items-center gap-2 animate-fade-in">
                                    <span className="text-2xl">{RATING_LABELS[localRating].emoji}</span>
                                    <span className="font-black text-gray-800 text-sm">{RATING_LABELS[localRating].text}</span>
                                </div>
                            )}
                            <button
                                onClick={handleGuardar}
                                disabled={localRating === 0}
                                className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${localRating > 0
                                    ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-md shadow-amber-200"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Guardar puntuación ⭐
                            </button>
                        </div>
                    ) : guardado ? (
                        /* ── Saved confirmation ── */
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <span className="text-3xl">{RATING_LABELS[localRating].emoji}</span>
                            <div>
                                <p className="font-black text-emerald-800 text-sm">¡Puntuación guardada!</p>
                                <StarDisplay value={localRating} />
                            </div>
                        </div>
                    ) : (
                        /* ── Read-only rating ── */
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <span className="text-3xl">{RATING_LABELS[canje.rating].emoji}</span>
                            <div>
                                <p className="font-black text-gray-900 text-sm">Tu puntuación: {RATING_LABELS[canje.rating].text}</p>
                                <StarDisplay value={canje.rating} />
                            </div>
                        </div>
                    )}

                    {/* Figuritas breakdown */}
                    <div className="flex gap-3">
                        {/* Recibiste */}
                        <div className="flex-1 bg-sky-50 border border-sky-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-wide">
                                    Recibiste ({canje.figuritasRecibidas.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {canje.figuritasRecibidas.map(id => {
                                    const fig = FIGURITAS_MAP[id];
                                    return (
                                        <div key={id} className="flex items-center gap-1.5">
                                            <span className="text-sm">{FLAG[fig?.pais] || "🌍"}</span>
                                            <span className="text-xs font-semibold text-gray-800 truncate">
                                                #{fig?.numero} {fig?.nombre}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                        </div>

                        {/* Entregaste */}
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">
                                    Entregaste ({canje.figuritasEntregadas.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {canje.figuritasEntregadas.map(id => {
                                    const fig = FIGURITAS_MAP[id];
                                    return (
                                        <div key={id} className="flex items-center gap-1.5">
                                            <span className="text-sm">{FLAG[fig?.pais] || "🌍"}</span>
                                            <span className="text-xs font-semibold text-gray-800 truncate">
                                                #{fig?.numero} {fig?.nombre}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-6 pt-2 flex-shrink-0 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Historial Sheet ──────────────────────────────────────────────────────────
function HistorialSheet({ onClose }: { onClose: () => void }) {
    const [historial, setHistorial] = useState<CanjeHistorial[]>(HISTORIAL_MOCK);
    const [selectedCanje, setSelectedCanje] = useState<CanjeHistorial | null>(null);

    const handleRated = (id: string, rating: number) => {
        setHistorial(prev => prev.map(c => c.id === id ? { ...c, rating } : c));
        // also update selectedCanje so the modal reflects the new rating
        setSelectedCanje(prev => prev?.id === id ? { ...prev, rating } : prev);
    };

    const rated = historial.filter(c => c.rating > 0);
    const avgRating = rated.length > 0
        ? (rated.reduce((acc, c) => acc + c.rating, 0) / rated.length).toFixed(1)
        : "—";

    return (
        <>
            <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center px-0 sm:px-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

                    {/* Header */}
                    <div className="px-5 pt-4 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="font-black text-gray-900 text-lg">📚 Historial de canjes</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{historial.length} intercambios completados</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats strip */}
                    <div className="flex gap-0 border-b border-gray-100 flex-shrink-0">
                        <div className="flex-1 text-center py-3">
                            <p className="font-black text-emerald-600 text-xl">{historial.length}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Canjes</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1 text-center py-3">
                            <p className="font-black text-sky-600 text-xl">
                                {historial.reduce((acc, c) => acc + c.figuritasRecibidas.length, 0)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Recibidas</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1 text-center py-3">
                            <p className="font-black text-amber-500 text-xl">
                                {historial.reduce((acc, c) => acc + c.figuritasEntregadas.length, 0)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Entregadas</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1 text-center py-3">
                            <p className="font-black text-amber-400 text-xl">{avgRating} ⭐</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Promedio</p>
                        </div>
                    </div>

                    {/* Cards list */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                        {historial.map(canje => (
                            <HistorialCard
                                key={canje.id}
                                canje={canje}
                                onClick={() => setSelectedCanje(canje)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail modal rendered on top of sheet */}
            {selectedCanje && (
                <HistorialDetailModal
                    canje={selectedCanje}
                    onClose={() => setSelectedCanje(null)}
                    onRated={handleRated}
                />
            )}
        </>
    );
}

// ─── Detail Modal (active offers) ─────────────────────────────────────────────
function DetailModal({
    oferta,
    onClose,
    onAceptar,
    onRechazar,
    onCancelar,
}: {
    oferta: OfertaCompleta;
    onClose: () => void;
    onAceptar?: () => void;
    onRechazar?: () => void;
    onCancelar?: () => void;
}) {
    const router = useRouter();
    const [confirming, setConfirming] = useState<"rechazar" | "cancelar" | null>(null);

    const esPendienteYo = oferta.estado === "pendiente_yo";
    const esPendienteEllos = oferta.estado === "pendiente_ellos";
    const esActiva = oferta.estado === "activa";

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`px-5 pt-5 pb-5 ${esPendienteYo ? "bg-gradient-to-r from-sky-500 to-sky-600" :
                    esPendienteEllos ? "bg-gradient-to-r from-gray-600 to-gray-700" :
                        "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    }`}>
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                onClose();
                                router.push(`/usuario-perfil/${oferta.usuarioId}`);
                            }}
                            className="relative w-12 h-12 rounded-full flex-shrink-0 group"
                            title={`Ver perfil de ${oferta.usuarioNombre}`}
                        >
                            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white font-black text-base ring-2 ring-white/40 group-hover:ring-white/80 group-active:scale-95 transition-all duration-150 shadow-[0_0_12px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                                {oferta.usuarioAvatar}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-2.5 h-2.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </span>
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-medium">
                                {esPendienteYo ? "Oferta recibida de" : esPendienteEllos ? "Oferta enviada a" : "Intercambio activo con"}
                            </p>
                            <h2 className="text-white font-black text-lg leading-tight truncate">{oferta.usuarioNombre}</h2>
                            <p className="text-white/60 text-xs">{oferta.usuarioCiudad} · {timeAgo(oferta.fecha)}</p>
                        </div>
                        {esActiva && <div className="text-2xl flex-shrink-0">🤝</div>}
                    </div>

                    {esActiva && oferta.encuentro && (
                        <div className="mt-3 bg-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="text-xl flex-shrink-0">📍</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{oferta.encuentro.lugar}</p>
                                <p className="text-white/70 text-xs mt-0.5">
                                    {new Date(oferta.encuentro.fecha + "T12:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                                    {" · "}{oferta.encuentro.hora} hs
                                </p>
                            </div>
                            <span className="bg-emerald-400 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">COORD.</span>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4">
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 bg-sky-50 border border-sky-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-wide">
                                    Recibís ({oferta.figuritasQueRecibo.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {oferta.figuritasQueRecibo.map(id => {
                                    const fig = FIGURITAS_MAP[id];
                                    return (
                                        <div key={id} className="flex items-center gap-1.5">
                                            <span className="text-sm">{FLAG[fig?.pais] || "🌍"}</span>
                                            <span className="text-xs font-semibold text-gray-800 truncate">
                                                #{fig?.numero} {fig?.nombre}
                                            </span>
                                            {isEspecial(id) && (
                                                <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1 rounded-full flex-shrink-0">
                                                    ⭐×{getPrecio(id)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">
                                    Entregás ({oferta.figuritasQueEntrego.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {oferta.figuritasQueEntrego.map(id => {
                                    const fig = FIGURITAS_MAP[id];
                                    return (
                                        <div key={id} className="flex items-center gap-1.5">
                                            <span className="text-sm">{FLAG[fig?.pais] || "🌍"}</span>
                                            <span className="text-xs font-semibold text-gray-800 truncate">
                                                #{fig?.numero} {fig?.nombre}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {confirming && (
                        <div className={`rounded-xl p-3 mb-3 ${confirming === "rechazar" ? "bg-red-50 border border-red-100" : "bg-orange-50 border border-orange-100"}`}>
                            <p className={`text-sm font-bold mb-2 ${confirming === "rechazar" ? "text-red-700" : "text-orange-700"}`}>
                                {confirming === "rechazar" ? "¿Rechazar esta oferta?" : "¿Cancelar esta oferta?"}
                            </p>
                            <p className={`text-xs mb-3 ${confirming === "rechazar" ? "text-red-600" : "text-orange-600"}`}>
                                {confirming === "rechazar"
                                    ? "El usuario será notificado de que rechazaste su propuesta."
                                    : "La oferta se eliminará y el usuario será notificado."}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirming(null)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50">
                                    Volver
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirming === "rechazar") onRechazar?.();
                                        else onCancelar?.();
                                    }}
                                    className={`flex-1 py-2 rounded-lg font-bold text-xs text-white ${confirming === "rechazar" ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}

                    {!confirming && (
                        <div className="flex gap-2">
                            {esPendienteYo && (
                                <>
                                    <button
                                        onClick={() => setConfirming("rechazar")}
                                        className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98]"
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={onAceptar}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Aceptar
                                    </button>
                                </>
                            )}
                            {esPendienteEllos && (
                                <>
                                    <button onClick={onClose}
                                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => setConfirming("cancelar")}
                                        className="flex-1 py-3 rounded-xl border-2 border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50 transition-colors active:scale-[0.98]"
                                    >
                                        Cancelar oferta
                                    </button>
                                </>
                            )}
                            {esActiva && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        router.push(`/intercambio/${oferta.id}`);
                                    }}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.98]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Gestionar intercambio
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfertaCard({ oferta, onClick }: { oferta: OfertaCompleta; onClick: () => void }) {
    const esPendienteYo = oferta.estado === "pendiente_yo";
    const esPendienteEllos = oferta.estado === "pendiente_ellos";

    const borderColor = esPendienteYo ? "border-sky-200" : esPendienteEllos ? "border-gray-200" : "border-emerald-200";
    const dotColor = esPendienteYo ? "bg-sky-500" : esPendienteEllos ? "bg-amber-400" : "bg-emerald-500";

    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl border-2 ${borderColor} shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] overflow-hidden`}
        >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-600 text-sm flex-shrink-0">
                    {oferta.usuarioAvatar}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{oferta.usuarioNombre}</p>
                    <p className="text-xs text-gray-400">{oferta.usuarioCiudad} · {timeAgo(oferta.fecha)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${dotColor} ${esPendienteYo ? "animate-pulse" : ""}`} />
                    <span className={`text-[10px] font-black uppercase tracking-wide
                        ${esPendienteYo ? "text-sky-600" : esPendienteEllos ? "text-gray-500" : "text-emerald-600"}`}>
                        {esPendienteYo ? "Esperando" : esPendienteEllos ? "Enviada" : "Activa"}
                    </span>
                </div>
            </div>

            <div className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-wide mb-1">Recibís</p>
                    <div className="flex flex-wrap gap-1">
                        {oferta.figuritasQueRecibo.slice(0, 3).map(id => (
                            <StickerPill key={id} id={id} color="sky" />
                        ))}
                        {oferta.figuritasQueRecibo.length > 3 && (
                            <span className="text-[11px] text-gray-400 font-semibold">+{oferta.figuritasQueRecibo.length - 3}</span>
                        )}
                    </div>
                </div>

                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>

                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide mb-1">Entregás</p>
                    <div className="flex flex-wrap gap-1">
                        {oferta.figuritasQueEntrego.slice(0, 3).map(id => (
                            <StickerPill key={id} id={id} color="amber" />
                        ))}
                        {oferta.figuritasQueEntrego.length > 3 && (
                            <span className="text-[11px] text-gray-400 font-semibold">+{oferta.figuritasQueEntrego.length - 3}</span>
                        )}
                    </div>
                </div>

                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
    return (
        <div className="text-center py-12">
            <div className="text-5xl mb-3">{emoji}</div>
            <p className="font-bold text-gray-700 mb-1">{title}</p>
            <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "info" | "warning" }) {
    const bg = type === "success" ? "bg-emerald-500" : type === "warning" ? "bg-orange-500" : "bg-sky-500";
    return (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] ${bg} text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2`}>
            {type === "success" ? "✅" : type === "warning" ? "⚠️" : "ℹ️"}
            {message}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "recibidas" | "enviadas" | "activas";

export default function OfertasPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("recibidas");
    const [ofertas, setOfertas] = useState<OfertaCompleta[]>(() => getOfertas());
    const [selected, setSelected] = useState<OfertaCompleta | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
    const [showHistorial, setShowHistorial] = useState(false);

    const showToast = (message: string, type: "success" | "info" | "warning") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const refresh = useCallback(() => setOfertas(getOfertas()), []);

    const handleAceptar = useCallback(() => {
        if (!selected) return;
        aceptarOferta(selected.id);
        refresh();
        setSelected(null);
        showToast("¡Oferta aceptada! Las figuritas se actualizaron.", "success");
        setTab("activas");
    }, [selected, refresh]);

    const handleRechazar = useCallback(() => {
        if (!selected) return;
        rechazarOferta(selected.id);
        refresh();
        setSelected(null);
        showToast("Oferta rechazada.", "warning");
    }, [selected, refresh]);

    const handleCancelar = useCallback(() => {
        if (!selected) return;
        cancelarOferta(selected.id);
        refresh();
        setSelected(null);
        showToast("Oferta cancelada.", "info");
    }, [selected, refresh]);

    const recibidas = ofertas.filter(o => o.estado === "pendiente_yo");
    const enviadas = ofertas.filter(o => o.estado === "pendiente_ellos");
    const activas = ofertas.filter(o => o.estado === "activa");

    const currentList = tab === "recibidas" ? recibidas : tab === "enviadas" ? enviadas : activas;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="
                px-4 pt-20 pb-24
                lg:ml-64 lg:pt-8 lg:px-8 lg:pb-8
                xl:mr-72
            ">
                <div className="max-w-lg mx-auto lg:max-w-2xl lg:mx-auto">
                    {/* Header */}
                    <div className="mb-5 mt-2 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">🔄 Mis Ofertas</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Gestioná tus intercambios</p>
                        </div>
                        {/* Historial button */}
                        <button
                            onClick={() => setShowHistorial(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 font-black text-xs rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95 shadow-sm flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Historial
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {HISTORIAL_MOCK.length}
                            </span>
                        </button>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <button
                            onClick={() => setTab("recibidas")}
                            className={`rounded-2xl p-3.5 text-center transition-all border-2 ${tab === "recibidas" ? "bg-sky-500 border-sky-500 shadow-md shadow-sky-200" : "bg-white border-gray-100 hover:border-sky-200"}`}
                        >
                            <div className={`font-black text-2xl leading-none ${tab === "recibidas" ? "text-white" : "text-sky-600"}`}>{recibidas.length}</div>
                            <div className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${tab === "recibidas" ? "text-sky-100" : "text-gray-500"}`}>Recibidas</div>
                            {recibidas.length > 0 && tab !== "recibidas" && (
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse mx-auto mt-1" />
                            )}
                        </button>
                        <button
                            onClick={() => setTab("enviadas")}
                            className={`rounded-2xl p-3.5 text-center transition-all border-2 ${tab === "enviadas" ? "bg-amber-400 border-amber-400 shadow-md shadow-amber-200" : "bg-white border-gray-100 hover:border-amber-200"}`}
                        >
                            <div className={`font-black text-2xl leading-none ${tab === "enviadas" ? "text-amber-900" : "text-amber-600"}`}>{enviadas.length}</div>
                            <div className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${tab === "enviadas" ? "text-amber-800" : "text-gray-500"}`}>Enviadas</div>
                        </button>
                        <button
                            onClick={() => setTab("activas")}
                            className={`rounded-2xl p-3.5 text-center transition-all border-2 ${tab === "activas" ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200" : "bg-white border-gray-100 hover:border-emerald-200"}`}
                        >
                            <div className={`font-black text-2xl leading-none ${tab === "activas" ? "text-white" : "text-emerald-600"}`}>{activas.length}</div>
                            <div className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${tab === "activas" ? "text-emerald-100" : "text-gray-500"}`}>Activas</div>
                        </button>
                    </div>

                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${tab === "recibidas" ? "bg-sky-500" : tab === "enviadas" ? "bg-amber-400" : "bg-emerald-500"}`} />
                        <h2 className="font-black text-gray-800 text-sm">
                            {tab === "recibidas" && "Ofertas que te hicieron"}
                            {tab === "enviadas" && "Ofertas que enviaste"}
                            {tab === "activas" && "Intercambios aceptados"}
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">({currentList.length})</span>
                    </div>

                    {/* Context hints */}
                    {tab === "recibidas" && recibidas.length > 0 && (
                        <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 mb-4">
                            <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-sky-700 font-medium">Tocá una oferta para verla en detalle y aceptarla o rechazarla.</p>
                        </div>
                    )}
                    {tab === "enviadas" && enviadas.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-amber-700 font-medium">Esperando respuesta. Podés cancelar si ya no te interesa.</p>
                        </div>
                    )}
                    {tab === "activas" && activas.length > 0 && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-4">
                            <span className="text-sm">🤝</span>
                            <p className="text-xs text-emerald-700 font-medium">Intercambios aceptados por ambas partes. ¡Coordiná la entrega!</p>
                        </div>
                    )}

                    {/* List */}
                    {currentList.length === 0 ? (
                        tab === "recibidas" ? (
                            <EmptyState emoji="📬" title="Sin ofertas recibidas" subtitle="Cuando alguien te proponga un intercambio, aparecerá acá." />
                        ) : tab === "enviadas" ? (
                            <EmptyState emoji="📤" title="Sin ofertas enviadas" subtitle="Buscá usuarios en el feed y hacé tu primera oferta." />
                        ) : (
                            <EmptyState emoji="🤝" title="Sin intercambios activos" subtitle="Cuando aceptes o te acepten una oferta, aparecerá acá." />
                        )
                    ) : (
                        <div className="flex flex-col gap-3">
                            {currentList.map(oferta => (
                                <OfertaCard
                                    key={oferta.id}
                                    oferta={oferta}
                                    onClick={() => setSelected(oferta)}
                                />
                            ))}
                        </div>
                    )}

                    {/* CTA to feed */}
                    {tab !== "recibidas" && (
                        <button
                            onClick={() => router.push("/")}
                            className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Buscar más intercambios en el feed
                        </button>
                    )}
                </div>
            </main>

            {/* Detail modal (active offers) */}
            {selected && (
                <DetailModal
                    oferta={selected}
                    onClose={() => setSelected(null)}
                    onAceptar={handleAceptar}
                    onRechazar={handleRechazar}
                    onCancelar={handleCancelar}
                />
            )}

            {/* Historial sheet */}
            {showHistorial && (
                <HistorialSheet onClose={() => setShowHistorial(false)} />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
