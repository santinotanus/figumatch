"use client";

import { useEffect, useState } from "react";
import { getOnboardingData } from "@/lib/onboardingStore";
import Navbar from "@/components/Navbar";
import UserCard from "@/components/UserCard";
import StatsBar from "@/components/StatsBar";

interface MatchUsuario {
    id: string; nombre: string; ciudad: string;
    avatar: string; foto?: string; premium?: boolean;
    zonas?: string[]; reputacion?: number; cambiosHechos?: number;
}

interface Match {
    usuario: MatchUsuario;
    figuritasQueNecesito: number[];
    figuritasQueLeOfrezco: number[];
}

export default function FeedPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [repetidas, setRepetidas] = useState(0);
    const [faltantes, setFaltantes] = useState(0);
    const [session, setSession] = useState<{ mongoId?: string; nombre?: string }>({});

    useEffect(() => {
        const s = getOnboardingData();
        setSession(s);
        const mongoId = s.mongoId ?? "";
        if (!mongoId) { setLoading(false); return; }

        Promise.all([
            fetch(`/api/feed?usuarioId=${mongoId}`).then(r => r.json()),
            fetch(`/api/usuarios/${mongoId}`).then(r => r.json()),
        ]).then(([feedData, userData]) => {
            setMatches(Array.isArray(feedData) ? feedData : []);
            setRepetidas((userData.repetidas ?? []).length);
            setFaltantes((userData.faltantes ?? []).length);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="
                px-4 pt-20 pb-24
                max-w-lg mx-auto
                lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-12 lg:pb-8
                xl:mr-72
            ">
                {/* Desktop header */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">🤝 Mis matches</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {loading ? "Buscando usuarios..." : `${matches.length} usuarios con figuritas que te faltan`}
                        </p>
                    </div>
                </div>

                {/* Stats — mobile only */}
                <div className="lg:hidden mt-4 mb-4">
                    <StatsBar
                        nombre={session.nombre ?? ""}
                        repetidas={repetidas}
                        faltantes={faltantes}
                        totalMatches={matches.length}
                    />
                </div>

                {/* Mobile header */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">🤝 Mis matches</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Usuarios con figuritas que te faltan</p>
                    </div>
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <svg className="w-8 h-8 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">Buscando matches...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">😔</div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Sin matches por ahora</h3>
                        <p className="text-sm text-gray-500">
                            No hay usuarios con las figuritas que buscás. Agregá más faltantes en tu álbum o volvé más tarde.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:grid-cols-2">
                            {matches.map(match => (
                                <UserCard key={match.usuario.id} match={match} />
                            ))}
                        </div>
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-8 h-px bg-gray-200" />
                                <span>Eso es todo por ahora</span>
                                <div className="w-8 h-px bg-gray-200" />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
