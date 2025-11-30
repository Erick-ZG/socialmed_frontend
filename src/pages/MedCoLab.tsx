import { useMemo, useState } from "react";
import { FlaskConical, Search, ArrowRight } from "lucide-react";
import GlassCard from "../components/GlassCard";
import clsx from "../utils/clsx";

type Project = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  lookingFor: string[];
  stage: "Idea" | "Reclutando" | "En progreso" | "Enviado";
};

const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Resúmenes rápidos DOI → Abstract (liderado por estudiantes)",
    tags: ["IA en salud", "Evidencia clínica"],
    summary: "Prototipo para obtener metadatos del DOI y generar un abstract estructurado + puntos clave.",
    lookingFor: ["Frontend (React)", "NLP/LLM prompt", "Revisor clínico"],
    stage: "Reclutando",
  },
  {
    id: "p2",
    title: "Journal Club: mapa de evidencia de medicina interna",
    tags: ["Medicina Interna", "Meta-análisis", "Educación médica"],
    summary: "Crear un mapa de evidencia por tema y discutir semanalmente con Reels cortos.",
    lookingFor: ["Coautores", "Moderador", "Diseño"],
    stage: "En progreso",
  },
  {
    id: "p3",
    title: "StudyOrbit: salas de estudio + impacto en racha",
    tags: ["Educación médica", "Sistemas de salud"],
    summary: "Explorar si micro salas de estudio mejoran adherencia y retención (encuesta + logs).",
    lookingFor: ["Diseño de encuesta", "Estadística", "Líder de comunidad"],
    stage: "Idea",
  },
];

export default function MedCoLab() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All"); // mantenemos "All" internamente

  const tags = useMemo(() => ["All", ...Array.from(new Set(PROJECTS.flatMap((p) => p.tags)))], []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      const okQ = !query || p.title.toLowerCase().includes(query) || p.summary.toLowerCase().includes(query);
      const okT = tag === "All" ? true : p.tags.includes(tag);
      return okQ && okT;
    });
  }, [q, tag]);

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em]">MedCoLab</h2>
        <p className="mt-1 text-white/70">Encuentra y colabora en proyectos de investigación (frontend mock).</p>
      </div>

      <GlassCard className="p-4 shadow-none">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
            <Search size={16} className="opacity-80" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar proyectos…"
              className="w-full bg-transparent outline-none placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={clsx(
                  "rounded-full border border-white/10 px-3 py-2 text-xs",
                  tag === t ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {t === "All" ? "Todos" : t}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="mt-4 grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
        {list.map((p) => (
          <GlassCard key={p.id} className="p-5 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">{p.title}</div>
                <div className="mt-2 text-sm text-white/70">{p.summary}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                <FlaskConical size={18} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                  {t}
                </span>
              ))}
              <span className="ml-auto rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs text-white/80">
                {p.stage}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-bold">Buscamos</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                {p.lookingFor.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 px-4 py-2.5 hover:brightness-105">
              Postular / Unirme <ArrowRight size={16} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
