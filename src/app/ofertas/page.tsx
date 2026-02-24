"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStore";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type EstadoOferta = "pendiente_yo" | "pendiente_ellos" | "activa";

interface Encuentro {
    lugar: string; fecha: string; hora: string;
    comentario?: string; propuestoPor: "yo" | "ellos"; aceptado: boolean;
}

interface OfertaCompleta {
    id: string;
    usuarioId: string; usuarioNombre: string; usuarioFoto: string;
    usuarioAvatar: string; usuarioCiudad: string; usuarioReputacion: number;
    figuritasQueRecibo: number[]; figuritasQueEntrego: number[];
    estado: EstadoOferta; fecha: string; encuentro?: Encuentro | null;
}

interface CanjeHistorial {
    id: string; fecha: string;
    usuarioNombre: string; usuarioFoto: string; usuarioAvatar: string; usuarioCiudad: string;
    figuritasRecibidas: number[]; figuritasEntregadas: number[];
    lugar: string; horaEncuentro: string; rating: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

function fmt(n: number) { return `#${String(n).padStart(2, "0")}`; }

function fmtFecha(fecha: string) {
    return new Date(fecha + "T12:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
    });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ foto, avatar, size = "md" }: { foto?: string; avatar: string; size?: "sm" | "md" | "lg" }) {
    const cls = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
    if (foto) return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} referrerPolicy="no-referrer" />
    );
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-600 flex-shrink-0`}>
            {avatar}
        </div>
    );
}

// ─── Sticker pill ─────────────────────────────────────────────────────────────
function StickerPill({ num, color }: { num: number; color: "sky" | "amber" }) {
    const bg = color === "sky" ? "bg-sky-100 text-sky-700 border-sky-200" : "bg-amber-100 text-amber-700 border-amber-200";
    return (
        <span className={`inline-flex items-center text-[11px] border rounded-full px-2 py-0.5 font-semibold whitespace-nowrap ${bg}`}>
            {fmt(num)}
        </span>
    );
}

// ─── Star picker / display ────────────────────────────────────────────────────
const RATING_LABELS: Record<number, { emoji: string; text: string }> = {
    1: { emoji: "😞", text: "Muy malo" }, 2: { emoji: "😕", text: "Regular" },
    3: { emoji: "😐", text: "Bien" }, 4: { emoji: "😊", text: "Muy bien" },
    5: { emoji: "🤩", text: "¡Excelente!" },
};

function StarDisplay({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className={`w-4 h-4 ${n <= value ? "text-amber-400" : "text-gray-200"}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)} className="transition-transform active:scale-90">
                    <svg className={`w-9 h-9 transition-colors ${n <= (hover || value) ? "text-amber-400" : "text-gray-200"}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

// ─── Historial Card ───────────────────────────────────────────────────────────
function HistorialCard({ canje, onClick }: { canje: CanjeHistorial; onClick: () => void }) {
    const sinPuntuar = canje.rating === 0;
    return (
        <button onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] overflow-hidden border-2 ${sinPuntuar ? "border-amber-300 border-dashed" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <Avatar foto={canje.usuarioFoto} avatar={canje.usuarioAvatar} />
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{canje.usuarioNombre}</p>
                    <p className="text-xs text-gray-400 truncate">{canje.usuarioCiudad}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {sinPuntuar ? (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 uppercase tracking-wide">⭐ Sin puntuar</span>
                    ) : (
                        <>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-wide">✅ Realizado</span>
                            <StarDisplay value={canje.rating} />
                        </>
                    )}
                </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-wide mb-1.5">Recibiste</p>
                    <div className="flex flex-wrap gap-1">
                        {canje.figuritasRecibidas.slice(0, 4).map(n => (
                            <span key={n} className="inline-flex items-center bg-sky-100 text-sky-700 border border-sky-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">{fmt(n)}</span>
                        ))}
                        {canje.figuritasRecibidas.length > 4 && <span className="text-[10px] text-gray-400 font-bold self-center">+{canje.figuritasRecibidas.length - 4}</span>}
                    </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide mb-1.5">Entregaste</p>
                    <div className="flex flex-wrap gap-1">
                        {canje.figuritasEntregadas.slice(0, 4).map(n => (
                            <span key={n} className="inline-flex items-center bg-amber-100 text-amber-700 border border-amber-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">{fmt(n)}</span>
                        ))}
                        {canje.figuritasEntregadas.length > 4 && <span className="text-[10px] text-gray-400 font-bold self-center">+{canje.figuritasEntregadas.length - 4}</span>}
                    </div>
                </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                {canje.lugar && <span className="text-[11px] text-gray-400">📍 {canje.lugar}</span>}
                {canje.lugar && <span className="text-gray-300">·</span>}
                <span className="text-[11px] text-gray-400">{timeAgo(canje.fecha)}</span>
            </div>
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

// ─── Historial Detail Modal ───────────────────────────────────────────────────
function HistorialDetailModal({ canje, onClose, onRated }: {
    canje: CanjeHistorial; onClose: () => void; onRated: (id: string, rating: number) => void;
}) {
    const sinPuntuar = canje.rating === 0;
    const [localRating, setLocalRating] = useState(canje.rating);
    const [guardado, setGuardado] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleGuardar = async () => {
        if (localRating === 0) return;
        setSaving(true);
        await fetch(`/api/ofertas/${canje.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating: localRating }),
        });
        setSaving(false);
        onRated(canje.id, localRating);
        setGuardado(true);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-0 sm:px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />
                <div className={`px-5 pt-5 pb-5 flex-shrink-0 ${sinPuntuar && !guardado ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-gradient-to-r from-emerald-500 to-teal-600"}`}>
                    <div className="flex items-center gap-3">
                        <Avatar foto={canje.usuarioFoto} avatar={canje.usuarioAvatar} size="lg" />
                        <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-medium">{sinPuntuar && !guardado ? "Puntuar canje con" : "Canje realizado con"}</p>
                            <h2 className="text-white font-black text-lg leading-tight truncate">{canje.usuarioNombre}</h2>
                            <p className="text-white/60 text-xs">{canje.usuarioCiudad}</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {(canje.lugar || canje.horaEncuentro) && (
                        <div className="mt-3 bg-white/15 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                            {canje.lugar && <div className="flex items-center gap-2 text-white text-xs"><span>📍</span><span className="font-semibold">{canje.lugar}</span></div>}
                            <div className="flex items-center gap-2 text-white/80 text-xs"><span>📅</span><span>{fmtFecha(canje.fecha.split("T")[0])}</span></div>
                            {canje.horaEncuentro && <div className="flex items-center gap-2 text-white/80 text-xs"><span>🕐</span><span>{canje.horaEncuentro} hs</span></div>}
                        </div>
                    )}
                </div>
                <div className="overflow-y-auto px-5 py-5 flex flex-col gap-4">
                    {sinPuntuar && !guardado ? (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-4 flex flex-col items-center gap-3">
                            <p className="font-black text-gray-900 text-sm text-center">¿Cómo fue el intercambio?</p>
                            <StarPicker value={localRating} onChange={setLocalRating} />
                            {localRating > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{RATING_LABELS[localRating].emoji}</span>
                                    <span className="font-black text-gray-800 text-sm">{RATING_LABELS[localRating].text}</span>
                                </div>
                            )}
                            <button onClick={handleGuardar} disabled={localRating === 0 || saving}
                                className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${localRating > 0 ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-md shadow-amber-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                                {saving ? "Guardando..." : "Guardar puntuación ⭐"}
                            </button>
                        </div>
                    ) : guardado ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <span className="text-3xl">{RATING_LABELS[localRating].emoji}</span>
                            <div><p className="font-black text-emerald-800 text-sm">¡Puntuación guardada!</p><StarDisplay value={localRating} /></div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <span className="text-3xl">{RATING_LABELS[canje.rating].emoji}</span>
                            <div><p className="font-black text-gray-900 text-sm">Tu puntuación: {RATING_LABELS[canje.rating].text}</p><StarDisplay value={canje.rating} /></div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-sky-50 border border-sky-100 rounded-xl p-3">
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-wide mb-2">Recibiste ({canje.figuritasRecibidas.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {canje.figuritasRecibidas.map(n => <span key={n} className="text-xs font-semibold text-sky-800">{fmt(n)}</span>)}
                            </div>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                        </div>
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide mb-2">Entregaste ({canje.figuritasEntregadas.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {canje.figuritasEntregadas.map(n => <span key={n} className="text-xs font-semibold text-amber-800">{fmt(n)}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-5 pb-6 pt-2 flex-shrink-0 border-t border-gray-100">
                    <button onClick={onClose} className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

// ─── Historial Sheet ──────────────────────────────────────────────────────────
function HistorialSheet({ mongoId, onClose }: { mongoId: string; onClose: () => void }) {
    const [historial, setHistorial] = useState<CanjeHistorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCanje, setSelectedCanje] = useState<CanjeHistorial | null>(null);

    useEffect(() => {
        fetch(`/api/ofertas/historial?usuarioId=${mongoId}`)
            .then(r => r.json())
            .then(data => setHistorial(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, [mongoId]);

    const handleRated = (id: string, rating: number) => {
        setHistorial(prev => prev.map(c => c.id === id ? { ...c, rating } : c));
        setSelectedCanje(prev => prev?.id === id ? { ...prev, rating } : prev);
    };

    const rated = historial.filter(c => c.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((acc, c) => acc + c.rating, 0) / rated.length).toFixed(1) : "—";

    return (
        <>
            <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center px-0 sm:px-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />
                    <div className="px-5 pt-4 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="font-black text-gray-900 text-lg">📚 Historial de canjes</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{historial.length} intercambios completados</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {!loading && (
                        <div className="flex gap-0 border-b border-gray-100 flex-shrink-0">
                            <div className="flex-1 text-center py-3"><p className="font-black text-emerald-600 text-xl">{historial.length}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Canjes</p></div>
                            <div className="w-px bg-gray-100" />
                            <div className="flex-1 text-center py-3"><p className="font-black text-sky-600 text-xl">{historial.reduce((a, c) => a + c.figuritasRecibidas.length, 0)}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Recibidas</p></div>
                            <div className="w-px bg-gray-100" />
                            <div className="flex-1 text-center py-3"><p className="font-black text-amber-500 text-xl">{historial.reduce((a, c) => a + c.figuritasEntregadas.length, 0)}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Entregadas</p></div>
                            <div className="w-px bg-gray-100" />
                            <div className="flex-1 text-center py-3"><p className="font-black text-amber-400 text-xl">{avgRating} ⭐</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Promedio</p></div>
                        </div>
                    )}
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <svg className="w-7 h-7 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                        ) : historial.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="font-bold text-gray-700">Sin historial aún</p>
                                <p className="text-sm text-gray-400 mt-1">Tus intercambios completados aparecerán acá.</p>
                            </div>
                        ) : (
                            historial.map(canje => (
                                <HistorialCard key={canje.id} canje={canje} onClick={() => setSelectedCanje(canje)} />
                            ))
                        )}
                    </div>
                </div>
            </div>
            {selectedCanje && (
                <HistorialDetailModal canje={selectedCanje} onClose={() => setSelectedCanje(null)} onRated={handleRated} />
            )}
        </>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ oferta, onClose, onAceptar, onRechazar, onCancelar }: {
    oferta: OfertaCompleta; onClose: () => void;
    onAceptar?: () => void; onRechazar?: () => void; onCancelar?: () => void;
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
                <div className={`px-5 pt-5 pb-5 ${esPendienteYo ? "bg-gradient-to-r from-sky-500 to-sky-600" : esPendienteEllos ? "bg-gradient-to-r from-gray-600 to-gray-700" : "bg-gradient-to-r from-emerald-500 to-emerald-600"}`}>
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <button onClick={() => { onClose(); router.push(`/usuario-perfil/${oferta.usuarioId}`); }}
                            className="relative flex-shrink-0 group" title={`Ver perfil de ${oferta.usuarioNombre}`}>
                            <Avatar foto={oferta.usuarioFoto} avatar={oferta.usuarioAvatar} size="lg" />
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
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-wide mb-2">Recibís ({oferta.figuritasQueRecibo.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {oferta.figuritasQueRecibo.map(n => <span key={n} className="text-xs font-semibold text-sky-800">{fmt(n)}</span>)}
                            </div>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                        </div>
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide mb-2">Entregás ({oferta.figuritasQueEntrego.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {oferta.figuritasQueEntrego.map(n => <span key={n} className="text-xs font-semibold text-amber-800">{fmt(n)}</span>)}
                            </div>
                        </div>
                    </div>
                    {confirming && (
                        <div className={`rounded-xl p-3 mb-3 ${confirming === "rechazar" ? "bg-red-50 border border-red-100" : "bg-orange-50 border border-orange-100"}`}>
                            <p className={`text-sm font-bold mb-2 ${confirming === "rechazar" ? "text-red-700" : "text-orange-700"}`}>
                                {confirming === "rechazar" ? "¿Rechazar esta oferta?" : "¿Cancelar esta oferta?"}
                            </p>
                            <p className={`text-xs mb-3 ${confirming === "rechazar" ? "text-red-600" : "text-orange-600"}`}>
                                {confirming === "rechazar" ? "El usuario será notificado de que rechazaste su propuesta." : "La oferta se eliminará y el usuario será notificado."}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirming(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50">Volver</button>
                                <button onClick={() => { if (confirming === "rechazar") onRechazar?.(); else onCancelar?.(); }}
                                    className={`flex-1 py-2 rounded-lg font-bold text-xs text-white ${confirming === "rechazar" ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}
                    {!confirming && (
                        <div className="flex gap-2">
                            {esPendienteYo && (<>
                                <button onClick={() => setConfirming("rechazar")} className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98]">Rechazar</button>
                                <button onClick={onAceptar} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Aceptar
                                </button>
                            </>)}
                            {esPendienteEllos && (<>
                                <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cerrar</button>
                                <button onClick={() => setConfirming("cancelar")} className="flex-1 py-3 rounded-xl border-2 border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50 transition-colors active:scale-[0.98]">Cancelar oferta</button>
                            </>)}
                            {esActiva && (
                                <button onClick={() => { onClose(); router.push(`/intercambio/${oferta.id}`); }}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.98]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
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
        <button onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl border-2 ${borderColor} shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] overflow-hidden`}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <Avatar foto={oferta.usuarioFoto} avatar={oferta.usuarioAvatar} />
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{oferta.usuarioNombre}</p>
                    <p className="text-xs text-gray-400">{oferta.usuarioCiudad} · {timeAgo(oferta.fecha)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${dotColor} ${esPendienteYo ? "animate-pulse" : ""}`} />
                    <span className={`text-[10px] font-black uppercase tracking-wide ${esPendienteYo ? "text-sky-600" : esPendienteEllos ? "text-gray-500" : "text-emerald-600"}`}>
                        {esPendienteYo ? "Esperando" : esPendienteEllos ? "Enviada" : "Activa"}
                    </span>
                </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-wide mb-1">Recibís</p>
                    <div className="flex flex-wrap gap-1">
                        {oferta.figuritasQueRecibo.slice(0, 3).map(n => <StickerPill key={n} num={n} color="sky" />)}
                        {oferta.figuritasQueRecibo.length > 3 && <span className="text-[11px] text-gray-400 font-semibold">+{oferta.figuritasQueRecibo.length - 3}</span>}
                    </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide mb-1">Entregás</p>
                    <div className="flex flex-wrap gap-1">
                        {oferta.figuritasQueEntrego.slice(0, 3).map(n => <StickerPill key={n} num={n} color="amber" />)}
                        {oferta.figuritasQueEntrego.length > 3 && <span className="text-[11px] text-gray-400 font-semibold">+{oferta.figuritasQueEntrego.length - 3}</span>}
                    </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}

// ─── Empty state / Toast ──────────────────────────────────────────────────────
function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
    return (
        <div className="text-center py-12">
            <div className="text-5xl mb-3">{emoji}</div>
            <p className="font-bold text-gray-700 mb-1">{title}</p>
            <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
    );
}

function Toast({ message, type }: { message: string; type: "success" | "info" | "warning" }) {
    const bg = type === "success" ? "bg-emerald-500" : type === "warning" ? "bg-orange-500" : "bg-sky-500";
    return (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] ${bg} text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2`}>
            {type === "success" ? "✅" : type === "warning" ? "⚠️" : "ℹ️"} {message}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "recibidas" | "enviadas" | "activas";

export default function OfertasPage() {
    const router = useRouter();
    const session = getOnboardingData();
    const mongoId = session.mongoId ?? "";

    const [tab, setTab] = useState<Tab>("recibidas");
    const [ofertas, setOfertas] = useState<OfertaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<OfertaCompleta | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
    const [showHistorial, setShowHistorial] = useState(false);
    const [historialCount, setHistorialCount] = useState(0);

    const showToast = (message: string, type: "success" | "info" | "warning") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const cargar = useCallback(() => {
        if (!mongoId) { setLoading(false); return; }
        fetch(`/api/ofertas?usuarioId=${mongoId}`)
            .then(r => r.json())
            .then(data => setOfertas(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, [mongoId]);

    // Cargar historial count
    useEffect(() => {
        if (!mongoId) return;
        fetch(`/api/ofertas/historial?usuarioId=${mongoId}`)
            .then(r => r.json())
            .then(data => setHistorialCount(Array.isArray(data) ? data.length : 0));
    }, [mongoId]);

    useEffect(() => { cargar(); }, [cargar]);

    const patchOferta = async (id: string, patch: Record<string, unknown>) => {
        await fetch(`/api/ofertas/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });
    };

    const handleAceptar = useCallback(async () => {
        if (!selected) return;
        await patchOferta(selected.id, { estado: "activa" });
        cargar();
        setSelected(null);
        showToast("¡Oferta aceptada!", "success");
        setTab("activas");
    }, [selected, cargar]);

    const handleRechazar = useCallback(async () => {
        if (!selected) return;
        await patchOferta(selected.id, { estado: "rechazada" });
        cargar();
        setSelected(null);
        showToast("Oferta rechazada.", "warning");
    }, [selected, cargar]);

    const handleCancelar = useCallback(async () => {
        if (!selected) return;
        await patchOferta(selected.id, { estado: "cancelada" });
        cargar();
        setSelected(null);
        showToast("Oferta cancelada.", "info");
    }, [selected, cargar]);

    const recibidas = ofertas.filter(o => o.estado === "pendiente_yo");
    const enviadas = ofertas.filter(o => o.estado === "pendiente_ellos");
    const activas = ofertas.filter(o => o.estado === "activa");
    const currentList = tab === "recibidas" ? recibidas : tab === "enviadas" ? enviadas : activas;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="px-4 pt-20 pb-24 lg:ml-64 lg:pt-8 lg:px-8 lg:pb-8 xl:mr-72">
                <div className="max-w-lg mx-auto lg:max-w-2xl lg:mx-auto">
                    {/* Header */}
                    <div className="mb-5 mt-2 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">🔄 Mis Ofertas</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Gestioná tus intercambios</p>
                        </div>
                        <button onClick={() => setShowHistorial(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 font-black text-xs rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95 shadow-sm flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Historial
                            {historialCount > 0 && (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">{historialCount}</span>
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <svg className="w-8 h-8 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    ) : (
                        <>
                            {/* Summary cards */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {(["recibidas", "enviadas", "activas"] as Tab[]).map(t => {
                                    const count = t === "recibidas" ? recibidas.length : t === "enviadas" ? enviadas.length : activas.length;
                                    const active = tab === t;
                                    const bg = active ? (t === "recibidas" ? "bg-sky-500 border-sky-500 shadow-md shadow-sky-200" : t === "enviadas" ? "bg-amber-400 border-amber-400 shadow-md shadow-amber-200" : "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200") : "bg-white border-gray-100 hover:border-sky-200";
                                    const numColor = active ? (t === "enviadas" ? "text-amber-900" : "text-white") : (t === "recibidas" ? "text-sky-600" : t === "enviadas" ? "text-amber-600" : "text-emerald-600");
                                    const lblColor = active ? (t === "enviadas" ? "text-amber-800" : t === "activas" ? "text-emerald-100" : "text-sky-100") : "text-gray-500";
                                    return (
                                        <button key={t} onClick={() => setTab(t)}
                                            className={`rounded-2xl p-3.5 text-center transition-all border-2 ${bg}`}>
                                            <div className={`font-black text-2xl leading-none ${numColor}`}>{count}</div>
                                            <div className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${lblColor}`}>
                                                {t === "recibidas" ? "Recibidas" : t === "enviadas" ? "Enviadas" : "Activas"}
                                            </div>
                                            {count > 0 && !active && t === "recibidas" && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse mx-auto mt-1" />
                                            )}
                                        </button>
                                    );
                                })}
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
                                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xs text-sky-700 font-medium">Tocá una oferta para verla en detalle y aceptarla o rechazarla.</p>
                                </div>
                            )}
                            {tab === "enviadas" && enviadas.length > 0 && (
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                                tab === "recibidas" ? <EmptyState emoji="📬" title="Sin ofertas recibidas" subtitle="Cuando alguien te proponga un intercambio, aparecerá acá." />
                                : tab === "enviadas" ? <EmptyState emoji="📤" title="Sin ofertas enviadas" subtitle="Buscá usuarios en el feed y hacé tu primera oferta." />
                                : <EmptyState emoji="🤝" title="Sin intercambios activos" subtitle="Cuando aceptes o te acepten una oferta, aparecerá acá." />
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {currentList.map(oferta => (
                                        <OfertaCard key={oferta.id} oferta={oferta} onClick={() => setSelected(oferta)} />
                                    ))}
                                </div>
                            )}

                            {tab !== "recibidas" && (
                                <button onClick={() => router.push("/feed")}
                                    className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Buscar más intercambios en el feed
                                </button>
                            )}
                        </>
                    )}
                </div>
            </main>

            {selected && (
                <DetailModal oferta={selected} onClose={() => setSelected(null)}
                    onAceptar={handleAceptar} onRechazar={handleRechazar} onCancelar={handleCancelar} />
            )}
            {showHistorial && <HistorialSheet mongoId={mongoId} onClose={() => setShowHistorial(false)} />}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
