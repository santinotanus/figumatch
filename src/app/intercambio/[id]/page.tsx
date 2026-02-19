"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FIGURITAS_MAP } from "@/lib/mockData";
import { getOfertaById, setEncuentro, aceptarEncuentro } from "@/lib/ofertasStore";
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

// ─── Formulario de propuesta (crear o contraoferta) ───────────────────────────
function FormularioPropuesta({
    titulo,
    initLugar = "",
    initFecha = "",
    initHora = "",
    onConfirmar,
    onCancelar,
}: {
    titulo: string;
    initLugar?: string;
    initFecha?: string;
    initHora?: string;
    onConfirmar: (e: { lugar: string; fecha: string; hora: string }) => void;
    onCancelar?: () => void;
}) {
    const [lugar, setLugar] = useState(initLugar);
    const [fecha, setFecha] = useState(initFecha);
    const [hora, setHora] = useState(initHora);
    const [err, setErr] = useState("");

    const submit = () => {
        if (!lugar.trim()) { setErr("Ingresá un lugar."); return; }
        if (!fecha) { setErr("Elegí una fecha."); return; }
        if (!hora) { setErr("Elegí un horario."); return; }
        setErr("");
        onConfirmar({ lugar: lugar.trim(), fecha, hora });
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-gray-700 font-black text-sm">{titulo}</p>

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

            {err && (
                <p className="text-red-500 text-xs font-semibold bg-red-50 rounded-xl px-4 py-2.5">⚠️ {err}</p>
            )}

            <div className={`flex gap-2 ${onCancelar ? "" : ""}`}>
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
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IntercambioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [oferta, setOferta] = useState(() => getOfertaById(id));
    const [contraoferta, setContraoferta] = useState(false);

    const refresh = useCallback(() => setOferta(getOfertaById(id)), [id]);

    const handlePropuesta = useCallback(({ lugar, fecha, hora }: { lugar: string; fecha: string; hora: string }) => {
        const enc: Encuentro = { lugar, fecha, hora, propuestoPor: "yo", aceptado: false };
        setEncuentro(id, enc);
        setContraoferta(false);
        refresh();
    }, [id, refresh]);

    const handleAceptar = useCallback(() => {
        aceptarEncuentro(id);
        refresh();
    }, [id, refresh]);

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
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl ring-2 ring-white/30 flex-shrink-0">
                                    {oferta.usuarioAvatar}
                                </div>
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
                            <p className="text-emerald-700 font-black text-xs uppercase tracking-wide mb-4">✅ Encuentro confirmado</p>
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

                            {/* Detalle de la propuesta */}
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
                            />
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
