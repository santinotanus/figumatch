import type { Metadata } from "next";
import { getUsuariosConMatches } from "@/lib/mockData";
import Navbar from "@/components/Navbar";
import UserCard from "@/components/UserCard";
import StatsBar from "@/components/StatsBar";

export const metadata: Metadata = {
    title: "FiguMatch – Mis Matches",
    description:
        "Encontrá usuarios que tienen las figuritas que te faltan y ofrecé las tuyas repetidas.",
};

export default function FeedPage() {
    const matches = getUsuariosConMatches();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="
        px-4 pt-20 pb-24
        max-w-lg mx-auto
        lg:ml-64 lg:mr-0 lg:max-w-none lg:pt-8 lg:px-12 lg:pb-8
        xl:mr-72
      ">
                {/* Desktop page header */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">🤝 Mis matches</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Usuarios con figuritas que te faltan
                        </p>
                    </div>
                </div>

                {/* Stats — mobile only */}
                <div className="lg:hidden mt-4 mb-4">
                    <StatsBar totalMatches={matches.length} />
                </div>

                {/* Mobile feed header */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">🤝 Mis matches</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Usuarios con figuritas que te faltan
                        </p>
                    </div>
                </div>

                {/* Feed */}
                {matches.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">😔</div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                            Sin matches por ahora
                        </h3>
                        <p className="text-sm text-gray-500">
                            No hay usuarios con las figuritas que buscás. ¡Volvé más tarde!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:grid-cols-2">
                        {matches.map((match) => (
                            <UserCard key={match.usuario.id} match={match} />
                        ))}
                    </div>
                )}

                {matches.length > 0 && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-8 h-px bg-gray-200" />
                            <span>Eso es todo por ahora</span>
                            <div className="w-8 h-px bg-gray-200" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
