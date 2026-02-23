"use client";

import { useState, useRef } from "react";
import { MI_USUARIO } from "@/lib/mockData";
import { getOfertas } from "@/lib/ofertasStore";
import Navbar from "@/components/Navbar";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_ZONAS = 3;

// Lista de zonas del GBA + CABA para el selector
const ZONAS_DISPONIBLES = [
    // CABA
    "Palermo", "Belgrano", "Recoleta", "San Telmo", "Puerto Madero",
    "Caballito", "Villa Crespo", "Almagro", "Flores", "Boedo",
    "Núñez", "Coghlan", "Saavedra", "Villa Urquiza", "Devoto",
    "Balvanera", "Monserrat", "La Boca", "Barracas", "Parque Patricios",
    // Zona Norte GBA
    "Vicente López", "Olivos", "Florida", "Munro", "Villa Martelli",
    "San Isidro", "Martínez", "Acassuso", "Beccar", "Boulogne",
    "San Fernando", "Tigre", "Victoria", "Nordelta",
    "Pilar", "Del Viso", "Escobar",
    // Zona Oeste GBA
    "Ramos Mejía", "San Justo", "La Matanza", "Morón", "Haedo",
    "Castelar", "Ituzaingó", "Merlo", "Moreno", "Luján",
    "Tres de Febrero", "Caseros", "El Palomar",
    // Zona Sur GBA
    "Quilmes", "Bernal", "Berazategui", "Florencio Varela",
    "Lomas de Zamora", "Lanús", "Avellaneda", "Banfield",
    "Temperley", "Adrogué", "Monte Grande",
].sort();

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value }: { value: number }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-0.5">
            {stars.map(star => {
                const fill = Math.min(1, Math.max(0, value - (star - 1)));
                return (
                    <div key={star} className="relative w-6 h-6">
                        {/* Empty star */}
                        <svg className="w-6 h-6 text-gray-200 absolute inset-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {/* Filled star (clipped) */}
                        <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Zone selector modal ──────────────────────────────────────────────────────
function ZonaModal({
    zonasActuales,
    onSave,
    onClose,
}: {
    zonasActuales: string[];
    onSave: (zonas: string[]) => void;
    onClose: () => void;
}) {
    const [seleccionadas, setSeleccionadas] = useState<string[]>(zonasActuales);
    const [busqueda, setBusqueda] = useState("");

    const filtradas = ZONAS_DISPONIBLES.filter(z =>
        z.toLowerCase().includes(busqueda.toLowerCase())
    );

    const toggle = (zona: string) => {
        setSeleccionadas(prev => {
            if (prev.includes(zona)) return prev.filter(z => z !== zona);
            if (prev.length >= MAX_ZONAS) return prev; // ya tiene 3
            return [...prev, zona];
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 pt-5 pb-4 flex-shrink-0">
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <h2 className="text-white font-black text-lg">Zonas de encuentro</h2>
                    <p className="text-sky-100 text-xs mt-0.5">
                        Elegí hasta {MAX_ZONAS} zonas donde podés hacer el intercambio
                    </p>
                </div>

                {/* Selected chips */}
                <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-gray-100">
                    {seleccionadas.length === 0 ? (
                        <p className="text-xs text-gray-400 py-1">Ninguna seleccionada aún</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {seleccionadas.map(z => (
                                <button
                                    key={z}
                                    onClick={() => toggle(z)}
                                    className="flex items-center gap-1 bg-sky-100 text-sky-700 border border-sky-200 rounded-full px-2.5 py-1 text-xs font-bold hover:bg-sky-200 transition-colors"
                                >
                                    📍 {z}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ))}
                            {seleccionadas.length < MAX_ZONAS && (
                                <span className="text-[10px] text-gray-400 self-center">
                                    {MAX_ZONAS - seleccionadas.length} más disponible{MAX_ZONAS - seleccionadas.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="px-4 py-2 flex-shrink-0">
                    <div className="relative">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar zona..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 px-4 pb-2">
                    {filtradas.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">Sin resultados para "{busqueda}"</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                            {filtradas.map(zona => {
                                const sel = seleccionadas.includes(zona);
                                const disabled = !sel && seleccionadas.length >= MAX_ZONAS;
                                return (
                                    <button
                                        key={zona}
                                        onClick={() => toggle(zona)}
                                        disabled={disabled}
                                        className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2
                      ${sel
                                                ? "bg-sky-50 border-sky-400 text-sky-700"
                                                : disabled
                                                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                                    : "bg-white border-gray-100 text-gray-700 hover:border-sky-200 hover:bg-sky-50"
                                            }`}
                                    >
                                        {sel ? "✓ " : ""}{zona}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onSave(seleccionadas); onClose(); }}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm shadow-sm hover:from-sky-600 hover:to-sky-700 transition-all active:scale-[0.98]"
                    >
                        Guardar zonas
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit name modal ──────────────────────────────────────────────────────────
function EditNameModal({
    nombreActual,
    onSave,
    onClose,
}: {
    nombreActual: string;
    onSave: (nombre: string) => void;
    onClose: () => void;
}) {
    const [nombre, setNombre] = useState(nombreActual);
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 pt-5 pb-5">
                    <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
                    <h2 className="text-white font-black text-lg">Editar nombre</h2>
                </div>
                <div className="px-5 py-5">
                    <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && nombre.trim() && onSave(nombre.trim())}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all mb-4"
                        autoFocus
                        maxLength={40}
                    />
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            onClick={() => nombre.trim() && onSave(nombre.trim())}
                            disabled={!nombre.trim()}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PerfilPage() {
    const [nombre, setNombre] = useState(MI_USUARIO.nombre);
    const [zonas, setZonas] = useState<string[]>(MI_USUARIO.zonas ?? []);
    const [reputacion] = useState(MI_USUARIO.reputacion ?? 4.7);
    const [cambiosHechos] = useState(
        MI_USUARIO.cambiosHechos ?? getOfertas().filter(o => o.estado === "activa").length
    );
    const [showZonaModal, setShowZonaModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const [savedToast, setSavedToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setFotoUrl(url);
    };

    const showSaved = () => {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);
    };

    const handleSaveNombre = (n: string) => {
        setNombre(n);
        setShowNameModal(false);
        showSaved();
    };

    const handleSaveZonas = (z: string[]) => {
        setZonas(z);
        showSaved();
    };

    const initials = nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="
                px-4 pt-20 pb-24
                lg:ml-64 lg:pt-8 lg:px-8 lg:pb-10
                xl:mr-72
            ">
                <div className="max-w-lg mx-auto lg:max-w-xl lg:mx-auto">

                    {/* ── Hero card ── */}
                    <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 rounded-3xl p-6 mb-5 shadow-xl shadow-sky-200 relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

                        <div className="relative flex items-center gap-5">
                            {/* Avatar / Photo */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/30">
                                    {fotoUrl ? (
                                        <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-sky-300 to-sky-500 flex items-center justify-center">
                                            <span className="text-white font-black text-3xl">{initials}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Camera button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100"
                                    title="Cambiar foto"
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFotoChange}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-white font-black text-xl leading-tight truncate">{nombre}</h1>
                                    <button
                                        onClick={() => setShowNameModal(true)}
                                        className="flex-shrink-0 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                        title="Editar nombre"
                                    >
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                    <svg className="w-3.5 h-3.5 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sky-100 text-sm">{MI_USUARIO.ciudad}</span>
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                                        <div className="text-white font-black text-lg leading-none">{cambiosHechos}</div>
                                        <div className="text-sky-100 text-[9px] font-bold uppercase tracking-wide mt-0.5">cambios</div>
                                    </div>
                                    <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                                        <div className="text-amber-300 font-black text-lg leading-none">{reputacion.toFixed(1)}</div>
                                        <div className="text-sky-100 text-[9px] font-bold uppercase tracking-wide mt-0.5">reputación</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Reputation card ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">⭐</span>
                            </div>
                            <h2 className="font-black text-gray-900 text-sm">Reputación</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-center flex-shrink-0">
                                <div className="text-5xl font-black text-gray-900 leading-none">{reputacion.toFixed(1)}</div>
                                <div className="text-xs text-gray-400 mt-1">de 5.0</div>
                            </div>
                            <div>
                                <StarRating value={reputacion} />
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    Basado en <strong className="text-gray-700">{cambiosHechos}</strong> intercambios completados
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-amber-700 font-medium">
                                Tu reputación sube cuando completás intercambios. ¡Seguí canjeando!
                            </p>
                        </div>
                    </div>

                    {/* ── Zonas card ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm">📍</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm">Zonas de encuentro</h2>
                                    <p className="text-[11px] text-gray-400">Hasta {MAX_ZONAS} zonas</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowZonaModal(true)}
                                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                        </div>

                        {zonas.length === 0 ? (
                            <button
                                onClick={() => setShowZonaModal(true)}
                                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-sky-300 hover:bg-sky-50 transition-all group"
                            >
                                <div className="text-3xl mb-2">📍</div>
                                <p className="text-sm font-bold text-gray-500 group-hover:text-sky-600">Agregar zonas de encuentro</p>
                                <p className="text-xs text-gray-400 mt-0.5">Elegí dónde podés hacer el intercambio</p>
                            </button>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    {zonas.map((zona, i) => (
                                        <div key={zona} className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                                            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-[10px] font-black">{i + 1}</span>
                                            </div>
                                            <span className="font-bold text-sky-800 text-sm flex-1">{zona}</span>
                                            <span className="text-sky-400 text-sm">📍</span>
                                        </div>
                                    ))}
                                    {zonas.length < MAX_ZONAS && (
                                        <button
                                            onClick={() => setShowZonaModal(true)}
                                            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-semibold hover:border-sky-300 hover:text-sky-500 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Agregar zona ({MAX_ZONAS - zonas.length} disponible{MAX_ZONAS - zonas.length !== 1 ? "s" : ""})
                                        </button>
                                    )}
                                </div>

                                <div className="mt-3 flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-xl p-3">
                                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-sky-700 font-medium">
                                        Solo aparecerás en el feed de usuarios que compartan al menos una zona con vos.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Stats card ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">📊</span>
                            </div>
                            <h2 className="font-black text-gray-900 text-sm">Estadísticas</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                                <div className="text-2xl font-black text-sky-600 leading-none">{cambiosHechos}</div>
                                <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wide mt-1">Cambios</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                                <div className="text-2xl font-black text-amber-600 leading-none">{reputacion.toFixed(1)}</div>
                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wide mt-1">Reputación</div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                                <div className="text-2xl font-black text-emerald-600 leading-none">{zonas.length}</div>
                                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide mt-1">Zonas</div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Modals */}
            {showZonaModal && (
                <ZonaModal
                    zonasActuales={zonas}
                    onSave={handleSaveZonas}
                    onClose={() => setShowZonaModal(false)}
                />
            )}
            {showNameModal && (
                <EditNameModal
                    nombreActual={nombre}
                    onSave={handleSaveNombre}
                    onClose={() => setShowNameModal(false)}
                />
            )}

            {/* Saved toast */}
            {savedToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                    ✅ Guardado
                </div>
            )}
        </div>
    );
}
