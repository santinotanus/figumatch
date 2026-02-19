"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FIGURITAS_MAP } from "@/lib/mockData";
import { getOfertaById, setEncuentro, aceptarEncuentro, cancelarOferta } from "@/lib/ofertasStore";
import { isEspecial, getPrecio } from "@/lib/especialesStore";
import { Encuentro } from "@/types";
import Navbar from "@/components/Navbar";

const FLAG: Record<string, string> = {
    Argentina: "🇦🇷", Brasil: "🇧🇷", Francia: "🇫🇷", España: "🇪🇸",
    Alemania: "🇩🇪", Portugal: "🇵🇹", Uruguay: "🇺🇾", Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", FIFA: "🌍",
};

const hoy = new Date().toISOString().split("T")[0];

function fmtFecha(fecha: string) {
    return new Date(fecha + "T12:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
    });
}

// ─── Safety tips modal ────────────────────────────────────────────────────────
const TIPS = [
    {
        icon: "👥",
        titulo: "Lugar con gente",
        texto: "Elegí siempre un espacio público con mucha gente: una plaza, un centro comercial, una cafetería conocida o una estación de transporte.",
    },
    {
        icon: "☀️",
        titulo: "Horario diurno",
        texto: "Preferí encontrarte de día. Si sólo podés a la tarde/noche, asegurate de que el lugar esté bien iluminado y concurrido.",
    },
    {
        icon: "📲",
        titulo: "Avisale a alguien",
        texto: "Contale a un familiar o amigo dónde vas, con quién y a qué hora. Un mensaje es suficiente.",
    },
    {
        icon: "🚫",
        titulo: "Nunca en domicilios",
        texto: "Evitá intercambiar en casas particulares de personas que no conocés. Si el otro insiste, es una señal de alerta.",
    },
    {
        icon: "💳",
        titulo: "Sin dinero suelto",
        texto: "Llevá sólo las figuritas acordadas. No muestres efectivo ni objetos de valor innecesarios.",
    },
    {
        icon: "🤝",
        titulo: "Confiá en tu instinto",
        texto: "Si algo no te cierra antes o durante el encuentro, tenés todo el derecho de cancelar. Tu seguridad siempre es primero.",
    },
];

function SafetyModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Drag pill (mobile) */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0 sm:hidden flex-shrink-0" />

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 pt-5 pb-6 flex-shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">⚠️</span>
                            <div>
                                <h2 className="text-white font-black text-lg leading-tight">Consejos de seguridad</h2>
                                <p className="text-amber-100 text-xs mt-0.5">Para que el intercambio sea seguro para todos</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0 mt-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tips list */}
                <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
                    {TIPS.map(tip => (
                        <div key={tip.icon} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                            <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                            <div>
                                <p className="font-black text-gray-900 text-sm">{tip.titulo}</p>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{tip.texto}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 pb-6 pt-3 flex-shrink-0 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm shadow-md shadow-amber-200 hover:from-amber-500 hover:to-orange-600 transition-all active:scale-[0.98]"
                    >
                        ¡Entendido! 👍
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Sticker row ──────────────────────────────────────────────────────────────
function StickerRow({ id }: { id: string }) {
    const fig = FIGURITAS_MAP[id];
    const especial = isEspecial(id);
    return (
        <div className="flex items-center gap-2 py-1.5">
            <span className="text-base">{FLAG[fig?.pais] || "🌍"}</span>
            <span className="text-sm font-semibold text-gray-800 flex-1 truncate">
                #{fig?.numero} {fig?.nombre}
            </span>
            {especial && (
                <span className="text-[10px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                    ⭐×{getPrecio(id)}
                </span>
            )}
        </div>
    );
}

// ─── Formulario de propuesta ──────────────────────────────────────────────────
function FormularioPropuesta({
    titulo,
    initLugar = "",
    initFecha = "",
    initHora = "",
    initComentario = "",
    onConfirmar,
    onCancelar,
}: {
    titulo: string;
    initLugar?: string;
    initFecha?: string;
    initHora?: string;
    initComentario?: string;
    onConfirmar: (e: { lugar: string; fecha: string; hora: string; comentario?: string }) => void;
    onCancelar?: () => void;
}) {
    const [lugar, setLugar] = useState(initLugar);
    const [fecha, setFecha] = useState(initFecha);
    const [hora, setHora] = useState(initHora);
    const [comentario, setComentario] = useState(initComentario);
    const [err, setErr] = useState("");
    const [showSafety, setShowSafety] = useState(false);

    const submit = () => {
        if (!lugar.trim()) { setErr("Ingresá un lugar."); return; }
        if (!fecha) { setErr("Elegí una fecha."); return; }
        if (!hora) { setErr("Elegí un horario."); return; }
        setErr("");
        onConfirmar({ lugar: lugar.trim(), fecha, hora, comentario: comentario.trim() || undefined });
    };

    return (
        <>
            {showSafety && <SafetyModal onClose={() => setShowSafety(false)} />}

            <div className="flex flex-col gap-4">
                {/* Título + botón de seguridad */}
                <div className="flex items-center justify-between gap-2">
                    <p className="text-gray-700 font-black text-sm">{titulo}</p>
                    <button
                        onClick={() => setShowSafety(true)}
                        title="Consejos de seguridad"
                        className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full
                            bg-amber-50 border-2 border-amber-300
                            hover:bg-amber-100 active:scale-95 transition-all duration-150
                            shadow-[0_0_10px_rgba(251,191,36,0.5)]
                            hover:shadow-[0_0_18px_rgba(251,191,36,0.8)]
                            animate-pulse-slow"
                        style={{ animation: "safety-glow 2.5s ease-in-out infinite" }}
                    >
                        <span className="text-lg leading-none">⚠️</span>
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">📍 Lugar</label>
                    <input
                        type="text"
                        value={lugar}
                        onChange={e => { setLugar(e.target.value); setErr(""); }}
                        placeholder="Ej: Obelisco, Starbucks Palermo, Plaza San Martín..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">📅 Fecha</label>
                        <input
                            type="date" value={fecha} min={hoy}
                            onChange={e => { setFecha(e.target.value); setErr(""); }}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">🕐 Horario</label>
                        <input
                            type="time" value={hora}
                            onChange={e => { setHora(e.target.value); setErr(""); }}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Campo de comentario opcional */}
                <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">
                        💬 Aclaración <span className="font-normal text-gray-400 normal-case">(opcional)</span>
                    </label>
                    <textarea
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                        placeholder="Ej: en la entrada del Patio Bullrich, frente a la caja 3..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                    />
                </div>

                {err && (
                    <p className="text-red-500 text-xs font-semibold bg-red-50 rounded-xl px-4 py-2.5">⚠️ {err}</p>
                )}

                <div className="flex gap-2">
                    {onCancelar && (
                        <button
                            onClick={onCancelar}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={submit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar propuesta
                    </button>
                </div>
            </div>

            {/* Keyframe for the glow pulse */}
            <style>{`
                @keyframes safety-glow {
                    0%, 100% {
                        box-shadow: 0 0 8px rgba(251,191,36,0.4);
                        border-color: rgb(252 211 77);
                    }
                    50% {
                        box-shadow: 0 0 20px rgba(251,191,36,0.85), 0 0 6px rgba(251,191,36,0.4);
                        border-color: rgb(245 158 11);
                    }
                }
            `}</style>
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IntercambioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [oferta, setOferta] = useState(() => getOfertaById(id));
    const [contraoferta, setContraoferta] = useState(false);
    const [showSafetyConfirmado, setShowSafetyConfirmado] = useState(false);
    const [showCancelarModal, setShowCancelarModal] = useState(false);

    const refresh = useCallback(() => setOferta(getOfertaById(id)), [id]);

    const handlePropuesta = useCallback(({ lugar, fecha, hora, comentario }: { lugar: string; fecha: string; hora: string; comentario?: string }) => {
        const enc: Encuentro = { lugar, fecha, hora, comentario, propuestoPor: "yo", aceptado: false };
        setEncuentro(id, enc);
        setContraoferta(false);
        refresh();
    }, [id, refresh]);

    const handleAceptar = useCallback(() => {
        aceptarEncuentro(id);
        refresh();
    }, [id, refresh]);

    const handleCancelar = useCallback(() => {
        cancelarOferta(id);
        router.replace("/ofertas");
    }, [id, router]);

    if (!oferta) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Navbar />
                <div className="text-center px-4">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-gray-500 font-semibold">Intercambio no encontrado</p>
                    <button onClick={() => router.back()} className="mt-4 text-sky-500 font-bold text-sm">← Volver</button>
                </div>
            </div>
        );
    }

    const enc = oferta.encuentro;
    const propuestaEllos = enc && enc.propuestoPor === "ellos" && !enc.aceptado;
    const propuestaMia = enc && enc.propuestoPor === "yo" && !enc.aceptado;
    const confirmado = enc && enc.aceptado;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="
                px-4 pt-20 pb-24
                max-w-lg mx-auto
                lg:ml-64 lg:max-w-none lg:mx-0 lg:pt-8 lg:pb-8 lg:px-8
                xl:mr-72
            ">
                {/* Centered wrapper for desktop */}
                <div className="lg:max-w-2xl lg:mx-auto">

                    {/* Back */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a mis ofertas
                    </button>

                    {/* ── Hero ── */}
                    <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-3xl p-6 mb-5 shadow-xl shadow-emerald-200 relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <button
                                    onClick={() => router.push(`/usuario-perfil/${oferta.usuarioId}`)}
                                    title={`Ver perfil de ${oferta.usuarioNombre}`}
                                    className="relative w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl ring-2 ring-white/30 flex-shrink-0 hover:ring-white/70 hover:bg-white/30 active:scale-95 transition-all duration-150 group"
                                >
                                    {oferta.usuarioAvatar}
                                    {/* Eye hint */}
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-emerald-100 text-xs font-medium">Intercambio activo con</p>
                                    <h1 className="text-white font-black text-xl leading-tight truncate">{oferta.usuarioNombre}</h1>
                                    <p className="text-emerald-100 text-xs">{oferta.usuarioCiudad}</p>
                                </div>
                                <div className="text-3xl">🤝</div>
                            </div>

                            {/* Status pill */}
                            {confirmado && (
                                <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white font-bold text-sm">Encuentro coordinado ✅</span>
                                </div>
                            )}
                            {propuestaEllos && (
                                <div className="bg-amber-400/30 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white font-bold text-sm">
                                        {oferta.usuarioNombre.split(" ")[0]} propuso un encuentro
                                    </span>
                                </div>
                            )}
                            {propuestaMia && (
                                <div className="bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-sky-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white/80 font-semibold text-sm">Esperando respuesta de {oferta.usuarioNombre.split(" ")[0]}…</span>
                                </div>
                            )}
                            {!enc && (
                                <div className="bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                    <span className="text-white/70 font-semibold text-sm">Sin encuentro coordinado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Resumen figuritas ── */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-black text-sky-600 uppercase tracking-wide">
                                    Recibís ({oferta.figuritasQueRecibo.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {oferta.figuritasQueRecibo.map(fid => <StickerRow key={fid} id={fid} />)}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                                    Entregás ({oferta.figuritasQueEntrego.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {oferta.figuritasQueEntrego.map(fid => <StickerRow key={fid} id={fid} />)}
                            </div>
                        </div>
                    </div>

                    {/* ── Sección del encuentro ── */}

                    {/* CASO A: Confirmado */}
                    {confirmado && enc && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 mb-4">
                            {/* Header row: title + safety button */}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-emerald-700 font-black text-xs uppercase tracking-wide">✅ Encuentro confirmado</p>
                                <button
                                    onClick={() => setShowSafetyConfirmado(true)}
                                    title="Consejos de seguridad"
                                    className="w-8 h-8 flex items-center justify-center rounded-full
                                        bg-amber-50 border-2 border-amber-300
                                        hover:bg-amber-100 active:scale-95 transition-all"
                                    style={{ animation: "safety-glow 2.5s ease-in-out infinite" }}
                                >
                                    <span className="text-base leading-none">⚠️</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: "📍", label: enc.lugar },
                                    { icon: "📅", label: fmtFecha(enc.fecha) },
                                    { icon: "🕐", label: `${enc.hora} hs` },
                                ].map(({ icon, label }) => (
                                    <div key={icon} className="flex items-center gap-3">
                                        <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
                                        <span className="text-gray-900 font-semibold text-sm">{label}</span>
                                    </div>
                                ))}
                                {enc.comentario && (
                                    <div className="flex items-start gap-3 mt-1 bg-emerald-100/60 rounded-xl px-3 py-2">
                                        <span className="text-lg w-7 text-center flex-shrink-0">💬</span>
                                        <span className="text-gray-700 text-sm italic">{enc.comentario}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setContraoferta(true)}
                                className="mt-4 w-full py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors"
                            >
                                ✏️ Proponer cambio
                            </button>
                            {contraoferta && (
                                <div className="mt-4 pt-4 border-t border-emerald-200">
                                    <FormularioPropuesta
                                        titulo="Proponer nuevo horario / lugar"
                                        initLugar={enc.lugar} initFecha={enc.fecha} initHora={enc.hora}
                                        onConfirmar={handlePropuesta}
                                        onCancelar={() => setContraoferta(false)}
                                    />
                                </div>
                            )}
                            {showSafetyConfirmado && <SafetyModal onClose={() => setShowSafetyConfirmado(false)} />}
                        </div>
                    )}

                    {/* CASO B: El otro usuario propuso algo */}
                    {propuestaEllos && enc && !contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">📬</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">
                                        {oferta.usuarioNombre.split(" ")[0]} propone este encuentro
                                    </h2>
                                    <p className="text-gray-400 text-xs">Podés aceptar o hacerle una contraoferta</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { icon: "📍", label: enc.lugar },
                                        { icon: "📅", label: fmtFecha(enc.fecha) },
                                        { icon: "🕐", label: `${enc.hora} hs` },
                                    ].map(({ icon, label }) => (
                                        <div key={icon} className="flex items-center gap-3">
                                            <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
                                            <span className="text-gray-900 font-semibold text-sm">{label}</span>
                                        </div>
                                    ))}
                                    {enc.comentario && (
                                        <div className="flex items-start gap-3 mt-1 bg-amber-100/60 rounded-xl px-3 py-2">
                                            <span className="text-base w-6 text-center flex-shrink-0">💬</span>
                                            <span className="text-gray-700 text-sm italic">{enc.comentario}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setContraoferta(true)}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors active:scale-[0.98]"
                                >
                                    ↩️ Contraoferta
                                </button>
                                <button
                                    onClick={handleAceptar}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Formulario de contraoferta cuando ellos propusieron */}
                    {propuestaEllos && contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">↩️</span>
                                </div>
                                <h2 className="font-black text-gray-900 text-sm">Tu contraoferta</h2>
                            </div>
                            <FormularioPropuesta
                                titulo="Cambiá lo que no te cierre y confirmá"
                                initLugar={enc?.lugar} initFecha={enc?.fecha} initHora={enc?.hora}
                                onConfirmar={handlePropuesta}
                                onCancelar={() => setContraoferta(false)}
                            />
                        </div>
                    )}

                    {/* CASO C: Yo ya propuse, esperando */}
                    {propuestaMia && enc && !contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">⏳</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">Tu propuesta enviada</h2>
                                    <p className="text-gray-400 text-xs">
                                        Esperando que {oferta.usuarioNombre.split(" ")[0]} responda
                                    </p>
                                </div>
                            </div>
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-4">
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { icon: "📍", label: enc.lugar },
                                        { icon: "📅", label: fmtFecha(enc.fecha) },
                                        { icon: "🕐", label: `${enc.hora} hs` },
                                    ].map(({ icon, label }) => (
                                        <div key={icon} className="flex items-center gap-3">
                                            <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
                                            <span className="text-gray-900 font-semibold text-sm">{label}</span>
                                        </div>
                                    ))}
                                    {enc.comentario && (
                                        <div className="flex items-start gap-3 mt-1 bg-sky-100/60 rounded-xl px-3 py-2">
                                            <span className="text-base w-6 text-center flex-shrink-0">💬</span>
                                            <span className="text-gray-700 text-sm italic">{enc.comentario}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setContraoferta(true)}
                                className="w-full py-2.5 rounded-xl border-2 border-sky-200 text-sky-700 font-bold text-sm hover:bg-sky-50 transition-colors"
                            >
                                ✏️ Cambiar mi propuesta
                            </button>
                            {contraoferta && (
                                <div className="mt-4 pt-4 border-t border-sky-200">
                                    <FormularioPropuesta
                                        titulo="Actualizá tu propuesta"
                                        initLugar={enc.lugar} initFecha={enc.fecha} initHora={enc.hora}
                                        onConfirmar={handlePropuesta}
                                        onCancelar={() => setContraoferta(false)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* CASO D: Sin propuesta aún */}
                    {!enc && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">📅</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">Coordinar encuentro</h2>
                                    <p className="text-gray-400 text-xs">Ninguno propuso un lugar todavía. ¡Sé el primero!</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 mb-5">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 text-xs">
                                    {oferta.usuarioNombre.split(" ")[0]} todavía no hizo ninguna propuesta.
                                </p>
                            </div>

                            <FormularioPropuesta
                                titulo="Proponé un lugar y horario"
                                onConfirmar={handlePropuesta}
                                initComentario=""
                            />
                        </div>
                    )}

                    {/* ── Cancelar intercambio ── */}
                    <div className="mt-6 pt-5 border-t border-gray-200">
                        <button
                            onClick={() => setShowCancelarModal(true)}
                            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar intercambio
                        </button>
                    </div>

                </div>
            </main>

            {/* ── Modal confirmar cancelación ── */}
            {showCancelarModal && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelarModal(false)} />
                    <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
                        <div className="px-6 pt-6 pb-2 text-center">
                            <div className="text-5xl mb-3">😟</div>
                            <h2 className="font-black text-gray-900 text-lg">¿Cancelar intercambio?</h2>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                Se cancelará el intercambio con <strong>{oferta.usuarioNombre}</strong>. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-2">
                            <button
                                onClick={handleCancelar}
                                className="w-full py-3.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors active:scale-[0.98]"
                            >
                                Sí, cancelar intercambio
                            </button>
                            <button
                                onClick={() => setShowCancelarModal(false)}
                                className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                No, volver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
