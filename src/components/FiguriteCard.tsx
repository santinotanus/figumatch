"use client";

import { Figurita } from "@/types";

interface FiguriteCardProps {
    figurita: Figurita;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    showCheckbox?: boolean;
}

const TIPO_BADGE: Record<string, { label: string; color: string }> = {
    jugador: { label: "Jugador", color: "bg-sky-100 text-sky-700" },
    escudo: { label: "Escudo", color: "bg-amber-100 text-amber-700" },
    estadio: { label: "Estadio", color: "bg-purple-100 text-purple-700" },
    especial: { label: "Especial", color: "bg-yellow-100 text-yellow-700" },
};

const FLAG_EMOJI: Record<string, string> = {
    Argentina: "🇦🇷",
    Brasil: "🇧🇷",
    Francia: "🇫🇷",
    España: "🇪🇸",
    Alemania: "🇩🇪",
    Portugal: "🇵🇹",
    Uruguay: "🇺🇾",
    Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    FIFA: "🌍",
};

export default function FiguriteCard({
    figurita,
    selected = false,
    disabled = false,
    onClick,
    showCheckbox = false,
}: FiguriteCardProps) {
    const badge = TIPO_BADGE[figurita.tipo];
    const flag = FLAG_EMOJI[figurita.pais] || "🌍";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative w-full text-left rounded-xl border-2 p-3 transition-all duration-200
        ${selected
                    ? "border-sky-500 bg-sky-50 shadow-md shadow-sky-100"
                    : disabled
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-100 bg-white hover:border-sky-200 hover:shadow-sm cursor-pointer active:scale-[0.98]"
                }
      `}
        >
            {/* Checkbox indicator */}
            {showCheckbox && (
                <div
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${selected ? "border-sky-500 bg-sky-500" : "border-gray-300 bg-white"}`}
                >
                    {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Number badge */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm
          ${selected ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    #{figurita.numero}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-base">{flag}</span>
                        <p className="font-bold text-gray-900 text-sm truncate">{figurita.nombre}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                            {badge.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{figurita.pais}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
