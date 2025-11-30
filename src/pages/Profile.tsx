import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Pencil, Building2 } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import clsx from "../utils/clsx";

type ProfileData = {
  name: string;
  roleLine: string;
  locationLine: string;
  avatarUrl?: string;
  coverUrl?: string;
  about: string;
  stats: Array<{ value: string; label: string }>;
  experience: Array<{ role: string; org: string; where: string; dates: string }>;
};

const PROFILES: Record<string, ProfileData> = {
  "dr-john-hernandez": {
    name: "Dr. John R. Hernandez",
    roleLine: "Doctor de Medicina Interna",
    locationLine: "Quito, Ecuador",
    avatarUrl: "/doc.webp",
    coverUrl: "/esp.jpeg",
    about:
      "Doctor de Medicina Interna con más de 10 años de experiencia en el diagnóstico y tratamiento de enfermedades complejas. Apasionado por la investigación y la publicación de evidencia clínica relevante. Dedicado a brindar atención de calidad y colaborar con colegas para mejorar el cuidado de la salud.",
    stats: [
      { value: "7", label: "Publicaciones" },
      { value: "2", label: "Colaboraciones" },
      { value: "1", label: "Conexiones" },
    ],
    experience: [
      { role: "Médico internista", org: "Hospital Metropolitano", where: "Quito, Ecuador", dates: "Oct 2017 — presente" },
      { role: "Residente de Medicina Interna", org: "Hospital Metropolitano", where: "Quito, Ecuador", dates: "—" },
    ],
  },
};

export default function Profile() {
  const { handle } = useParams();
  const data = useMemo(() => PROFILES[handle ?? "dr-john-hernandez"] ?? PROFILES["dr-john-hernandez"], [handle]);
  const [tab, setTab] = useState<"about" | "activity">("about");

  const initials = data.name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();

  return (
    <div className="pt-2">
      <section
        className="relative overflow-hidden rounded-3xl border border-white/10 shadow-glow"
        style={{
          backgroundImage: data.coverUrl
            ? `url(${data.coverUrl})`
            : "radial-gradient(1100px 650px at 70% 70%, rgba(47,102,255,.18), transparent 58%), radial-gradient(900px 520px at 35% 65%, rgba(140,107,255,.16), transparent 56%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_35%,rgba(0,0,0,.35),rgba(0,0,0,.78)),linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.75))]" />

        <div className="relative px-7 pb-5 pt-9">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 max-[980px]:grid-cols-1 max-[980px]:justify-items-center max-[980px]:text-center">
            <Avatar initials={initials} src={data.avatarUrl} alt={data.name} size={132} />

            <div className="min-w-0">
              <h1 className="m-0 text-[clamp(34px,4.2vw,58px)] font-extrabold leading-[1.05] tracking-[-0.045em] [text-shadow:0_8px_30px_rgba(0,0,0,.55)]">
                {data.name}
              </h1>
              <div className="mt-2 text-[16px] text-white/80">{data.roleLine}</div>
              <div className="mt-2 inline-flex items-center gap-2 text-white/70">
                <MapPin size={16} /> {data.locationLine}
              </div>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 px-4 py-3 hover:brightness-105 max-[980px]:w-[min(260px,100%)] max-[980px]:justify-center">
              <Pencil size={16} /> Editar perfil
            </button>
          </div>

          <div className="mt-7 flex items-center gap-9 text-[28px] font-bold tracking-[-0.02em] max-[980px]:justify-center">
            <button
              className={clsx("relative bg-transparent p-0 text-white/70", tab === "about" && "text-white/95")}
              onClick={() => setTab("about")}
            >
              Sobre mí
              {tab === "about" && <span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded bg-white/60" />}
            </button>
            <button
              className={clsx("relative bg-transparent p-0 text-white/70", tab === "activity" && "text-white/95")}
              onClick={() => setTab("activity")}
            >
              Actividad
              {tab === "activity" && <span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded bg-white/60" />}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-4">
        {tab === "about" ? (
          <>
            <div className="grid grid-cols-[1.65fr_.85fr] gap-4 max-[980px]:grid-cols-1">
              <GlassCard className="p-5 shadow-none">
                <p className="m-0 text-[14.5px] leading-[1.75] text-white/75">{data.about}</p>
              </GlassCard>

              <GlassCard className="p-5 shadow-none">
                <div className="grid grid-cols-2 gap-3">
                  {data.stats.map((s, idx) => (
                    <div
                      key={s.label}
                      className={clsx(
                        "rounded-2xl border border-white/10 bg-white/5 p-4",
                        idx === data.stats.length - 1 && "col-span-2"
                      )}
                    >
                      <div className="text-[34px] font-extrabold tracking-tight">{s.value}</div>
                      <div className="mt-1 text-[13px] text-white/65">{s.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div className="mt-1 text-[28px] font-extrabold tracking-[-0.02em]">Experiencia</div>

            <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
              {data.experience.map((e, idx) => (
                <GlassCard key={idx} className="flex gap-4 p-5 shadow-none">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    <Building2 size={26} />
                  </div>
                  <div>
                    <div className="text-[18px] font-extrabold">{e.role}</div>
                    <div className="mt-2 font-semibold text-white/75">{e.org}</div>
                    <div className="mt-2 text-white/60">{e.where}</div>
                    <div className="mt-2 text-white/60">{e.dates}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        ) : (
          <GlassCard className="p-5 shadow-none">
            <div className="text-[22px] font-extrabold">Actividad reciente (mock)</div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mt-1 h-[10px] w-[10px] rounded-full bg-cyan-300 shadow-[0_0_26px_rgba(52,208,255,.35)]" />
              <div>
                <div className="font-bold">Comentó en un hilo con DOI</div>
                <div className="mt-1 text-xs text-white/60">Hace 2h</div>
              </div>
            </div>

            <div className="mt-3 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mt-1 h-[10px] w-[10px] rounded-full bg-cyan-300 shadow-[0_0_26px_rgba(52,208,255,.35)]" />
              <div>
                <div className="font-bold">Hizo Recast a un paper con video note</div>
                <div className="mt-1 text-xs text-white/60">Ayer</div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
