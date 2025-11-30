import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Sparkles, Repeat2, Bookmark, MessageSquare, Play } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import clsx from "../utils/clsx";

type Reel = {
  id: string;
  author: { name: string; initials: string; headline: string };
  doi: string;
  title: string;
  hook: string;
  spark: number;
  recast: number;
  rounds: number;
};

const REELS: Reel[] = [
  {
    id: "r1",
    author: { name: "Dr. Sara Morrison", initials: "SM", headline: "Anesthesiology • Periop care" },
    doi: "10.1234/medverse.2025.001",
    title: "Perioperative hypotension: por qué importan tiempo + profundidad",
    hook: "Resumen en 60s: qué mirar antes de cambiar tus objetivos.",
    spark: 1200,
    recast: 140,
    rounds: 62,
  },
  {
    id: "r2",
    author: { name: "Intern Vale", initials: "IV", headline: "Estudiante de medicina • Journal club" },
    doi: "10.5678/medverse.2024.042",
    title: "Workflow de systematic review (amigable para estudiantes)",
    hook: "El pipeline más simple para empezar síntesis de evidencia hoy.",
    spark: 780,
    recast: 88,
    rounds: 41,
  },
];

export default function Reels() {
  const [idx, setIdx] = useState(0);
  const reel = useMemo(() => REELS[Math.min(REELS.length - 1, Math.max(0, idx))], [idx]);

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em]">Reels (Video Notes)</h2>
        <p className="mt-1 text-white/70">Comentario corto estilo TikTok sobre un DOI (frontend mock)</p>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 max-[880px]:grid-cols-1">
        <GlassCard className="relative h-[78vh] min-h-[520px] overflow-hidden shadow-none">
          <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_70%_0%,rgba(140,107,255,.18),transparent_60%),radial-gradient(700px_340px_at_30%_30%,rgba(52,208,255,.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/75" />

          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3">
                <Avatar initials={reel.author.initials} size={44} />
                <div>
                  <div className="font-extrabold">{reel.author.name}</div>
                  <div className="text-xs text-white/65">{reel.author.headline}</div>
                </div>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                DOI · {reel.doi}
              </div>
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                <Play size={16} /> <span className="text-sm">Video (mock)</span>
              </div>

              <div className="text-2xl font-extrabold">{reel.title}</div>
              <div className="mt-2 text-white/75">{reel.hook}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill label={`Spark ${reel.spark}`} icon={<Sparkles size={16} />} />
                <Pill label={`Recast ${reel.recast}`} icon={<Repeat2 size={16} />} />
                <Pill label={`Rounds ${reel.rounds}`} icon={<MessageSquare size={16} />} />
                <Pill label="Orbit" icon={<Bookmark size={16} />} />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className={clsx(
              "rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10",
              idx === 0 && "opacity-40 cursor-not-allowed"
            )}
            disabled={idx === 0}
            aria-label="Anterior"
          >
            <ChevronUp />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(REELS.length - 1, i + 1))}
            className={clsx(
              "rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10",
              idx === REELS.length - 1 && "opacity-40 cursor-not-allowed"
            )}
            disabled={idx === REELS.length - 1}
            aria-label="Siguiente"
          >
            <ChevronDown />
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
      {icon} {label}
    </span>
  );
}
