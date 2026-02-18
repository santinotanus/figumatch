"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Figurita } from "@/types";
import {
    USUARIOS,
    MI_USUARIO,
    FIGURITAS_MAP,
    calcularMatches,
    calcularOfertasPosibles,
} from "@/lib/mockData";
import { getEspeciales, getPrecio, isEspecial } from "@/lib/especialesStore";
import Navbar from "@/components/Navbar";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FLAG: Record<string, string> = {
    Argentina: "🇦🇷", Brasil: "🇧🇷", Francia: "🇫🇷", España: "🇪🇸",
    Alemania: "🇩🇪", Portugal: "🇵🇹", Uruguay: "🇺🇾", Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", FIFA: "🌍",
};

// Calcula el valor total de un array de IDs (especiales valen N, normales 1)
function calcularValor(ids: string[]): number {
    return ids.reduce((sum, id) => sum + getPrecio(id), 0);
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({
    nombre,
    avatar,
    quiero,
    ofrezco,
    onConfirm,
    onCancel,
}: {
    nombre: string;
    avatar: string;
    quiero: string[];
    ofrezco: string[];
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 pt-5 pb-6">
                    {/* Drag handle (mobile) */}
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-base flex-shrink-0">
                            {avatar}
                        </div>
                        <div>
                            <p className="text-sky-100 text-xs font-medium">Propuesta de intercambio a</p>
                            <h2 className="text-white font-black text-lg leading-tight">{nombre}</h2>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4">
                    {/* Trade visual */}
                    <div className="flex gap-3 mb-5">
                        {/* Recibís */}
                        <div className="flex-1 bg-sky-50 border border-sky-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-wide">
                                    Recibís ({quiero.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {quiero.map(id => (
                                    <div key={id} className="flex items-center gap-1.5">
                                        <span className="text-sm">{FLAG[FIGURITAS_MAP[id]?.pais] || "🌍"}</span>
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                            #{FIGURITAS_MAP[id]?.numero} {FIGURITAS_MAP[id]?.nombre}
                                        </span>
                                    </div>
                                ))}
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

                        {/* Entregás */}
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">
                                    Entregás ({ofrezco.length})
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {ofrezco.map(id => (
                                    <div key={id} className="flex items-center gap-1.5">
                                        <span className="text-sm">{FLAG[FIGURITAS_MAP[id]?.pais] || "🌍"}</span>
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                            #{FIGURITAS_MAP[id]?.numero} {FIGURITAS_MAP[id]?.nombre}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 1x1 badge */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-xs font-black text-gray-400 px-2">
                            Intercambio {quiero.length}×{ofrezco.length} · Regla 1x1 ✓
                        </span>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors active:scale-[0.98]"
                        >
                            Revisar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
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

// ─── Mini sticker card ─────────────────────────────────────────────────────────────────
function StickerCard({
    fig,
    selected,
    onClick,
    color = "sky",
    onJustSelected,
}: {
    fig: Figurita;
    selected: boolean;
    onClick: () => void;
    color?: "sky" | "amber";
    onJustSelected?: (id: string) => void;
}) {
    const especial = isEspecial(fig.id);
    const precio = getPrecio(fig.id);

    const ring = color === "sky"
        ? "border-sky-500 bg-sky-50 shadow-sky-100"
        : "border-amber-400 bg-amber-50 shadow-amber-100";
    const numBg = color === "sky" ? "bg-sky-500 text-white" : "bg-amber-400 text-amber-900";
    const check = color === "sky" ? "bg-sky-500 border-sky-500" : "bg-amber-400 border-amber-400";

    const handleClick = () => {
        onClick();
        if (!selected && especial && onJustSelected) onJustSelected(fig.id);
    };

    return (
        <button
            onClick={handleClick}
            className={`relative w-full text-left rounded-xl border-2 p-3 transition-all duration-150 active:scale-[0.98]
        ${selected
                    ? `${ring} shadow-md`
                    : especial
                        ? "border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                }`}
        >
            {/* Checkbox */}
            <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${selected ? check : "border-gray-300 bg-white"}`}>
                {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>

            <div className="flex items-center gap-3 pr-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs transition-all
          ${selected ? numBg : especial ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500"}`}>
                    #{fig.numero}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 text-sm truncate leading-tight">
                            {FLAG[fig.pais] || "🌍"} {fig.nombre}
                        </p>
                        {especial && (
                            <span className="flex-shrink-0 text-[10px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                                ⭐×{precio}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{fig.pais}</p>
                </div>
            </div>
        </button>
    );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
    step, title, subtitle, count, color, children,
}: {
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
                    <div className={`${countBg} text-xs font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                        {count}
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-2">{children}</div>
        </div>
    );
}

// ─── Special alert toast ─────────────────────────────────────────────────────────────────
function SpecialAlert({ fig, onDismiss }: { fig: Figurita; onDismiss: () => void }) {
    const precio = getPrecio(fig.id);
    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm lg:left-auto lg:right-8 lg:translate-x-0 xl:right-80">
            <div className="bg-amber-400 rounded-2xl shadow-xl shadow-amber-200 p-4 flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">⭐</div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-amber-900 text-sm leading-tight">
                        ¡Figurita Especial!
                    </p>
                    <p className="text-amber-800 text-xs mt-0.5 font-medium">
                        <strong>{fig.nombre}</strong> vale ×{precio}.
                        Necesitás ofrecer <strong>{precio} figurita{precio !== 1 ? "s" : ""}</strong> a cambio.
                    </p>
                </div>
                <button onClick={onDismiss} className="text-amber-700 hover:text-amber-900 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Offer bar ─────────────────────────────────────────────────────────────────
function OfferBar({
    quiero, ofrezco, esValido, valorQuiero, valorOfrezco, onEnviar,
}: {
    quiero: string[]; ofrezco: string[]; esValido: boolean;
    valorQuiero: number; valorOfrezco: number; onEnviar: () => void;
}) {
    const diff = valorQuiero - valorOfrezco;
    const hayEspecial = quiero.some(id => isEspecial(id));

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-64 xl:right-72">
            {(quiero.length > 0 || ofrezco.length > 0) && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                    {quiero.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Recibís:</span>
                            {quiero.map(id => (
                                <span key={id} className={`text-[11px] border rounded-full px-2 py-0.5 font-semibold whitespace-nowrap flex items-center gap-0.5
                  ${isEspecial(id) ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-sky-100 text-sky-700 border-sky-200"}`}>
                                    {isEspecial(id) && <span className="text-[9px]">⭐</span>}
                                    #{FIGURITAS_MAP[id]?.numero}
                                </span>
                            ))}
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
                            {ofrezco.map(id => (
                                <span key={id} className="text-[11px] bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold whitespace-nowrap">
                                    #{FIGURITAS_MAP[id]?.numero}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border-t border-gray-100 shadow-xl px-4 py-3">
                <div className="max-w-lg mx-auto lg:max-w-2xl">
                    {/* Value balance row */}
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-sky-500" />
                                <span className="text-xs text-gray-500">
                                    Valor recibís: <strong className="text-sky-600 font-black">{valorQuiero}</strong>
                                    {hayEspecial && <span className="text-amber-500 ml-1">⭐</span>}
                                </span>
                            </div>
                            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-xs text-gray-500">
                                    Valor entregás: <strong className="text-amber-600 font-black">{valorOfrezco}</strong>
                                </span>
                            </div>
                        </div>
                        {quiero.length > 0 && ofrezco.length > 0 && (
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full transition-all
                ${esValido ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-600"}`}>
                                {esValido ? "✓ Equilibrado" : diff > 0 ? `Falta valor ${diff}` : `Sobra valor ${Math.abs(diff)}`}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onEnviar}
                        disabled={!esValido}
                        className={`w-full font-black py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2
              ${esValido
                                ? "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-200 active:scale-[0.98]"
                                : quiero.length === 0
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-amber-50 text-amber-600 border-2 border-amber-200 cursor-not-allowed"
                            }`}
                    >
                        {esValido ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Enviar oferta
                            </>
                        ) : quiero.length === 0 ? (
                            "Seleccióná figuritas que querés recibir"
                        ) : ofrezco.length === 0 ? (
                            "Ahora seleccióná qué le ofrecés"
                        ) : (
                            diff > 0
                                ? `Necesitás ofrecer ${diff} punto${diff !== 1 ? "s" : ""} más de valor`
                                : `Sobran ${Math.abs(diff)} punto${Math.abs(diff) !== 1 ? "s" : ""} de valor`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ nombre, quiero, ofrezco, onBack }: {
    nombre: string; quiero: string[]; ofrezco: string[]; onBack: () => void;
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
                    <p className="text-gray-500 text-sm">
                        Le propusiste a <strong className="text-gray-700">{nombre}</strong> este intercambio
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                    <div className="p-4 border-b border-gray-50">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <p className="text-xs font-black text-sky-600 uppercase tracking-wide">Vos recibís ({quiero.length})</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {quiero.map(id => (
                                <span key={id} className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded-lg px-2.5 py-1 font-semibold">
                                    {FLAG[FIGURITAS_MAP[id]?.pais] || "🌍"} #{FIGURITAS_MAP[id]?.numero} {FIGURITAS_MAP[id]?.nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-2 bg-gray-50">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                                <svg className="w-3 h-3 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <p className="text-xs font-black text-amber-600 uppercase tracking-wide">Vos entregás ({ofrezco.length})</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {ofrezco.map(id => (
                                <span key={id} className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2.5 py-1 font-semibold">
                                    {FLAG[FIGURITAS_MAP[id]?.pais] || "🌍"} #{FIGURITAS_MAP[id]?.numero} {FIGURITAS_MAP[id]?.nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-xl p-3 mb-5">
                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-sky-700 font-medium">
                        {nombre} recibirá tu propuesta y podrá aceptarla o rechazarla.
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black py-3.5 rounded-xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98]"
                >
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
    const usuario = USUARIOS.find((u) => u.id === id);

    const [figuritasQueQuiero, setFiguritasQueQuiero] = useState<string[]>([]);
    const [figuritasQueOfrezco, setFiguritasQueOfrezco] = useState<string[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [ofertaEnviada, setOfertaEnviada] = useState(false);
    const [alertFig, setAlertFig] = useState<Figurita | null>(null);

    // Auto-dismiss alert after 4s
    const showAlert = (figId: string) => {
        const fig = FIGURITAS_MAP[figId];
        if (fig) {
            setAlertFig(fig);
            setTimeout(() => setAlertFig(null), 4000);
        }
    };

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

    const susRepetidasQueNecesito: Figurita[] = calcularMatches(MI_USUARIO.faltantes, usuario.repetidas);
    const misRepetidasQueNecesita: Figurita[] = calcularOfertasPosibles(MI_USUARIO.repetidas, usuario.faltantes);

    const toggleQuiero = (id: string) =>
        setFiguritasQueQuiero(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleOfrezco = (id: string) =>
        setFiguritasQueOfrezco(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const valorQuiero = calcularValor(figuritasQueQuiero);
    const valorOfrezco = calcularValor(figuritasQueOfrezco);
    const esValido = figuritasQueQuiero.length > 0 && valorQuiero === valorOfrezco;

    if (ofertaEnviada) {
        return (
            <SuccessScreen
                nombre={usuario.nombre}
                quiero={figuritasQueQuiero}
                ofrezco={figuritasQueOfrezco}
                onBack={() => router.push("/")}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="
                max-w-lg mx-auto px-4 pt-20 pb-40
                lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-8 lg:pb-8
                xl:mr-72
            ">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold mt-4 mb-5 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al feed
                </button>

                {/* User hero */}
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-5 mb-6 shadow-lg shadow-sky-200">
                    <div className="flex items-center gap-4">
                        {/* Tappable avatar → public profile */}
                        <button
                            onClick={() => router.push(`/usuario-perfil/${usuario.id}`)}
                            className="relative w-14 h-14 rounded-full flex-shrink-0 group"
                            title={`Ver perfil de ${usuario.nombre}`}
                        >
                            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-xl ring-2 ring-white/30 group-hover:ring-white/70 group-active:scale-95 transition-all duration-150 shadow-[0_0_14px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_22px_rgba(255,255,255,0.55)]">
                                {usuario.avatar}
                            </div>
                            {/* Eye hint */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </span>
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-white font-black text-xl leading-tight">{usuario.nombre}</h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <svg className="w-3.5 h-3.5 text-sky-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sky-100 text-sm">{usuario.ciudad}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                                <div className="text-white font-black text-xl leading-none">{susRepetidasQueNecesito.length}</div>
                                <div className="text-sky-100 text-[10px] font-semibold uppercase tracking-wide mt-0.5">matches</div>
                            </div>
                            <div className="bg-amber-400 rounded-xl px-3 py-2 text-center">
                                <div className="text-amber-900 font-black text-xl leading-none">{misRepetidasQueNecesita.length}</div>
                                <div className="text-amber-800 text-[10px] font-semibold uppercase tracking-wide mt-0.5">puedo dar</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two sections */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
                    <Section step={1} title="Elegí lo que querés recibir" subtitle={`${susRepetidasQueNecesito.length} figuritas disponibles`} count={figuritasQueQuiero.length} color="sky">
                        {susRepetidasQueNecesito.length === 0 ? (
                            <div className="py-6 text-center">
                                <div className="text-3xl mb-2">😕</div>
                                <p className="text-sm text-gray-400 font-medium">No hay figuritas en común</p>
                            </div>
                        ) : susRepetidasQueNecesito.map(fig => (
                            <StickerCard
                                key={fig.id}
                                fig={fig}
                                selected={figuritasQueQuiero.includes(fig.id)}
                                onClick={() => toggleQuiero(fig.id)}
                                color="sky"
                                onJustSelected={showAlert}
                            />
                        ))}
                    </Section>

                    <Section step={2} title="Elegí lo que le ofrecés" subtitle={`${misRepetidasQueNecesita.length} figuritas que le faltan`} count={figuritasQueOfrezco.length} color="amber">
                        {misRepetidasQueNecesita.length === 0 ? (
                            <div className="py-6 text-center">
                                <div className="text-3xl mb-2">📦</div>
                                <p className="text-sm text-gray-400 font-medium">No tenés repetidas que le falten</p>
                            </div>
                        ) : misRepetidasQueNecesita.map(fig => (
                            <StickerCard key={fig.id} fig={fig} selected={figuritasQueOfrezco.includes(fig.id)} onClick={() => toggleOfrezco(fig.id)} color="amber" />
                        ))}
                    </Section>
                </div>
            </main>

            <OfferBar
                quiero={figuritasQueQuiero}
                ofrezco={figuritasQueOfrezco}
                esValido={esValido}
                valorQuiero={valorQuiero}
                valorOfrezco={valorOfrezco}
                onEnviar={() => setShowConfirm(true)}
            />

            {/* Special alert toast */}
            {alertFig && (
                <SpecialAlert fig={alertFig} onDismiss={() => setAlertFig(null)} />
            )}

            {/* Confirmation modal */}
            {showConfirm && (
                <ConfirmModal
                    nombre={usuario.nombre}
                    avatar={usuario.avatar}
                    quiero={figuritasQueQuiero}
                    ofrezco={figuritasQueOfrezco}
                    onConfirm={() => { setShowConfirm(false); setOfertaEnviada(true); }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
}
