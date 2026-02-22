"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { completeOnboarding } from "@/lib/onboardingStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_FIGURITAS = 3;
const MAX_ZONAS = 3;

const ZONAS_DISPONIBLES = [
    "Palermo", "Belgrano", "Recoleta", "San Telmo", "Puerto Madero",
    "Caballito", "Villa Crespo", "Almagro", "Flores", "Boedo",
    "Núñez", "Coghlan", "Saavedra", "Villa Urquiza", "Devoto",
    "Balvanera", "Monserrat", "La Boca", "Barracas", "Parque Patricios",
    "Vicente López", "Olivos", "Florida", "Munro", "Villa Martelli",
    "San Isidro", "Martínez", "Acassuso", "Beccar", "Boulogne",
    "San Fernando", "Tigre", "Victoria", "Nordelta",
    "Pilar", "Del Viso", "Escobar",
    "Ramos Mejía", "San Justo", "La Matanza", "Morón", "Haedo",
    "Castelar", "Ituzaingó", "Merlo", "Moreno", "Luján",
    "Tres de Febrero", "Caseros", "El Palomar",
    "Quilmes", "Bernal", "Berazategui", "Florencio Varela",
    "Lomas de Zamora", "Lanús", "Avellaneda", "Banfield",
    "Temperley", "Adrogué", "Monte Grande",
].sort();

