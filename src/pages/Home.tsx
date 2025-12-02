import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useLocalStorageState from "../utils/useLocalStorageState";

type Session = { handle: string; loggedInAt: string };

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  school: string;
  locationLine: string;
  specialty: string;
  interests: string[];
};

function nowISO() {
  return new Date().toISOString();
}

function buildDemoProfile(handleRaw?: string): UserProfile {
  const handle = (handleRaw || "daniel.mego").trim().toLowerCase().replace(/\s+/g, ".");
  const name =
    handle === "yoel.solorzano" || handle === "yoel"
      ? "Yoel Solorzano"
      : handle
          .split(".")
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(" ");

  return {
    handle,
    name,
    roleLine: "Estudiante de Medicina • Investigador joven",
    school: "Universidad (mock)",
    locationLine: "LatAm",
    specialty: "Medicina Interna",
    interests: ["Evidencia clínica", "IA en salud", "Investigación joven"],
  };
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[340px] max-w-[92vw]">
      <div className="absolute left-6 top-8 h-[560px] w-[290px] -rotate-6 rounded-[42px] bg-[#111827] shadow-[0_35px_120px_rgba(0,0,0,.25)]" />
      <div className="relative h-[600px] w-[320px] rounded-[48px] border border-black/10 bg-white shadow-[0_35px_120px_rgba(0,0,0,.18)]">
        <div className="mx-auto mt-5 h-2 w-20 rounded-full bg-black/10" />

        <div className="mx-5 mt-5 h-[520px] overflow-hidden rounded-[36px] border border-black/5 bg-gradient-to-b from-[#f5f3ff] via-white to-[#ecfeff]">
          <div className="relative p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[12px] shadow-sm">
              <span className="text-base">🔥</span>
              <span className="text-base">💡</span>
              <span className="text-base">💜</span>
              <span className="ml-1 text-black/70">Sparks</span>
            </div>

            <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-[12px] text-white shadow-sm">
              <span className="text-base">★</span>
              <span>Orbit</span>
            </div>
          </div>

          <div className="px-4">
            <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-black/10" />
                <div className="min-w-0">
                  <div className="h-3 w-40 rounded bg-black/10" />
                  <div className="mt-2 h-2 w-28 rounded bg-black/5" />
                </div>
              </div>
              <div className="mt-4 h-24 rounded-2xl bg-black/5" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-black/10" />
                <div className="h-8 w-20 rounded-full bg-[#3b82f6]/15" />
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-white/70 p-4 shadow-sm">
              <div className="h-3 w-52 rounded bg-black/10" />
              <div className="mt-3 h-2 w-44 rounded bg-black/5" />
              <div className="mt-4 h-28 rounded-2xl bg-black/5" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white/80 px-6 py-4">
            <div className="flex items-center justify-between text-black/40">
              <div className="h-2 w-10 rounded bg-black/10" />
              <div className="h-2 w-10 rounded bg-black/10" />
              <div className="h-2 w-10 rounded bg-black/10" />
              <div className="h-2 w-10 rounded bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();

  const [session, setSession] = useLocalStorageState<Session | null>("mv_session", null);
  const [, setUser] = useLocalStorageState<UserProfile | null>("mv_user", null);

  // Si ya está logeado: no hay home. Redirige a MedCore.
  if (session) return <Navigate to="/medcore" replace />;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(
    () => identifier.trim().length > 0 && password.trim().length > 0,
    [identifier, password]
  );

  function loginDemo(handleOverride?: string) {
    const demo = buildDemoProfile(handleOverride || identifier);

    setUser(demo);
    setSession({ handle: demo.handle, loggedInAt: nowISO() });

    // ✅ redirect inmediato (no dependas del rerender)
    nav("/medcore", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#262626]">
      <div className="mx-auto grid w-full max-w-[1040px] grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-2 md:py-16">
        <div className="hidden md:block">
          <PhoneMock />
        </div>

        <div className="mx-auto w-full max-w-[380px]">
          <div className="rounded-sm border border-black/10 bg-white px-10 py-10">
            <div className="text-center">
              <div className="text-[44px] font-black tracking-tight">Medverse</div>
              <div className="mt-2 text-[13px] text-black/60">Evidence meets social learning (mock).</div>
            </div>

            <form
              className="mt-8 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                loginDemo();
              }}
            >
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Teléfono, usuario o correo electrónico"
                className="h-11 w-full rounded border border-black/15 bg-[#fafafa] px-3 text-[13px] outline-none focus:border-black/30"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                type="password"
                className="h-11 w-full rounded border border-black/15 bg-[#fafafa] px-3 text-[13px] outline-none focus:border-black/30"
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-3 h-10 w-full rounded-lg text-[14px] font-semibold text-white ${
                  canSubmit ? "bg-[#4f6ef7] hover:brightness-95" : "bg-[#9bb2ff] cursor-not-allowed"
                }`}
              >
                Iniciar sesión
              </button>

              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/10" />
                <div className="text-[12px] font-semibold text-black/35">O</div>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <button
                type="button"
                onClick={() => loginDemo("yoel.solorzano")}
                className="h-10 w-full rounded-lg border border-black/10 bg-white text-[14px] font-semibold text-[#385185] hover:bg-black/[0.02]"
              >
                Entrar con demo
              </button>

              <div className="mt-4 text-center text-[12px]">
                <button type="button" className="text-black/60 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </div>

          <div className="mt-3 rounded-sm border border-black/10 bg-white px-10 py-6 text-center text-[14px]">
            ¿No tienes una cuenta?{" "}
            <button type="button" className="font-semibold text-[#4f6ef7] hover:underline">
              Regístrate
            </button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-black/45">
            <span>Meta</span>
            <span>Información</span>
            <span>Blog</span>
            <span>Empleo</span>
            <span>Ayuda</span>
            <span>Privacidad</span>
            <span>Condiciones</span>
            <span>Ubicaciones</span>
          </div>

          <div className="mt-6 flex justify-center gap-2 text-[12px]">
            <Link className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 hover:bg-black/[0.02]" to="/medcore">
              MedCore
            </Link>
            <Link className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 hover:bg-black/[0.02]" to="/medtools">
              MedTools
            </Link>
            <Link className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 hover:bg-black/[0.02]" to="/medcolab">
              MedCoLab
            </Link>
            <Link className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 hover:bg-black/[0.02]" to="/medmates">
              MedMates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
