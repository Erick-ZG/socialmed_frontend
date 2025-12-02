import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import clsx from "../utils/clsx";
import useLocalStorageState from "../utils/useLocalStorageState";

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  locationLine: string;
  school: string;
  specialty: string;
  interests: string[];
  avatarUrl?: string;
  coverUrl?: string;
  about: string;
};

const SPECIALTIES = [
  "Medicina Interna",
  "Cirugía",
  "Pediatría",
  "Ginecología",
  "Anestesiología",
  "Cardiología",
  "Neurología",
  "Salud Pública",
  "Radiología",
  "Emergencias",
];

const INTERESTS = [
  "Evidencia clínica",
  "Ensayos clínicos",
  "Meta-análisis",
  "Guías",
  "Farmacología",
  "Dolor",
  "Infecciosas",
  "Cuidados críticos",
  "Epidemiología",
  "Diagnóstico",
  "IA en salud",
  "Educación médica",
  "Investigación joven",
  "Sistemas de salud",
];

export default function Onboarding() {
  const nav = useNavigate();
  const loc = useLocation();

  const [, setUser] = useLocalStorageState<UserProfile | null>("mv_user", null);

  const [step, setStep] = useState(1);

  const [name, setName] = useState("Yoel Solorzano");
  const [handle, setHandle] = useState("me");
  const [roleLine, setRoleLine] = useState("Estudiante de Medicina • Investigador joven");
  const [school, setSchool] = useState("UNT • Escuela de Medicina");
  const [locationLine, setLocationLine] = useState("Trujillo, Perú");
  const [specialty, setSpecialty] = useState("Medicina Interna");
  const [about, setAbout] = useState(
    "Me interesa descubrir nueva evidencia clínica, compartir papers con DOI y conectar con estudiantes e investigadores jóvenes."
  );

  const [interests, setInterests] = useState<string[]>(["Evidencia clínica", "Investigación joven", "IA en salud"]);
  const initials = useMemo(() => name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase(), [name]);

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length >= 3 && roleLine.trim().length >= 3 && school.trim().length >= 3;
    if (step === 2) return Boolean(specialty);
    if (step === 3) return interests.length >= 3;
    return true;
  }, [step, name, roleLine, school, specialty, interests.length]);

  function toggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  }

  function finish() {
    const profile: UserProfile = {
      handle: handle.trim() || "me",
      name: name.trim(),
      roleLine: roleLine.trim(),
      school: school.trim(),
      locationLine: locationLine.trim(),
      specialty,
      interests,
      about: about.trim(),
      avatarUrl: undefined,
      coverUrl: undefined,
    };

    setUser(profile);
    const to = loc?.state?.from || "/medcore";
    nav(to, { replace: true });
  }

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[30px] font-extrabold tracking-[-0.02em]">Bienvenido/a a Medverse</h2>
        <p className="mt-1 text-white/70">
          Configura tu especialidad + intereses para que tu Feed (“Para ti”) se sienta inteligente. (Todo mock frontend)
        </p>
      </div>

      <div className="grid grid-cols-[1.1fr_.9fr] gap-4 max-[980px]:grid-cols-1">
        <GlassCard className="p-6 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold">Configuración</div>
            <div className="text-sm text-white/60">Paso {step}/3</div>
          </div>

          {/* Stepper */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={clsx("h-2 rounded-full border border-white/10", step >= n ? "bg-white/20" : "bg-white/5")}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="mt-5 space-y-3">
              <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" />
              <Field label="Handle (perfil)" value={handle} onChange={setHandle} placeholder="ej. yoel" />
              <Field label="Headline" value={roleLine} onChange={setRoleLine} placeholder="ej. Estudiante • Investigador joven" />
              <Field label="Universidad" value={school} onChange={setSchool} placeholder="ej. UNT" />
              <Field label="Ubicación" value={locationLine} onChange={setLocationLine} placeholder="ej. Trujillo, Perú" />
              <label className="block text-sm text-white/70">
                Sobre mí
                <textarea
                  className="mt-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/40"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Bio corta..."
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-5">
              <div className="text-sm text-white/70">Elige tu especialidad principal</div>
              <div className="mt-3 grid grid-cols-2 gap-2 max-[520px]:grid-cols-1">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecialty(s)}
                    className={clsx(
                      "rounded-2xl border border-white/10 px-4 py-3 text-left hover:bg-white/10",
                      specialty === s ? "bg-white/10" : "bg-white/5"
                    )}
                  >
                    <div className="font-bold">{s}</div>
                    <div className="mt-1 text-xs text-white/60">Ajusta tu Feed + Trending</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white/70">Elige al menos 3 intereses</div>
                <div className="text-xs text-white/60">{interests.length}/3+</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {INTERESTS.map((t) => {
                  const active = interests.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleInterest(t)}
                      className={clsx(
                        "rounded-full border px-3 py-2 text-sm",
                        active
                          ? "border-cyan-300/25 bg-cyan-300/10 text-white"
                          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                      )}
                    >
                      {active ? (
                        <span className="inline-flex items-center gap-2">
                          <Check size={16} /> {t}
                        </span>
                      ) : (
                        t
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={clsx(
                "rounded-full border border-white/10 px-4 py-2.5",
                step === 1 ? "opacity-40 cursor-not-allowed" : "bg-white/5 hover:bg-white/10"
              )}
              disabled={step === 1}
            >
              Atrás
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
                  canNext
                    ? "border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 hover:brightness-105"
                    : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                )}
                disabled={!canNext}
              >
                Siguiente <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={finish}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
                  canNext
                    ? "border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 hover:brightness-105"
                    : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                )}
                disabled={!canNext}
              >
                <Sparkles size={16} /> Finalizar
              </button>
            )}
          </div>
        </GlassCard>

        {/* Preview card */}
        <GlassCard className="p-6 shadow-none">
          <div className="text-lg font-extrabold">Vista previa</div>
          <p className="mt-2 text-sm text-white/70">Así se verá tu perfil.</p>

          <div className="mt-4 flex items-center gap-3">
            <Avatar initials={initials} size={62} />
            <div>
              <div className="font-extrabold">{name || "Tu nombre"}</div>
              <div className="mt-1 text-xs text-white/65">{roleLine || "Headline"}</div>
              <div className="mt-1 text-xs text-white/55">
                {school || "Universidad"} · {locationLine || "Ubicación"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-bold text-white/90">Especialidad</div>
            <div className="mt-2 text-sm text-white/70">{specialty}</div>

            <div className="mt-4 text-sm font-bold text-white/90">Intereses</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(interests.length ? interests : ["Elige intereses..."]).map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-white/60">
            Tip: después del onboarding, revisa <span className="text-white/80">MedCore → Para ti</span> y{" "}
            <span className="text-white/80">Trending</span>.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-white/70">
      {label}
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