// ─── Background confetti (same as login page) ─────────────────────────────────
function Confetti() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Mobile edge confetti */}
            <div className="absolute top-[2%] left-[2%] w-2 h-2 bg-yellow-400 rotate-12" />
            <div className="absolute top-[15%] right-[2%] w-2 h-2 bg-sky-400 rounded-full" />
            <div className="absolute bottom-[15%] left-[3%] w-2 h-2 bg-red-400 rotate-45" />
            <div className="absolute bottom-[2%] right-[3%] w-3 h-1 bg-emerald-400 rotate-12" />
            <div className="absolute top-[50%] left-[1%] w-1.5 h-3 bg-red-500 -rotate-12" />
            <div className="absolute top-[50%] right-[1%] w-2 h-2 bg-yellow-500 rounded-sm" />
            {/* Yellow */}
            <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-yellow-400 rounded-sm rotate-45 lg:w-4 lg:h-4" />
            <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-yellow-300 rounded-full" />
            <div className="absolute top-[35%] left-[25%] w-3 h-1.5 bg-yellow-400 rotate-[30deg]" />
            <div className="absolute bottom-[20%] left-[8%] w-4 h-2 bg-yellow-400 rotate-12" />
            <div className="absolute top-[45%] left-[45%] w-2 h-2 bg-yellow-200 rounded-full opacity-60" />
            <div className="absolute bottom-[40%] right-[20%] w-3 h-3 bg-yellow-500 rounded-sm rotate-45" />
            {/* Sky */}
            <div className="absolute top-[25%] right-[20%] w-3 h-3 bg-sky-400 rounded-full lg:w-5 lg:h-5" />
            <div className="absolute top-[80%] left-[25%] w-2 h-2 bg-sky-300 rounded-sm -rotate-12" />
            <div className="absolute top-[15%] left-[45%] w-4 h-4 bg-sky-200 opacity-40 rounded-full" />
            <div className="absolute top-[45%] right-[30%] w-3 h-3 bg-sky-500 rounded-sm rotate-12 opacity-60" />
            <div className="absolute bottom-[15%] left-[40%] w-3 h-1.5 bg-sky-400 rotate-[60deg]" />
            <div className="absolute top-[75%] right-[25%] w-2 h-2 bg-sky-600 rounded-full opacity-40" />
            {/* Red */}
            <div className="absolute top-[40%] left-[5%] w-3 h-3 bg-red-400 rounded-sm rotate-[30deg]" />
            <div className="absolute bottom-[10%] right-[30%] w-4 h-4 bg-red-500 rounded-full opacity-80" />
            <div className="absolute top-[70%] right-[40%] w-2 h-2 bg-red-300 rounded-sm" />
            <div className="absolute top-[55%] left-[18%] w-2.5 h-2.5 bg-red-400 rounded-full opacity-70" />
            <div className="absolute top-[20%] right-[45%] w-2 h-4 bg-red-300 rotate-[-45deg] opacity-50" />
            {/* Green */}
            <div className="absolute top-[12%] right-[35%] w-3 h-3 bg-emerald-400 rounded-full" />
            <div className="absolute top-[65%] left-[30%] w-3 h-1.5 bg-emerald-500 rotate-[-20deg]" />
            <div className="absolute bottom-[35%] right-[5%] w-2 h-4 bg-emerald-400 rotate-45 opacity-60" />
            <div className="absolute top-[30%] left-[40%] w-2 h-2 bg-emerald-300 rounded-sm" />
            <div className="absolute bottom-[25%] left-[50%] w-3 h-3 bg-emerald-500 rounded-full opacity-30" />
            <div className="absolute top-[85%] right-[15%] w-4 h-2 bg-emerald-400 rotate-12" />
            {/* Football icons */}
            <div className="absolute top-[5%] right-[5%] text-4xl lg:text-5xl opacity-20 rotate-12">⚽</div>
            <div className="absolute bottom-[5%] left-[5%] text-4xl lg:text-6xl opacity-20 -rotate-12">🏆</div>
            <div className="absolute top-[50%] left-[12%] text-2xl opacity-10">⭐</div>
            <div className="absolute bottom-[25%] right-[15%] text-4xl opacity-10 rotate-3">🇦🇷</div>
        </div>
    );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300
                        ${i + 1 === current
                            ? "bg-white text-sky-600 shadow-md scale-110"
                            : i + 1 < current
                                ? "bg-sky-400 text-white"
                                : "bg-sky-400/30 text-white/60"
                        }
                    `}>
                        {i + 1 < current ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${i + 1 < current ? "bg-white/60" : "bg-white/20"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Number Tag ───────────────────────────────────────────────────────────────
function NumberTag({ num, onRemove }: { num: number; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black px-2.5 py-1 rounded-full">
            #{num}
            <button type="button" onClick={onRemove} className="text-sky-400 hover:text-red-400 leading-none font-black text-sm transition-colors">×</button>
        </span>
    );
}

// ─── Counter Badge ─────────────────────────────────────────────────────────────
function CounterBadge({ count, min, label }: { count: number; min: number; label: string }) {
    const done = count >= min;
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all ${done ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
            {done ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <span className="opacity-60">📋</span>
            )}
            {label}: {count}/{min}
        </div>
    );
}

// ─── Number input with tag list ───────────────────────────────────────────────
function NumberInput({
    label,
    numbers,
    opuestas,
    onAdd,
    onRemove,
    placeholder,
}: {
    label: string;
    numbers: number[];
    opuestas: number[];  // the other list — can't be in both
    onAdd: (n: number) => void;
    onRemove: (n: number) => void;
    placeholder?: string;
}) {
    const [input, setInput] = useState("");
    const [inputError, setInputError] = useState("");

    const handleAdd = () => {
        const n = parseInt(input.trim(), 10);
        if (isNaN(n) || n < 1 || n > 999) { setInputError("Ingresá un número entre 1 y 999."); return; }
        if (numbers.includes(n)) { setInputError("Ya la tenés en esta lista."); return; }
        if (opuestas.includes(n)) { setInputError(`La #${n} ya está en la lista opuesta. No puede estar en ambas.`); return; }
        setInputError("");
        onAdd(n);
        setInput("");
    };

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <input
                    type="number"
                    min={1}
                    max={999}
                    value={input}
                    onChange={e => { setInput(e.target.value); setInputError(""); }}
                    onKeyDown={handleKey}
                    placeholder={placeholder ?? "Ej: 42"}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium bg-white transition-all outline-none
                        ${inputError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"}`}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl transition-all active:scale-95 text-sm"
                >
                    +
                </button>
            </div>
            {inputError && <p className="text-red-500 text-xs font-semibold">{inputError}</p>}
            {numbers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                    {numbers.map(n => (
                        <NumberTag key={n} num={n} onRemove={() => onRemove(n)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Step 1: Profile ──────────────────────────────────────────────────────────
function StepPerfil({ nombre, foto, onNombre, onFoto, onNext }: {
    nombre: string; foto: string;
    onNombre: (v: string) => void; onFoto: (v: string) => void;
    onNext: () => void;
}) {
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onFoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleNext = () => {
        if (!nombre.trim()) { setError("El nombre es obligatorio para continuar."); return; }
        setError(""); onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-sky-100 hover:border-sky-300 transition-all group shadow-sm">
                    {foto ? (
                        <Image src={foto} alt="Foto de perfil" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Cambiar</span>
                    </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <p className="text-xs text-gray-400 font-medium">Foto de perfil (opcional)</p>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">
                    Tu nombre <span className="text-red-400">*</span>
                </label>
                <input
                    type="text" value={nombre} onChange={e => { onNombre(e.target.value); setError(""); }}
                    placeholder="Ej: Juan Pérez" maxLength={40}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white transition-all outline-none
                        ${error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"}`}
                />
                {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
                <p className="text-xs text-gray-400 mt-2">Este nombre será visible cuando hagas ofertas de intercambio.</p>
            </div>

            <button onClick={handleNext}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-sky-200">
                Continuar →
            </button>
        </div>
    );
}

// ─── Step 2: Stickers by number ───────────────────────────────────────────────
function StepFiguritas({ repetidas, faltantes, onRepetidas, onFaltantes, onNext, onBack }: {
    repetidas: number[]; faltantes: number[];
    onRepetidas: (ns: number[]) => void; onFaltantes: (ns: number[]) => void;
    onNext: () => void; onBack: () => void;
}) {
    const [error, setError] = useState("");

    const handleNext = () => {
        if (repetidas.length < MIN_FIGURITAS) {
            setError(`Necesitás agregar al menos ${MIN_FIGURITAS} figuritas repetidas.`);
            return;
        }
        if (faltantes.length < MIN_FIGURITAS) {
            setError(`Necesitás agregar al menos ${MIN_FIGURITAS} figuritas faltantes.`);
            return;
        }
        setError(""); onNext();
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Top counters */}
            <div className="flex gap-2 flex-wrap">
                <CounterBadge count={repetidas.length} min={MIN_FIGURITAS} label="Repetidas" />
                <CounterBadge count={faltantes.length} min={MIN_FIGURITAS} label="Faltantes" />
            </div>

            {/* Explanation */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-xs text-sky-700 font-medium leading-relaxed">
                📌 Ingresá el <strong>número</strong> de cada figurita (lo encontrás en el dorso de la figurita o en tu álbum). Necesitás agregar mínimo <strong>3 repetidas</strong> y <strong>3 faltantes</strong>.
            </div>

            {/* Repetidas input */}
            <NumberInput
                label="Mis repetidas (las que me sobran)"
                numbers={repetidas}
                opuestas={faltantes}
                onAdd={n => { setError(""); onRepetidas([...repetidas, n]); }}
                onRemove={n => onRepetidas(repetidas.filter(x => x !== n))}
                placeholder="Ej: 42"
            />

            {/* Faltantes input */}
            <NumberInput
                label="Mis faltantes (las que me faltan)"
                numbers={faltantes}
                opuestas={repetidas}
                onAdd={n => { setError(""); onFaltantes([...faltantes, n]); }}
                onRemove={n => onFaltantes(faltantes.filter(x => x !== n))}
                placeholder="Ej: 87"
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    <p className="text-red-600 text-xs font-semibold">{error}</p>
                </div>
            )}

            <p className="text-xs text-gray-400">A futuro podés seguir editando tu álbum desde tu perfil.</p>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-none px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]">
                    ← Volver
                </button>
                <button onClick={handleNext} className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-sky-200">
                    Continuar →
                </button>
            </div>
        </div>
    );
}

// ─── Step 3: Zones ────────────────────────────────────────────────────────────
function StepZonas({ zonas, onZonas, onFinish, onBack, loading }: {
    zonas: string[]; onZonas: (z: string[]) => void;
    onFinish: () => void; onBack: () => void; loading: boolean;
}) {
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState("");

    const filtradas = ZONAS_DISPONIBLES.filter(z => z.toLowerCase().includes(busqueda.toLowerCase()));

    const toggle = (zona: string) => {
        setError("");
        if (zonas.includes(zona)) { onZonas(zonas.filter(z => z !== zona)); }
        else if (zonas.length < MAX_ZONAS) { onZonas([...zonas, zona]); }
    };

    const handleFinish = () => {
        if (zonas.length < 1) { setError("Seleccioná al menos 1 zona de intercambio."); return; }
        setError(""); onFinish();
    };

    return (
        <div className="flex flex-col gap-4">
            {zonas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {zonas.map(z => (
                        <span key={z} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-full">
                            📍 {z}
                            <button type="button" onClick={() => toggle(z)} className="text-sky-400 hover:text-sky-600 leading-none">×</button>
                        </span>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 font-medium">
                Seleccioná hasta {MAX_ZONAS} zonas donde podés encontrarte a intercambiar.
                <span className="font-black text-gray-700"> {zonas.length}/{MAX_ZONAS}</span>
            </p>

            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text" placeholder="Buscar zona..." value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filtradas.map(zona => {
                    const selected = zonas.includes(zona);
                    const maxed = !selected && zonas.length >= MAX_ZONAS;
                    return (
                        <button key={zona} type="button" disabled={maxed} onClick={() => toggle(zona)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selected ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                : maxed ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50"
                                }`}>
                            {zona}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    <p className="text-red-600 text-xs font-semibold">{error}</p>
                </div>
            )}

            <p className="text-xs text-gray-400">Podés agregar o modificar tus zonas desde tu perfil cuando quieras.</p>

            <div className="flex gap-3">
                <button onClick={onBack} disabled={loading}
                    className="flex-none px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50">
                    ← Volver
                </button>
                <button onClick={handleFinish} disabled={loading}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-sky-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Guardando...
                        </>
                    ) : "🎉 Finalizar y empezar a usar FiguMatch"}
                </button>
            </div>
        </div>
    );
}

// ─── Step labels ──────────────────────────────────────────────────────────────
const STEP_LABELS = [
    { title: "Tu perfil", subtitle: "¿Cómo querés que te vean?" },
    { title: "Tu álbum", subtitle: "¿Cuáles tenés y cuáles te faltan?" },
    { title: "Tu zona", subtitle: "¿Dónde querés intercambiar?" },
];

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [nombre, setNombre] = useState("");
    const [foto, setFoto] = useState("");

    // Step 2 — now number arrays
    const [repetidas, setRepetidas] = useState<number[]>([]);
    const [faltantes, setFaltantes] = useState<number[]>([]);

    // Step 3
    const [zonas, setZonas] = useState<string[]>([]);

    const handleFinish = useCallback(async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        completeOnboarding({
            nombre,
            foto,
            repetidas: repetidas.map(n => String(n)),
            faltantes: faltantes.map(n => String(n)),
            zonas,
        });
        router.push("/feed");
    }, [nombre, foto, repetidas, faltantes, zonas, router]);

    const label = STEP_LABELS[step - 1];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
            <Confetti />

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden relative z-10">

                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 pt-7 pb-5">
                    <div className="flex items-center justify-between mb-4">
                        <Image src="/logo.png" alt="FiguMatch" width={140} height={45} className="h-10 w-auto object-contain" priority />
                        <StepIndicator current={step} total={3} />
                    </div>
                    <h1 className="text-white text-xl font-black">{label.title}</h1>
                    <p className="text-sky-100 text-sm mt-0.5">{label.subtitle}</p>
                </div>

                {/* Step content */}
                <div className="px-6 py-6">
                    {step === 1 && (
                        <StepPerfil
                            nombre={nombre} foto={foto}
                            onNombre={setNombre} onFoto={setFoto}
                            onNext={() => setStep(2)}
                        />
                    )}
                    {step === 2 && (
                        <StepFiguritas
                            repetidas={repetidas} faltantes={faltantes}
                            onRepetidas={setRepetidas} onFaltantes={setFaltantes}
                            onNext={() => setStep(3)} onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <StepZonas
                            zonas={zonas} onZonas={setZonas}
                            onFinish={handleFinish} onBack={() => setStep(2)}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
