"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStore";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Encuentro {
    lugar: string; fecha: string; hora: string;
    comentario?: string;
    propuestoPor: "yo" | "ellos";       // calculado en cliente
    propuestoPorNombre: string;          // guardado en BD — nombre real de quien propuso
    esContraoferta: boolean;             // true si ya había un encuentro previo
    aceptado: boolean;
}

interface OfertaData {
    id: string;
    usuarioId: string; usuarioNombre: string; usuarioFoto?: string;
    usuarioAvatar: string; usuarioCiudad: string;
    figuritasQueRecibo: number[]; figuritasQueEntrego: number[];
    estado: string; encuentro?: Encuentro | null;
    yoSoyRemitente: boolean;
    yoConfirme: boolean;
    otroConfirmo: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return `#${String(n).padStart(2, "0")}`; }


function fmtFecha(fecha: string) {
    return new Date(fecha + "T12:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
    });
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                    onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)} className="transition-transform active:scale-90">
                    <svg className={`w-10 h-10 transition-colors ${n <= (hover || value) ? "text-amber-400" : "text-gray-200"}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

const RATING_LABELS: Record<number, { emoji: string; text: string }> = {
    1: { emoji: "😞", text: "Muy malo" }, 2: { emoji: "😕", text: "Regular" },
    3: { emoji: "😐", text: "Bien" }, 4: { emoji: "😊", text: "Muy bien" },
    5: { emoji: "🤩", text: "¡Excelente!" },
};

// ─── Safety modal ─────────────────────────────────────────────────────────────
const TIPS = [
    { icon: "👥", titulo: "Lugar con gente", texto: "Elegí siempre un espacio público con mucha gente: una plaza, un centro comercial, una cafetería conocida o una estación de transporte." },
    { icon: "☀️", titulo: "Horario diurno", texto: "Preferí encontrarte de día. Si sólo podés a la tarde/noche, asegurate de que el lugar esté bien iluminado y concurrido." },
    { icon: "📲", titulo: "Avisale a alguien", texto: "Contale a un familiar o amigo dónde vas, con quién y a qué hora. Un mensaje es suficiente." },
    { icon: "🚫", titulo: "Nunca en domicilios", texto: "Evitá intercambiar en casas particulares de personas que no conocés. Si el otro insiste, es una señal de alerta." },
    { icon: "⚠️", titulo: "FiguMatch no garantiza la asistencia", texto: "La app facilita el contacto, pero no puede asegurar que la otra persona se presente al encuentro." },
    { icon: "🤝", titulo: "Confiá en tu instinto", texto: "Si algo no te cierra antes o durante el encuentro, tenés todo el derecho de cancelar. Tu seguridad siempre es primero." },
];

function SafetyModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 pt-5 pb-6 flex-shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">⚠️</span>
                            <div>
                                <h2 className="text-white font-black text-lg leading-tight">Consejos de seguridad</h2>
                                <p className="text-amber-100 text-xs mt-0.5">Para que el intercambio sea seguro para todos</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
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
                <div className="px-5 pb-6 pt-3 flex-shrink-0 border-t border-gray-100">
                    <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm shadow-md shadow-amber-200 hover:from-amber-500 hover:to-orange-600 transition-all active:scale-[0.98]">
                        ¡Entendido! 👍
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Sticker row ──────────────────────────────────────────────────────────────
function StickerRow({ num }: { num: number }) {
    return (
        <div className="flex items-center gap-2 py-1.5">
            <span className="text-sm font-bold text-gray-700">{fmt(num)}</span>
        </div>
    );
}

// ─── Formulario de propuesta ──────────────────────────────────────────────────
function FormularioPropuesta({ titulo, initLugar = "", initFecha = "", initHora = "", initComentario = "", onConfirmar, onCancelar }: {
    titulo: string; initLugar?: string; initFecha?: string; initHora?: string; initComentario?: string;
    onConfirmar: (e: { lugar: string; fecha: string; hora: string; comentario?: string }) => Promise<void>;
    onCancelar?: () => void;
}) {
    const [lugar, setLugar] = useState(initLugar);
    const [fecha, setFecha] = useState(initFecha);
    const [hora, setHora] = useState(initHora);
    const [comentario, setComentario] = useState(initComentario);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSafety, setShowSafety] = useState(false);
    // Calcular hoy en el cliente para evitar mismatch SSR
    const [hoy, setHoy] = useState("");
    useEffect(() => { setHoy(new Date().toISOString().split("T")[0]); }, []);

    const submit = async () => {
        if (!lugar.trim()) { setErr("Ingresá un lugar."); return; }
        if (!fecha) { setErr("Elegí una fecha."); return; }
        if (!hora) { setErr("Elegí un horario."); return; }
        setErr("");
        setLoading(true);
        try {
            await onConfirmar({ lugar: lugar.trim(), fecha, hora, comentario: comentario.trim() || undefined });
        } catch {
            setErr("Ocurrió un error. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showSafety && <SafetyModal onClose={() => setShowSafety(false)} />}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-gray-700 font-black text-sm">{titulo}</p>
                    <button onClick={() => setShowSafety(true)} title="Consejos de seguridad"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all"
                        style={{ animation: "safety-glow 2.5s ease-in-out infinite" }}>
                        <span className="text-lg leading-none">⚠️</span>
                    </button>
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">📍 Lugar</label>
                    <input type="text" value={lugar} onChange={e => { setLugar(e.target.value); setErr(""); }}
                        placeholder="Ej: Obelisco, Starbucks Palermo..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">📅 Fecha</label>
                        <input type="date" value={fecha} min={hoy} onChange={e => { setFecha(e.target.value); setErr(""); }}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">🕐 Horario</label>
                        <input type="time" value={hora} onChange={e => { setHora(e.target.value); setErr(""); }}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">💬 Aclaración <span className="font-normal text-gray-400 normal-case">(opcional)</span></label>
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                        placeholder="Ej: en la entrada del Patio Bullrich, frente a la caja 3..." rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none" />
                </div>
                {err && <p className="text-red-500 text-xs font-semibold bg-red-50 rounded-xl px-4 py-2.5">⚠️ {err}</p>}
                <div className="flex gap-2">
                    {onCancelar && (
                        <button onClick={onCancelar} disabled={loading} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
                    )}
                    <button onClick={submit} disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? (
                            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enviando...</>
                        ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Confirmar propuesta</>
                        )}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes safety-glow {
                    0%, 100% { box-shadow: 0 0 8px rgba(251,191,36,0.4); border-color: rgb(252 211 77); }
                    50% { box-shadow: 0 0 20px rgba(251,191,36,0.85); border-color: rgb(245 158 11); }
                }
            `}</style>
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IntercambioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [oferta, setOferta] = useState<OfertaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mongoId, setMongoId] = useState("");
    const mongoIdRef = useRef("");

    const [contraoferta, setContraoferta] = useState(false);
    const [showSafetyConfirmado, setShowSafetyConfirmado] = useState(false);
    const [showCancelarModal, setShowCancelarModal] = useState(false);
    const [showRealizadoModal, setShowRealizadoModal] = useState(false); // paso 1: ¿lo realizamos?
    const [showRatingModal, setShowRatingModal] = useState(false);       // paso 2: puntuar
    const [rating, setRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [yoRatingDado, setYoRatingDado] = useState(false);

    // Cargar oferta desde API
    const cargar = useCallback(async (uid: string, esRecarga = false) => {
        // Mandar el token de Firebase para que el servidor identifique al usuario real
        const token = await auth.currentUser?.getIdToken().catch(() => null);
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/ofertas/${id}?uid=${uid}`, { headers }).then(r => r.json());
        if (res.error) { if (!esRecarga) setLoading(false); return; }

        const rem = res.remitenteId;
        const dest = res.destinatarioId;
        // Usar el mongoId resuelto por el servidor (más confiable que el localStorage)
        const myId = res._myMongoId || uid;
        const yoSoyRemitente = String(rem._id ?? rem) === myId;
        const otro = yoSoyRemitente ? dest : rem;

        // El servidor ya calculó propuestoPorMi y propuestoPorNombre — no comparamos IDs acá
        let encuentro = res.encuentro ?? null;
        if (encuentro && encuentro.lugar) {
            encuentro = {
                ...encuentro,
                propuestoPor: encuentro.propuestoPorMi ? "yo" : "ellos",
                propuestoPorNombre: encuentro.propuestoPorNombre || (encuentro.propuestoPorMi ? "Vos" : otro.nombre),
                esContraoferta: encuentro.esContraoferta ?? false,
            };
        } else {
            encuentro = null;
        }

        setOferta({
            id: String(res._id),
            usuarioId: String(otro._id ?? otro),
            usuarioNombre: otro.nombre ?? "Usuario",
            usuarioFoto: otro.foto ?? "",
            usuarioAvatar: otro.avatar ?? String(otro.nombre ?? "??").slice(0, 2).toUpperCase(),
            usuarioCiudad: otro.ciudad ?? "",
            figuritasQueRecibo: yoSoyRemitente
                ? (res.figuritasDestino ?? []).map(Number)
                : (res.figuritasRemitente ?? []).map(Number),
            figuritasQueEntrego: yoSoyRemitente
                ? (res.figuritasRemitente ?? []).map(Number)
                : (res.figuritasDestino ?? []).map(Number),
            estado: res.estado,
            encuentro,
            yoSoyRemitente,
            yoConfirme: !!res.yoConfirme,
            otroConfirmo: !!res.otroConfirmo,
        });
        if (!esRecarga) setLoading(false);
    }, [id]);

    useEffect(() => {
        const session = getOnboardingData();
        const uid = session.mongoId ?? "";
        setMongoId(uid);
        mongoIdRef.current = uid;
        if (!uid) { setLoading(false); return; }
        cargar(uid);
    }, [cargar]);

    // Cuando la oferta pasa a "completada" y el usuario no punteó, abrir modal de rating
    useEffect(() => {
        if (oferta?.estado === "completada" && !yoRatingDado) {
            setShowRatingModal(true);
        }
    }, [oferta?.estado, yoRatingDado]);

    const patch = useCallback(async (body: Record<string, unknown>) => {
        // Esperar a que Firebase restaure la sesión si currentUser todavía es null
        let currentUser = auth.currentUser;
        if (!currentUser) {
            currentUser = await new Promise((resolve) => {
                const unsub = auth.onAuthStateChanged((u) => { unsub(); resolve(u); });
            });
        }
        console.log("[patch] currentUser:", currentUser?.email, currentUser?.uid);
        const token = await currentUser?.getIdToken();
        console.log("[patch] token presente:", !!token);
        if (!token) throw new Error("No hay sesión activa");

        const res = await fetch(`/api/ofertas/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            console.error("PATCH error:", res.status, text);
            throw new Error(`Error ${res.status}: ${text}`);
        }
        await cargar(mongoIdRef.current, true);
    }, [id, cargar]);

    const handlePropuesta = useCallback(async ({ lugar, fecha, hora, comentario }: { lugar: string; fecha: string; hora: string; comentario?: string }) => {
        const yaHabiaEncuentro = !!oferta?.encuentro;
        await patch({
            encuentro: {
                lugar, fecha, hora, comentario,
                esContraoferta: yaHabiaEncuentro,
                aceptado: false,
            },
        });
        setContraoferta(false);
    }, [patch, oferta]);

    const handleAceptar = useCallback(async () => {
        if (!oferta?.encuentro) return;
        const { propuestoPor: _a, propuestoPorMi: _b, propuestoPorNombre: _c, esContraoferta: _d, ...encRaw } =
            oferta.encuentro as typeof oferta.encuentro & { propuestoPor?: string; propuestoPorMi?: boolean; propuestoPorNombre?: string; esContraoferta?: boolean };
        void _a; void _b; void _c; void _d;
        // No mandamos uid acá — no queremos reasignar propuestoPorId al aceptar
        await patch({ encuentro: { ...encRaw, aceptado: true } });
    }, [patch, oferta]);

    const handleCancelar = useCallback(async () => {
        await patch({ estado: "cancelada" });
        router.replace("/ofertas");
    }, [patch, router]);

    // Paso 1: confirmar que el intercambio se realizó (sin rating)
    const handleConfirmarRealizado = useCallback(async () => {
        setRatingLoading(true);
        const token = await auth.currentUser?.getIdToken().catch(() => null);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        await fetch(`/api/ofertas/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ accion: "confirmarRealizado", rating: 0 }),
        });
        setRatingLoading(false);
        setShowRealizadoModal(false);
        // Recargar — si el otro ya confirmó, mostrará el modal de rating automáticamente
        await cargar(mongoIdRef.current, true);
    }, [id, cargar]);

    // Paso 2: puntuar (solo aparece cuando estaCompletada)
    const handleEnviarRating = useCallback(async () => {
        if (rating === 0) { setShowRatingModal(false); setYoRatingDado(true); return; }
        setRatingLoading(true);
        const token = await auth.currentUser?.getIdToken().catch(() => null);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        await fetch(`/api/ofertas/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ accion: "actualizarRating", rating }),
        });
        setRatingLoading(false);
        setShowRatingModal(false);
        setYoRatingDado(true);
        setRating(0);
    }, [rating, id]);

    // ── Loading / Not found ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Navbar />
                <svg className="w-8 h-8 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

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
    const estaCancelada = oferta.estado === "cancelada" || oferta.estado === "rechazada";
    const estaCompletada = oferta.estado === "completada";
    const esperandoOtro = oferta.yoConfirme && !oferta.otroConfirmo && !estaCompletada;

    // Modal de rating (reutilizable en cualquier pantalla)
    const modalRating = showRatingModal ? (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 pt-6 pb-5 text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <h2 className="font-black text-white text-lg">¡Intercambio completado!</h2>
                    <p className="text-emerald-100 text-xs mt-1">Ambos confirmaron. Puntuá a {oferta.usuarioNombre.split(" ")[0]} (opcional)</p>
                </div>
                <div className="px-6 pt-5 pb-2">
                    <StarPicker value={rating} onChange={setRating} />
                    {rating > 0 ? (
                        <div className="mt-3 text-center">
                            <span className="text-2xl">{RATING_LABELS[rating].emoji}</span>
                            <p className="text-gray-700 font-black text-sm mt-1">{RATING_LABELS[rating].text}</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 text-xs mt-2">Tocá una estrella para puntuar</p>
                    )}
                </div>
                <div className="px-6 py-5 flex flex-col gap-2">
                    <button onClick={handleEnviarRating} disabled={ratingLoading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                        {ratingLoading
                            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enviando...</>
                            : rating > 0 ? "Enviar puntuación →" : "Confirmar sin puntuar →"
                        }
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    // Pantallas de estado final
    if (estaCancelada || esperandoOtro || (estaCompletada && yoRatingDado)) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen px-4 lg:ml-64 xl:mr-72">
                    <div className="text-center max-w-xs">
                        <div className="text-6xl mb-4">
                            {estaCompletada ? "🏆" : esperandoOtro ? "⏳" : "😔"}
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">
                            {estaCompletada ? "¡Intercambio completado!" : esperandoOtro ? "Vos ya confirmaste" : "Intercambio cancelado"}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {estaCompletada
                                ? <>Ambos confirmaron el intercambio con <strong className="text-gray-700">{oferta.usuarioNombre}</strong>. ¡Las figuritas ya se actualizaron en tu álbum!</>
                                : esperandoOtro
                                    ? <>Esperando que <strong className="text-gray-700">{oferta.usuarioNombre}</strong> confirme también que realizaron el intercambio.</>
                                    : "Este intercambio fue cancelado y ya no está activo."}
                        </p>
                        <button onClick={() => router.replace(estaCompletada ? "/feed" : "/ofertas")}
                            className={`w-full py-3 rounded-xl text-white font-black text-sm shadow-md ${estaCompletada ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-sky-500 to-sky-600"}`}>
                            {estaCompletada ? "Volver al feed" : "Ver mis ofertas"}
                        </button>
                    </div>
                </div>
                {modalRating}
            </div>
        );
    }

    // Pantalla: completada pero todavía no punteó → mostrar solo el modal de rating sobre fondo
    if (estaCompletada && !yoRatingDado) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                {modalRating}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="px-4 pt-20 pb-24 max-w-lg mx-auto lg:ml-64 lg:max-w-none lg:mx-0 lg:pt-8 lg:pb-8 lg:px-8 xl:mr-72">
                <div className="lg:max-w-2xl lg:mx-auto">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm mb-4 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Volver a mis ofertas
                    </button>

                    {/* Hero */}
                    <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-3xl p-6 mb-5 shadow-xl shadow-emerald-200 relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <button onClick={() => router.push(`/usuario-perfil/${oferta.usuarioId}`)}
                                    className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/30 hover:ring-white/70 active:scale-95 transition-all">
                                    {oferta.usuarioFoto ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={oferta.usuarioFoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
                                            {oferta.usuarioAvatar}
                                        </div>
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-emerald-100 text-xs font-medium">Intercambio activo con</p>
                                    <h1 className="text-white font-black text-xl leading-tight truncate">{oferta.usuarioNombre}</h1>
                                    <p className="text-emerald-100 text-xs">{oferta.usuarioCiudad}</p>
                                </div>
                                <div className="text-3xl">🤝</div>
                            </div>
                            {confirmado && (
                                <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white font-bold text-sm">Encuentro coordinado ✅</span>
                                </div>
                            )}
                            {propuestaEllos && enc && (
                                <div className="bg-amber-400/30 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white font-bold text-sm">
                                        {enc.esContraoferta
                                            ? `${enc.propuestoPorNombre || oferta.usuarioNombre} hizo una contraoferta`
                                            : `${enc.propuestoPorNombre || oferta.usuarioNombre} propone un encuentro`}
                                    </span>
                                </div>
                            )}
                            {propuestaMia && enc && (
                                <div className="bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-sky-300 animate-pulse flex-shrink-0" />
                                    <span className="text-white/80 font-semibold text-sm">
                                        {enc.esContraoferta
                                            ? `Tu contraoferta está esperando respuesta…`
                                            : `Tu propuesta está esperando respuesta…`}
                                    </span>
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

                    {/* Resumen figuritas */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-[11px] font-black text-sky-600 uppercase tracking-wide mb-2">Recibís ({oferta.figuritasQueRecibo.length})</p>
                            <div className="divide-y divide-gray-50">
                                {oferta.figuritasQueRecibo.map(n => <StickerRow key={n} num={n} />)}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide mb-2">Entregás ({oferta.figuritasQueEntrego.length})</p>
                            <div className="divide-y divide-gray-50">
                                {oferta.figuritasQueEntrego.map(n => <StickerRow key={n} num={n} />)}
                            </div>
                        </div>
                    </div>

                    {/* CASO A: Confirmado */}
                    {confirmado && enc && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-emerald-700 font-black text-xs uppercase tracking-wide">✅ Encuentro confirmado</p>
                                <button onClick={() => setShowSafetyConfirmado(true)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all"
                                    style={{ animation: "safety-glow 2.5s ease-in-out infinite" }}>
                                    <span className="text-base leading-none">⚠️</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {[{ icon: "📍", label: enc.lugar }, { icon: "📅", label: fmtFecha(enc.fecha) }, { icon: "🕐", label: `${enc.hora} hs` }].map(({ icon, label }) => (
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
                            <button onClick={() => setContraoferta(true)} className="mt-4 w-full py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors">
                                ✏️ Proponer cambio
                            </button>
                            {contraoferta && (
                                <div className="mt-4 pt-4 border-t border-emerald-200">
                                    <FormularioPropuesta titulo="Proponer nuevo horario / lugar"
                                        initLugar={enc.lugar} initFecha={enc.fecha} initHora={enc.hora}
                                        onConfirmar={handlePropuesta} onCancelar={() => setContraoferta(false)} />
                                </div>
                            )}
                            {showSafetyConfirmado && <SafetyModal onClose={() => setShowSafetyConfirmado(false)} />}
                        </div>
                    )}

                    {/* CASO B: El otro propuso */}
                    {propuestaEllos && enc && !contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">{enc.esContraoferta ? "↩️" : "📬"}</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">
                                        {enc.esContraoferta
                                            ? `${enc.propuestoPorNombre || oferta.usuarioNombre} hizo una contraoferta`
                                            : `${enc.propuestoPorNombre || oferta.usuarioNombre} propone este encuentro`}
                                    </h2>
                                    <p className="text-gray-400 text-xs">Podés aceptar o hacerle una contraoferta</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                                <div className="flex flex-col gap-2.5">
                                    {[{ icon: "📍", label: enc.lugar }, { icon: "📅", label: fmtFecha(enc.fecha) }, { icon: "🕐", label: `${enc.hora} hs` }].map(({ icon, label }) => (
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
                                <button onClick={() => setContraoferta(true)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors active:scale-[0.98]">↩️ Contraoferta</button>
                                <button onClick={handleAceptar} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    )}

                    {propuestaEllos && contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0"><span className="text-base">↩️</span></div>
                                <h2 className="font-black text-gray-900 text-sm">Tu contraoferta</h2>
                            </div>
                            <FormularioPropuesta titulo="Cambiá lo que no te cierre y confirmá"
                                initLugar={enc?.lugar} initFecha={enc?.fecha} initHora={enc?.hora}
                                onConfirmar={handlePropuesta} onCancelar={() => setContraoferta(false)} />
                        </div>
                    )}

                    {/* CASO C: Yo propuse */}
                    {propuestaMia && enc && !contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0"><span className="text-base">⏳</span></div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">
                                        {enc.esContraoferta ? "Tu contraoferta enviada" : "Tu propuesta enviada"}
                                    </h2>
                                    <p className="text-gray-400 text-xs">Esperando que {oferta.usuarioNombre.split(" ")[0]} responda</p>
                                </div>
                            </div>
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-4">
                                <div className="flex flex-col gap-2.5">
                                    {[{ icon: "📍", label: enc.lugar }, { icon: "📅", label: fmtFecha(enc.fecha) }, { icon: "🕐", label: `${enc.hora} hs` }].map(({ icon, label }) => (
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
                            <button onClick={() => setContraoferta(true)} className="w-full py-2.5 rounded-xl border-2 border-sky-200 text-sky-700 font-bold text-sm hover:bg-sky-50 transition-colors">
                                ✏️ Cambiar mi propuesta
                            </button>
                        </div>
                    )}

                    {propuestaMia && enc && contraoferta && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0"><span className="text-base">✏️</span></div>
                                <h2 className="font-black text-gray-900 text-sm">Cambiar mi propuesta</h2>
                            </div>
                            <FormularioPropuesta titulo="Actualizá tu propuesta"
                                initLugar={enc.lugar} initFecha={enc.fecha} initHora={enc.hora}
                                onConfirmar={handlePropuesta} onCancelar={() => setContraoferta(false)} />
                        </div>
                    )}

                    {/* CASO D: Sin propuesta */}
                    {!enc && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0"><span className="text-base">📅</span></div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">Coordinar encuentro</h2>
                                    <p className="text-gray-400 text-xs">Ninguno propuso un lugar todavía. ¡Sé el primero!</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 mb-5">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-gray-500 text-xs">{oferta.usuarioNombre.split(" ")[0]} todavía no hizo ninguna propuesta.</p>
                            </div>
                            <FormularioPropuesta titulo="Proponé un lugar y horario" onConfirmar={handlePropuesta} />
                        </div>
                    )}

                    {/* Acciones finales */}
                    <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col gap-3">
                        {confirmado && (
                            <button onClick={() => setShowRealizadoModal(true)}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                Intercambio realizado ✅
                            </button>
                        )}
                        <button onClick={() => setShowCancelarModal(true)}
                            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar intercambio
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal paso 1: ¿realizaron el intercambio? */}
            {showRealizadoModal && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRealizadoModal(false)} />
                    <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
                        <div className="px-6 pt-6 pb-2 text-center">
                            <div className="text-5xl mb-3">🤝</div>
                            <h2 className="font-black text-gray-900 text-lg">¿Realizaron el intercambio?</h2>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                Confirmá que ya canjearon las figuritas con <strong>{oferta.usuarioNombre}</strong>.
                                {oferta.otroConfirmo && (
                                    <span className="block mt-2 text-emerald-600 font-bold">✅ {oferta.usuarioNombre} ya confirmó su parte.</span>
                                )}
                            </p>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-2">
                            <button onClick={handleConfirmarRealizado} disabled={ratingLoading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                                {ratingLoading
                                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Confirmando...</>
                                    : "✅ Sí, lo realizamos"
                                }
                            </button>
                            <button onClick={() => setShowRealizadoModal(false)} disabled={ratingLoading}
                                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                No, todavía no
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal paso 2: puntuar */}
            {modalRating}

            {/* Modal: cancelar */}
            {showCancelarModal && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelarModal(false)} />
                    <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
                        <div className="px-6 pt-6 pb-2 text-center">
                            <div className="text-5xl mb-3">😟</div>
                            <h2 className="font-black text-gray-900 text-lg">¿Cancelar intercambio?</h2>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">Se cancelará el intercambio con <strong>{oferta.usuarioNombre}</strong>. Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-2">
                            <button onClick={handleCancelar} className="w-full py-3.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors active:scale-[0.98]">Sí, cancelar intercambio</button>
                            <button onClick={() => setShowCancelarModal(false)} className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">No, volver</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
