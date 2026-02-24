"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";
import { isOnboardingCompleted, getOnboardingData, resetOnboarding } from "@/lib/onboardingStore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ISOLATED_ROUTES = ["/", "/login", "/register", "/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isIsolated = ISOLATED_ROUTES.includes(pathname);
    const prevFirebaseUid = useRef<string | null>(null);

    // ── Limpiar localStorage si cambia el usuario de Firebase ─────────────────
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Sin sesión → limpiar siempre
                resetOnboarding();
                return;
            }
            const stored = getOnboardingData();
            if (stored.firebaseUid && stored.firebaseUid !== user.uid) {
                // Cambió de usuario sin hacer logout → limpiar sesión anterior
                resetOnboarding();
            }
            prevFirebaseUid.current = user.uid;
        });
        return () => unsub();
    }, []);

    // ── Onboarding Guard ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isIsolated && !isOnboardingCompleted()) {
            router.replace("/onboarding");
        }
    }, [isIsolated, router]);

    if (isIsolated) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <RightPanel />
            {children}
            <BottomNav />
        </>
    );
}
