"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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

// ─── Step 1: Auth + Profile ───────────────────────────────────────────────────
function StepPerfil({ nombre, foto, email, password, useGoogle, firebaseEmail, loading, onNombre, onFoto, onEmail, onPassword, onGoogle, onNext }: {
    nombre: string; foto: string;
    email: string; password: string;
    useGoogle: boolean; firebaseEmail: string; loading: boolean;
    onNombre: (v: string) => void; onFoto: (v: string) => void;
    onEmail: (v: string) => void; onPassword: (v: string) => void;
    onGoogle: () => void;
    onNext: () => void;
}) {
    const [showPass, setShowPass] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onFoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Google button */}
            {!useGoogle && (
                <button type="button" onClick={onGoogle} disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-bold text-gray-700 text-sm">Registrarse con Google</span>
                </button>
            )}

            {useGoogle && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto} alt="Foto de Google" className="w-10 h-10 rounded-full object-cover flex-none" referrerPolicy="no-referrer" />
                    ) : (
                        <span className="text-emerald-600 text-lg">✅</span>
                    )}
                    <div>
                        <p className="text-sm font-bold text-emerald-700">Conectado con Google</p>
                        <p className="text-xs text-emerald-600">{firebaseEmail || nombre}</p>
                    </div>
                </div>
            )}

            {!useGoogle && (
                <>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">o con email</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input type="email" placeholder="Correo electrónico" value={email}
                            onChange={e => onEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                        <input type={showPass ? "text" : "password"} placeholder="Contraseña (mín. 6 caracteres)" value={password}
                            onChange={e => onPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPass ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* Nombre */}
            <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">
                    Tu nombre <span className="text-red-400">*</span>
                </label>
                <input type="text" value={nombre} onChange={e => onNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez" maxLength={40}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white transition-all outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                <p className="text-xs text-gray-400 mt-1.5">Este nombre será visible cuando hagas ofertas de intercambio.</p>
            </div>

            {/* Foto */}
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()}
                    className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-sky-100 hover:border-sky-300 transition-all group shadow-sm flex-none">
                    {foto ? (
                        <Image src={foto} alt="Foto" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <p className="text-xs text-gray-400 font-medium">Foto de perfil (opcional)</p>
            </div>

            <button onClick={onNext} disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-sky-200 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : "Continuar →"}
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
    { title: "Tu cuenta", subtitle: "Creá tu usuario en FiguMatch" },
    { title: "Tu zona", subtitle: "¿Dónde querés intercambiar?" },
];

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    // Step 1 — auth + perfil
    const [nombre, setNombre] = useState("");
    const [foto, setFoto] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [useGoogle, setUseGoogle] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState("");
    const [firebaseEmail, setFirebaseEmail] = useState("");

    // Step 2
    const [zonas, setZonas] = useState<string[]>([]);

    // ── Paso 1: crear cuenta en Firebase ─────────────────────────────────────
    const handleStep1Next = useCallback(async () => {
        if (!nombre.trim()) { setAuthError("El nombre es obligatorio."); return; }
        setAuthError("");
        setLoading(true);
        try {
            if (useGoogle) {
                setStep(2);
            } else {
                if (!email || !password) { setAuthError("Ingresá email y contraseña."); setLoading(false); return; }
                if (password.length < 6) { setAuthError("La contraseña debe tener al menos 6 caracteres."); setLoading(false); return; }
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: nombre });
                setFirebaseUid(cred.user.uid);
                setFirebaseEmail(cred.user.email ?? email);
                setStep(2);
            }
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "auth/email-already-in-use") {
                setAuthError("Ese email ya está registrado. ¿Querés iniciar sesión?");
            } else if (code === "auth/invalid-email") {
                setAuthError("El email no es válido.");
            } else {
                setAuthError("Error al crear la cuenta. Intentá de nuevo.");
            }
        }
        setLoading(false);
    }, [nombre, email, password, useGoogle]);

    // ── Continuar con Google en onboarding ────────────────────────────────────
    const handleGoogleOnboarding = useCallback(async () => {
        setAuthError("");
        setLoading(true);
        try {
            const cred = await signInWithPopup(auth, googleProvider);
            const u = cred.user;

            // Sincronizar con MongoDB
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: u.uid,
                    email: u.email ?? "",
                    nombre: u.displayName ?? "",
                    foto: u.photoURL ?? "",
                }),
            });
            const { usuario, nuevo } = await res.json();

            // Si ya tiene cuenta completa → directo al feed
            if (!nuevo && usuario.zonas?.length > 0) {
                completeOnboarding({
                    mongoId: usuario._id,
                    firebaseUid: u.uid,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    foto: usuario.foto,
                    repetidas: usuario.repetidas,
                    faltantes: usuario.faltantes,
                    zonas: usuario.zonas,
                });
                router.push("/feed");
                return;
            }

            // Si es nuevo → pre-cargar datos de Google y continuar onboarding
            setFirebaseUid(u.uid);
            setFirebaseEmail(u.email ?? "");
            setNombre(u.displayName ?? "");
            setFoto(u.photoURL ?? "");
            setUseGoogle(true);
            // Si ya existe en mongo pero sin zonas, guardar su mongoId
            if (!nuevo) {
                // pre-cargar mongoId para el PATCH final
                setFirebaseUid(u.uid);
            }
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code !== "auth/popup-closed-by-user") {
                setAuthError("Error al conectar con Google. Intentá de nuevo.");
            }
        }
        setLoading(false);
    }, [router]);

    const handleFinish = useCallback(async () => {
        setLoading(true);
        try {
            const uid = firebaseUid;
            const userEmail = firebaseEmail || email;

            // Crear/buscar usuario en MongoDB — el API ya le asigna las 981 figuritas como faltantes
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, email: userEmail, nombre, foto }),
            });
            const { usuario } = await res.json();

            // Guardar zonas y foto en el perfil
            await fetch(`/api/usuarios/${usuario._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, foto, zonas }),
            });

            completeOnboarding({
                mongoId: usuario._id,
                firebaseUid: uid,
                nombre,
                email: userEmail,
                foto,
                repetidas: [],
                faltantes: [],
                zonas,
            });
            router.push("/feed");
        } catch {
            setAuthError("Error al guardar tus datos. Intentá de nuevo.");
            setLoading(false);
        }
    }, [firebaseUid, firebaseEmail, email, nombre, foto, zonas, router]);

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
                        <StepIndicator current={step} total={2} />
                    </div>
                    <h1 className="text-white text-xl font-black">{label.title}</h1>
                    <p className="text-sky-100 text-sm mt-0.5">{label.subtitle}</p>
                </div>

                {/* Step content */}
                <div className="px-6 py-6">
                    {/* Error de auth */}
                    {authError && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-semibold">
                            ⚠️ {authError}
                        </div>
                    )}
                    {step === 1 && (
                        <StepPerfil
                            nombre={nombre} foto={foto}
                            email={email} password={password}
                            useGoogle={useGoogle} firebaseEmail={firebaseEmail}
                            loading={loading}
                            onNombre={setNombre} onFoto={setFoto}
                            onEmail={setEmail} onPassword={setPassword}
                            onGoogle={handleGoogleOnboarding}
                            onNext={handleStep1Next}
                        />
                    )}
                    {step === 2 && (
                        <StepZonas
                            zonas={zonas} onZonas={setZonas}
                            onFinish={handleFinish} onBack={() => setStep(1)}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
