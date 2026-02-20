// ─── Onboarding Store ─────────────────────────────────────────────────────────
// Stores onboarding state and the user's onboarding data in localStorage.
// Since the app uses mock data, we simulate the backend "onboarding_completed" flag.

const KEY = "figumatch_onboarding";

export interface OnboardingData {
    onboarding_completed: boolean;
    nombre?: string;
    foto?: string; // base64 data URL
    repetidas?: string[]; // figurita IDs
    faltantes?: string[]; // figurita IDs
    zonas?: string[];
}

function load(): OnboardingData {
    if (typeof window === "undefined") return { onboarding_completed: false };
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { onboarding_completed: false };
        return JSON.parse(raw) as OnboardingData;
    } catch {
        return { onboarding_completed: false };
    }
}

function save(data: OnboardingData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(data));
}

export function getOnboardingData(): OnboardingData {
    return load();
}

export function isOnboardingCompleted(): boolean {
    return load().onboarding_completed === true;
}

export function completeOnboarding(data: Omit<OnboardingData, "onboarding_completed">): void {
    save({ ...data, onboarding_completed: true });
}

export function resetOnboarding(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
}
