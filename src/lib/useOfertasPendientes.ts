"use client";

import { useState, useEffect } from "react";
import { getOnboardingData } from "@/lib/onboardingStore";

export function useOfertasPendientes() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const session = getOnboardingData();
        const usuarioId = session.mongoId;
        if (!usuarioId) return;

        const fetchCount = () => {
            fetch(`/api/ofertas/pendientes-count?usuarioId=${usuarioId}`)
                .then(r => r.json())
                .then(data => setCount(data.count ?? 0))
                .catch(() => setCount(0));
        };

        fetchCount();
        // Refrescar cada 30 segundos
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return count;
}
