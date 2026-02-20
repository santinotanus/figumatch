"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";
import { isOnboardingCompleted } from "@/lib/onboardingStore";

// Routes that should NOT show the main app shell (sidebar, bottomnav, rightpanel)
const ISOLATED_ROUTES = ["/", "/login", "/register", "/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isIsolated = ISOLATED_ROUTES.includes(pathname);

    // ── Onboarding Guard ──────────────────────────────────────────────────────
    useEffect(() => {
        // Only guard non-isolated (app) routes
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
