import { useMemo, useState } from "react";
import { ExternalLink, Filter, Search } from "lucide-react";
import GlassCard from "../components/GlassCard";
import clsx from "../utils/clsx";

type ToolItem = {
  name: string;
  category: string;
  pricing: "Gratis" | "De pago";
  description: string;
  tags: string[];
};

const TOOLS: ToolItem[] = [
  { name: "Radiopaedia", category: "Imágenes", pricing: "Gratis", description: "Casos + aprendizaje para radiología.", tags: ["casos", "educación"] },
  { name: "UpToDate", category: "Evidencia", pricing: "De pago", description: "Apoyo a decisiones clínicas con resúmenes.", tags: ["guías", "point-of-care"] },
  { name: "PubMed", category: "Literatura", pricing: "Gratis", description: "Búsqueda de literatura biomédica.", tags: ["doi", "indexación"] },
  { name: "Zotero", category: "Investigación", pricing: "Gratis", description: "Gestor de referencias y citas.", tags: ["bibliografía", "librería"] },
  { name: "BMJ Best Practice", category: "Evidencia", pricing: "De pago", description: "Aportes para diagnóstico + tratamiento.", tags: ["point-of-care"] },
  { name: "MDCalc", category: "Calculadoras", pricing: "Gratis", description: "Calculadoras clínicas y scores.", tags: ["scores", "herramientas"] },
  { name: "Osmosis", category: "Aprendizaje", pricing: "De pago", description: "Aprendizaje visual de temas médicos.", tags: ["video", "study"] },
  { name: "OpenEvidence (mock)", category: "IA", pricing: "De pago", description: "Responde preguntas clínicas con citas.", tags: ["ai", "resúmenes"] },
];

const CATEGORIES = ["Todas", "Evidencia", "Literatura", "Investigación", "Imágenes", "Calculadoras", "Aprendizaje", "IA"] as const;

export default function MedTools() {
  const [q, setQ] = useState("");
  const [pricing, setPricing] = useState<"Todas" | "Gratis" | "De pago">("Todas");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Todas");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const okQ =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((x) => x.toLowerCase().includes(query));
      const okP = pricing === "Todas" ? true : t.pricing === pricing;
      const okC = cat === "Todas" ? true : t.category === cat;
      return okQ && okP && okC;
    });
  }, [q, pricing, cat]);

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em]">MedTools</h2>
        <p className="mt-1 text-white/70">Apps/webs de medicina por categorías + Gratis/De pago (mock).</p>
      </div>

      <GlassCard className="p-4 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
            <Search size={16} className="opacity-80" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar herramientas por nombre, etiqueta o propósito…"
              className="w-full bg-transparent outline-none placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
                pricing === "Todas" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              )}
              onClick={() => setPricing("Todas")}
            >
              <Filter size={16} /> Todas
            </button>

            {(["Gratis", "De pago"] as const).map((p) => (
              <button
                key={p}
                className={clsx(
                  "rounded-full border border-white/10 px-4 py-2.5",
                  pricing === p ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                )}
                onClick={() => setPricing(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={clsx(
                "rounded-full border border-white/10 px-3 py-2 text-xs",
                cat === c ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="mt-4 grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {filtered.map((t) => (
          <GlassCard key={t.name} className="p-5 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">{t.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    {t.category}
                  </span>
                  <span
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs",
                      t.pricing === "Gratis"
                        ? "border-teal-300/25 bg-teal-300/10 text-white/80"
                        : "border-violet-300/25 bg-violet-300/10 text-white/80"
                    )}
                  >
                    {t.pricing}
                  </span>
                </div>
              </div>

              <button className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10" aria-label="Abrir (mock)">
                <ExternalLink size={18} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/70">{t.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
