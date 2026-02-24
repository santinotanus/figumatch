"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStore";
import Navbar from "@/components/Navbar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return `#${String(n).padStart(2, "0")}`; }

interface UsuarioData {
    _id: string; nombre: string; ciudad: string; avatar: string; foto?: string;
    premium?: boolean; zonas?: string[]; reputacion?: number; cambiosHechos?: number;
    repetidas: number[]; faltantes: number[]; especiales?: Record<string, number>;
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ nombre, foto, avatar, quiero, ofrezco, onConfirm, onCancel }: {
    nombre: string; foto?: string; avatar: string;
    quiero: number[]; ofrezco: number[];
    onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 pt-5 pb-6 flex-shrink-0">
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-base flex-shrink-0 overflow-hidden">
                            {foto ? <img src={foto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : avatar}
                        </div>
                        <div>
                            <p className="text-sky-100 text-xs font-medium">Propuesta de intercambio a</p>
                            <h2 className="text-white font-black text-lg leading-tight">{nombre}</h2>
                        </div>
                    </div>
                </div>
                <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">
                    <div className="flex gap-3 mb-5">
                        <div className="flex-1 bg-sky-50 border border-sky-100 rounded-xl p-3">
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-wide mb-2">Recibís ({quiero.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {quiero.map(n => <span key={n} className="text-xs font-bold text-sky-700">{fmt(n)}</span>)}
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
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide mb-2">Entregás ({ofrezco.length})</p>
                            <div className="flex flex-wrap gap-1">
                                {ofrezco.map(n => <span key={n} className="text-xs font-bold text-amber-700">{fmt(n)}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors active:scale-[0.98]">
                            Revisar
                        </button>
                        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sticker card ─────────────────────────────────────────────────────────────
function StickerCard({ num, especial, precio, selected, onClick, color }: {
    num: number; especial: boolean; precio: number;
    selected: boolean; onClick: () => void; color: "sky" | "amber";
}) {
    const ring = color === "sky" ? "border-sky-500 bg-sky-50 shadow-sky-100" : "border-amber-400 bg-amber-50 shadow-amber-100";
    const numBg = selected ? (color === "sky" ? "bg-sky-500 text-white" : "bg-amber-400 text-amber-900") : (especial ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500");
    const check = color === "sky" ? "bg-sky-500 border-sky-500" : "bg-amber-400 border-amber-400";

    return (
        <button onClick={onClick}
            className={`relative w-full text-left rounded-xl border-2 p-3 transition-all duration-150 active:scale-[0.98]
                ${selected ? `${ring} shadow-md` : especial ? "border-amber-200 bg-amber-50/50 hover:border-amber-300" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
            <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? check : "border-gray-300 bg-white"}`}>
                {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div className="flex items-center gap-3 pr-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm transition-all ${numBg}`}>
                    {fmt(num)}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">{fmt(num)}</span>
                    {especial && (
                        <span className="text-[10px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">⭐×{precio}</span>
                    )}
                </div>
            </div>
        </button>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ step, title, subtitle, count, color, children }: {
    step: number; title: string; subtitle: string; count: number;
    color: "sky" | "amber"; children: React.ReactNode;
}) {
    const stepBg = color === "sky" ? "bg-sky-500" : "bg-amber-400";
    const stepText = color === "sky" ? "text-white" : "text-amber-900";
    const countBg = color === "sky" ? "bg-sky-500 text-white" : "bg-amber-400 text-amber-900";
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${stepBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-black ${stepText}`}>{step}</span>
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900 text-sm leading-tight">{title}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
                    </div>
                </div>
                {count > 0 && (
                    <div className={`${countBg} text-xs font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>{count}</div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-2">{children}</div>
        </div>
    );
}

// ─── Offer bar ────────────────────────────────────────────────────────────────
function OfferBar({ quiero, ofrezco, esValido, valorQuiero, valorOfrezco, onEnviar }: {
    quiero: number[]; ofrezco: number[]; esValido: boolean;
    valorQuiero: number; valorOfrezco: number; onEnviar: () => void;
}) {
    const diff = valorQuiero - valorOfrezco;
    return (
        <div className="fixed bottom-16 left-0 right-0 z-[60] lg:bottom-0 lg:left-64 xl:right-72">
            {(quiero.length > 0 || ofrezco.length > 0) && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                    {quiero.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Recibís:</span>
                            {quiero.map(n => <span key={n} className="text-[11px] bg-sky-100 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 font-semibold whitespace-nowrap">{fmt(n)}</span>)}
                        </div>
                    )}
                    {quiero.length > 0 && ofrezco.length > 0 && (
                        <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    )}
                    {ofrezco.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Entregás:</span>
                            {ofrezco.map(n => <span key={n} className="text-[11px] bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold whitespace-nowrap">{fmt(n)}</span>)}
                        </div>
                    )}
                </div>
            )}
            <div className="bg-white border-t border-gray-100 shadow-xl px-4 py-3">
                <div className="max-w-lg mx-auto lg:max-w-2xl">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Recibís: <strong className="text-sky-600 font-black">{valorQuiero}</strong></span>
                            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span className="text-xs text-gray-500">Entregás: <strong className="text-amber-600 font-black">{valorOfrezco}</strong></span>
                        </div>
                        {quiero.length > 0 && ofrezco.length > 0 && (
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${esValido ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-600"}`}>
                                {esValido ? "✓ Equilibrado" : diff > 0 ? `Falta valor ${diff}` : `Sobra valor ${Math.abs(diff)}`}
                            </span>
                        )}
                    </div>
                    <button onClick={onEnviar} disabled={!esValido}
                        className={`w-full font-black py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2
                            ${esValido ? "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-200 active:scale-[0.98]"
                            : quiero.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-amber-50 text-amber-600 border-2 border-amber-200 cursor-not-allowed"}`}>
                        {esValido ? (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Enviar oferta</>)
                            : quiero.length === 0 ? "Seleccioná figuritas que querés recibir"
                            : ofrezco.length === 0 ? "Ahora seleccioná qué le ofrecés"
                            : diff > 0 ? `Necesitás ofrecer ${diff} punto${diff !== 1 ? "s" : ""} más`
                            : `Sobran ${Math.abs(diff)} punto${Math.abs(diff) !== 1 ? "s" : ""} de valor`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ nombre, quiero, ofrezco, onBack }: {
    nombre: string; quiero: number[]; ofrezco: number[]; onBack: () => void;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 lg:ml-64 xl:mr-72">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-sky-200">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 text-2xl">🏆</div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mt-4 mb-1">¡Oferta enviada!</h2>
                    <p className="text-gray-500 text-sm">Le propusiste a <strong className="text-gray-700">{nombre}</strong> este intercambio</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                    <div className="p-4 border-b border-gray-50">
                        <p className="text-xs font-black text-sky-600 uppercase tracking-wide mb-2">Vos recibís ({quiero.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                            {quiero.map(n => <span key={n} className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded-lg px-2.5 py-1 font-semibold">{fmt(n)}</span>)}
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-xs font-black text-amber-600 uppercase tracking-wide mb-2">Vos entregás ({ofrezco.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                            {ofrezco.map(n => <span key={n} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2.5 py-1 font-semibold">{fmt(n)}</span>)}
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-xl p-3 mb-5">
                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-sky-700 font-medium">{nombre} recibirá tu propuesta y podrá aceptarla o rechazarla.</p>
                </div>
                <button onClick={onBack} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black py-3.5 rounded-xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98]">
                    Volver al feed
                </button>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
interface Props { params: Promise<{ id: string }>; }

export default function UsuarioDetallePage({ params }: Props) {
    const router = useRouter();
    const { id } = use(params);

    const [usuario, setUsuario] = useState<UsuarioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [miYo, setMiYo] = useState<{ mongoId: string; repetidas: number[]; faltantes: number[]; especiales: Record<string, number> } | null>(null);

    const [figuritasQueQuiero, setFiguritasQueQuiero] = useState<number[]>([]);
    const [figuritasQueOfrezco, setFiguritasQueOfrezco] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [ofertaEnviada, setOfertaEnviada] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const session = getOnboardingData();
        const mongoId = session.mongoId ?? "";
        if (!mongoId) { setLoading(false); return; }

        Promise.all([
            fetch(`/api/usuarios/${id}`).then(r => r.json()),
            fetch(`/api/usuarios/${mongoId}`).then(r => r.json()),
        ]).then(([uData, yoData]) => {
            if (uData.error) { setLoading(false); return; }
            setUsuario({
                ...uData,
                repetidas: (uData.repetidas ?? []).map(Number).filter((n: number) => !isNaN(n)),
                faltantes: (uData.faltantes ?? []).map(Number).filter((n: number) => !isNaN(n)),
            });
            setMiYo({
                mongoId,
                repetidas: (yoData.repetidas ?? []).map(Number).filter((n: number) => !isNaN(n)),
                faltantes: (yoData.faltantes ?? []).map(Number).filter((n: number) => !isNaN(n)),
                especiales: yoData.especiales
                    ? Object.fromEntries(Object.entries(yoData.especiales).map(([k, v]) => [k, v as number]))
                    : {},
            });
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center lg:ml-64 xl:mr-72">
                <svg className="w-8 h-8 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center lg:ml-64 xl:mr-72">
                <div className="text-center px-4">
                    <div className="text-5xl mb-4">🤷</div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Usuario no encontrado</h2>
                    <button onClick={() => router.back()} className="text-sky-600 font-semibold text-sm">← Volver</button>
                </div>
            </div>
        );
    }

    // Cruce real: sus repetidas que yo necesito
    const susRepQueNecesito = [...new Set(usuario.repetidas.filter(n => miYo?.faltantes.includes(n) ?? false))].sort((a, b) => a - b);
    // Mis repetidas que él necesita
    const misRepQueNecesita = [...new Set((miYo?.repetidas ?? []).filter(n => usuario.faltantes.includes(n)))].sort((a, b) => a - b);

    const isPremium = usuario.premium === true;

    const getPrecio = (n: number) => miYo?.especiales?.[String(n)] ?? 1;
    const isEspecial = (n: number) => !!miYo?.especiales?.[String(n)];

    const toggleQuiero = (n: number) =>
        setFiguritasQueQuiero(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
    const toggleOfrezco = (n: number) =>
        setFiguritasQueOfrezco(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

    const valorQuiero = figuritasQueQuiero.reduce((s, n) => {
        // El precio de lo que recibo es lo que el OTRO marcó como especial
        const susEspeciales = usuario.especiales ?? {};
        return s + (susEspeciales[String(n)] ?? 1);
    }, 0);
    const valorOfrezco = figuritasQueOfrezco.reduce((s, n) => s + getPrecio(n), 0);
    const esValido = figuritasQueQuiero.length > 0 && valorQuiero === valorOfrezco;

    const handleConfirm = async () => {
        if (!miYo) return;
        setEnviando(true);
        await fetch("/api/ofertas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                remitenteId: miYo.mongoId,
                destinatarioId: usuario._id,
                figuritasRemitente: figuritasQueOfrezco,  // lo que YO ofrezco
                figuritasDestino: figuritasQueQuiero,     // lo que YO quiero de él
            }),
        });
        setEnviando(false);
        setShowConfirm(false);
        setOfertaEnviada(true);
    };

    if (ofertaEnviada) {
        return (
            <SuccessScreen
                nombre={usuario.nombre}
                quiero={figuritasQueQuiero}
                ofrezco={figuritasQueOfrezco}
                onBack={() => router.push("/feed")}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-lg mx-auto px-4 pt-20 pb-56 lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-12 lg:pb-8 xl:mr-72">
                <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold mt-4 mb-5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Volver al feed
                </button>

                {/* User hero */}
                <div className={`rounded-2xl p-5 mb-6 relative overflow-hidden ${isPremium ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md shadow-amber-200" : "bg-gradient-to-r from-sky-500 to-sky-600 shadow-lg shadow-sky-200"}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/usuario-perfil/${usuario._id}`)} className="relative w-14 h-14 rounded-full flex-shrink-0 group overflow-hidden">
                            {usuario.foto ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={usuario.foto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center font-black text-xl text-white ring-2 ring-white/30 group-hover:ring-white/70 transition-all">
                                    {usuario.avatar}
                                </div>
                            )}
                            {isPremium && <span className="absolute -top-2.5 -right-1 text-[15px]">👑</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className={`font-black text-xl leading-tight truncate ${isPremium ? "text-amber-900" : "text-white"}`}>{usuario.nombre}</h1>
                            <p className={`text-sm truncate ${isPremium ? "text-amber-800" : "text-sky-100"}`}>📍 {usuario.ciudad}</p>
                            {usuario.reputacion && usuario.reputacion > 0 ? (
                                <p className={`text-xs mt-0.5 ${isPremium ? "text-amber-700" : "text-sky-200"}`}>★ {usuario.reputacion.toFixed(1)} · {usuario.cambiosHechos ?? 0} canjes</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 text-center">
                            <div className={`font-black text-xl leading-none ${isPremium ? "text-amber-900" : "text-white"}`}>{susRepQueNecesito.length}</div>
                            <div className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${isPremium ? "text-amber-700" : "text-sky-100"}`}>matches</div>
                        </div>
                        <div className="flex-1 bg-amber-400 rounded-xl px-3 py-2 text-center">
                            <div className="text-amber-900 font-black text-xl leading-none">{misRepQueNecesita.length}</div>
                            <div className="text-amber-800 text-[10px] font-semibold uppercase tracking-wide mt-0.5">puedo dar</div>
                        </div>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
                    <Section step={1} title="Elegí lo que querés recibir" subtitle={`${susRepQueNecesito.length} figuritas disponibles`} count={figuritasQueQuiero.length} color="sky">
                        {susRepQueNecesito.length === 0 ? (
                            <div className="py-6 text-center"><div className="text-3xl mb-2">😕</div><p className="text-sm text-gray-400 font-medium">No hay figuritas en común</p></div>
                        ) : susRepQueNecesito.map(n => {
                            const susEsp = usuario.especiales ?? {};
                            const esEsp = !!susEsp[String(n)];
                            const prec = susEsp[String(n)] ?? 1;
                            return (
                                <StickerCard key={n} num={n} especial={esEsp} precio={prec}
                                    selected={figuritasQueQuiero.includes(n)}
                                    onClick={() => toggleQuiero(n)} color="sky" />
                            );
                        })}
                    </Section>

                    <Section step={2} title="Elegí lo que le ofrecés" subtitle={`${misRepQueNecesita.length} figuritas que le faltan`} count={figuritasQueOfrezco.length} color="amber">
                        {misRepQueNecesita.length === 0 ? (
                            <div className="py-6 text-center"><div className="text-3xl mb-2">📦</div><p className="text-sm text-gray-400 font-medium">No tenés repetidas que le falten</p></div>
                        ) : misRepQueNecesita.map(n => (
                            <StickerCard key={n} num={n} especial={isEspecial(n)} precio={getPrecio(n)}
                                selected={figuritasQueOfrezco.includes(n)}
                                onClick={() => toggleOfrezco(n)} color="amber" />
                        ))}
                    </Section>
                </div>
            </main>

            <OfferBar quiero={figuritasQueQuiero} ofrezco={figuritasQueOfrezco}
                esValido={esValido} valorQuiero={valorQuiero} valorOfrezco={valorOfrezco}
                onEnviar={() => setShowConfirm(true)} />

            {showConfirm && (
                <ConfirmModal
                    nombre={usuario.nombre} foto={usuario.foto} avatar={usuario.avatar}
                    quiero={figuritasQueQuiero} ofrezco={figuritasQueOfrezco}
                    onConfirm={enviando ? () => {} : handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
}
