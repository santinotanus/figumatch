"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}



// ─── Main page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login for existing user — mark onboarding done and go to feed
    import("@/lib/onboardingStore").then(({ completeOnboarding }) => {
      completeOnboarding({ nombre: "Usuario", repetidas: [], faltantes: [], zonas: [] });
      setTimeout(() => router.push("/feed"), 800);
    });
  };

  const handleGoogle = () => {
    setLoading(true);
    // Simulate Google login for existing user
    import("@/lib/onboardingStore").then(({ completeOnboarding }) => {
      completeOnboarding({ nombre: "Usuario", repetidas: [], faltantes: [], zonas: [] });
      setTimeout(() => router.push("/feed"), 600);
    });
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-white relative overflow-hidden">

      {/* ── BACKGROUND DECORATIONS ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Mobile Edge Confetti (Visible on small screens) */}
        <div className="absolute top-[2%] left-[2%] w-2 h-2 bg-yellow-400 rotate-12" />
        <div className="absolute top-[15%] right-[2%] w-2 h-2 bg-sky-400 rounded-full" />
        <div className="absolute bottom-[15%] left-[3%] w-2 h-2 bg-red-400 rotate-45" />
        <div className="absolute bottom-[2%] right-[3%] w-3 h-1 bg-emerald-400 rotate-12" />
        <div className="absolute top-[50%] left-[1%] w-1.5 h-3 bg-red-500 -rotate-12" />
        <div className="absolute top-[50%] right-[1%] w-2 h-2 bg-yellow-500 rounded-sm" />

        {/* Confetti - Yellow */}
        <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-yellow-400 rounded-sm rotate-45 transform lg:w-4 lg:h-4" />
        <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-yellow-300 rounded-full" />
        <div className="absolute top-[35%] left-[25%] w-3 h-1.5 bg-yellow-400 rotate-[30deg]" />
        <div className="absolute bottom-[20%] left-[8%] w-4 h-2 bg-yellow-400 rotate-12" />
        <div className="absolute top-[45%] left-[45%] w-2 h-2 bg-yellow-200 rounded-full opacity-60" />
        <div className="absolute bottom-[40%] right-[20%] w-3 h-3 bg-yellow-500 rounded-sm rotate-45" />

        {/* Confetti - Blue/Sky */}
        <div className="absolute top-[25%] right-[20%] w-3 h-3 bg-sky-400 rounded-full lg:w-5 lg:h-5" />
        <div className="absolute top-[80%] left-[25%] w-2 h-2 bg-sky-300 rounded-sm -rotate-12" />
        <div className="absolute top-[15%] left-[45%] w-4 h-4 bg-sky-200 opacity-40 rounded-full" />
        <div className="absolute top-[45%] right-[30%] w-3 h-3 bg-sky-500 rounded-sm rotate-12 opacity-60" />
        <div className="absolute bottom-[15%] left-[40%] w-3 h-1.5 bg-sky-400 rotate-[60deg]" />
        <div className="absolute top-[75%] right-[25%] w-2 h-2 bg-sky-600 rounded-full opacity-40" />

        {/* Confetti - Red */}
        <div className="absolute top-[40%] left-[5%] w-3 h-3 bg-red-400 rounded-sm rotate-[30deg]" />
        <div className="absolute bottom-[10%] right-[30%] w-4 h-4 bg-red-500 rounded-full lg:w-5 lg:h-5 opacity-80" />
        <div className="absolute top-[70%] right-[40%] w-2 h-2 bg-red-300 rounded-sm" />
        <div className="absolute top-[55%] left-[18%] w-2.5 h-2.5 bg-red-400 rounded-full opacity-70" />
        <div className="absolute top-[20%] right-[45%] w-2 h-4 bg-red-300 rotate-[-45deg] opacity-50" />

        {/* Confetti - Green */}
        <div className="absolute top-[12%] right-[35%] w-3 h-3 bg-emerald-400 rounded-full" />
        <div className="absolute top-[65%] left-[30%] w-3 h-1.5 bg-emerald-500 rotate-[-20deg]" />
        <div className="absolute bottom-[35%] right-[5%] w-2 h-4 bg-emerald-400 rotate-45 opacity-60" />
        <div className="absolute top-[30%] left-[40%] w-2 h-2 bg-emerald-300 rounded-sm" />
        <div className="absolute bottom-[25%] left-[50%] w-3 h-3 bg-emerald-500 rounded-full opacity-30" />
        <div className="absolute top-[85%] right-[15%] w-4 h-2 bg-emerald-400 rotate-12" />

        {/* Minimalist Football Details */}
        <div className="absolute top-[5%] right-[5%] text-4xl lg:text-5xl opacity-20 rotate-12">⚽</div>
        <div className="absolute bottom-[5%] left-[5%] text-4xl lg:text-6xl opacity-20 -rotate-12">🏆</div>
        <div className="absolute top-[50%] left-[12%] text-2xl opacity-10 drop-shadow-sm">⭐</div>
        <div className="absolute bottom-[25%] right-[15%] text-4xl opacity-10 rotate-3">🇦🇷</div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {/* Floating confetti over form for mobile visibility */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-red-400 rounded-full animate-bounce shadow-sm" />
        <div className="absolute top-[20%] right-[8%] w-2 h-1 bg-yellow-400 rotate-45" />
        <div className="absolute bottom-[30%] left-[10%] w-1.5 h-1.5 bg-sky-400 rounded-sm" />
        <div className="absolute bottom-[10%] right-[5%] w-2 h-2 bg-emerald-400 rotate-12 animate-pulse" />
      </div>

      {/* Login form container */}
      <div className="
        w-full max-w-sm
        flex flex-col items-center justify-center
        px-6 py-0
        lg:px-0
        bg-white/80 backdrop-blur-sm lg:bg-transparent
        relative z-20
      ">
        <div className="w-full text-center">

          {/* EXTRA LARGE centered logo with zero margin */}
          <div className="flex justify-center -mb-6 lg:-mb-10">
            <Image
              src="/logo.png"
              alt="FiguMatch"
              width={600}
              height={200}
              className="w-[320px] lg:w-[550px] h-auto object-contain"
              priority
            />
          </div>

          {/* Slogan with brand typography style - tighter margin */}
          <div className="mb-6 transform -rotate-1">
            <p className="text-3xl lg:text-5xl font-black italic tracking-tighter leading-none">
              <span className="text-sky-500 drop-shadow-[0_3px_0_rgba(15,23,42,1)]">Intercambiá</span>{" "}
              <span className="text-gray-900 mx-1">tus figuritas</span>{" "}
              <span className="text-yellow-400 drop-shadow-[0_3px_0_rgba(15,23,42,1)] uppercase">AHORA</span>
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm mb-5 group"
          >
            <GoogleIcon />
            <span className="font-bold text-gray-700 text-sm">
              Continuar con Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
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

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <button type="button" className="text-xs text-sky-500 font-semibold hover:text-sky-600 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-sm shadow-lg shadow-sky-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-3">¿No tenés cuenta?</p>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-black text-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Crear cuenta gratis 🚀
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-[11px] mt-5">
            Al ingresar aceptás nuestros{" "}
            <span className="text-sky-500 font-semibold cursor-pointer">Términos</span>{" "}
            y{" "}
            <span className="text-sky-500 font-semibold cursor-pointer">Privacidad</span>
          </p>
        </div>
      </div>
    </div>
  );
}
