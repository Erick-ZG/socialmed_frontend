import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Link2,
  MessageSquare,
  Repeat2,
  Send,
  Sparkles,
  Orbit,
  TrendingUp,
  Video,
  Wand2,
  ExternalLink,
  Copy,
  Users,
  Flame,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import clsx from "../utils/clsx";
import useLocalStorageState from "../utils/useLocalStorageState";

type DoiPreview = {
  doi: string;
  title: string;
  venue: string;
  year: string;
  abstract: string;
  keyPoints: string[];
  tags: string[];
};

type AiPack = {
  doi: string;
  generatedAt: string;
  background: string;
  methods: string;
  results: string;
  takeaway: string;
  keyPoints: string[];
  miniFigure: { label: string; value: string }[];
};

type Post = {
  id: string;
  author: { handle: string; name: string; initials: string; headline: string };
  createdAt: string;
  doi?: DoiPreview;
  text: string;
  hasVideoNote?: boolean;

  metrics: { reads: number };

  spark: { count: number; active: boolean; likedBy: string[] };
  orbit: { active: boolean };
  recast: { count: number };
  rounds: { count: number; items: { by: string; text: string }[] };
};

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  school: string;
  locationLine: string;
  specialty: string;
  interests: string[];
};

const DOI_DB: Record<string, DoiPreview> = {
  "10.1234/medverse.2025.001": {
    doi: "10.1234/medverse.2025.001",
    title: "Hipotensión perioperatoria: umbrales pragmáticos y desenlaces (mock)",
    venue: "Revista Medverse (mock)",
    year: "2025",
    abstract:
      "Antecedentes: La hipotensión durante la cirugía es común. Métodos: analizamos trayectorias perioperatorias de PAM y desenlaces. Resultados: una PAM baja sostenida se asoció con más eventos adversos. Conclusión: el riesgo depende del tiempo y la profundidad.",
    keyPoints: [
      "La profundidad + duración importan más que un solo umbral",
      "Los subgrupos de alto riesgo muestran asociaciones más fuertes",
      "Las metas deben individualizarse, no ser talla única",
    ],
    tags: ["anestesia", "hemodinámica", "perioperatorio"],
  },
  "10.5678/medverse.2024.042": {
    doi: "10.5678/medverse.2024.042",
    title: "Ruta para jóvenes investigadores en síntesis de evidencia (mock)",
    venue: "Open Methods (mock)",
    year: "2024",
    abstract:
      "Esta guía propone un flujo de trabajo liviano para búsqueda sistemática, cribado y síntesis, pensado para estudiantes y clínicos en etapas tempranas.",
    keyPoints: ["Define PICO desde el inicio", "Cribado reproducible", "Resume con grado de certeza"],
    tags: ["investigación", "revisión-sistemática", "métodos"],
  },
};

function nowLabel() {
  const d = new Date();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slug(s: string) {
  return (s || "").toLowerCase().trim();
}

const INTEREST_MAP: Record<string, string[]> = {
  "evidencia clínica": ["evidence", "clinical", "outcome", "association", "risk", "effect", "trial", "meta"],
  "ensayos clínicos": ["trial", "random", "rct"],
  "meta-análisis": ["meta", "systematic", "forest", "review"],
  "guías": ["guideline", "recommend", "consensus"],
  "farmacología": ["drug", "dose", "pharm", "adverse"],
  "dolor": ["pain", "analges", "opioid"],
  "infecciosas": ["infection", "sepsis", "antibiotic"],
  "cuidados críticos": ["icu", "critical", "ventilation", "shock"],
  "epidemiología": ["cohort", "incidence", "prevalence"],
  "diagnóstico": ["diagnostic", "sensitivity", "specificity", "screening"],
  "ia en salud": ["ai", "machine", "model", "neural", "algorithm"],
  "educación médica": ["education", "learning", "curriculum", "journal club"],
  "investigación joven": ["student", "early-career", "young", "roadmap"],
  "sistemas de salud": ["health system", "policy", "quality", "implementation"],
};

const SPECIALTY_MAP: Record<string, string[]> = {
  "medicina interna": ["internal", "complex", "diagnostic", "cohort", "clinical"],
  "anestesiología": ["anesthesia", "perioperative", "pain", "hemodynamics", "map"],
  "cardiología": ["cardio", "heart", "bp", "risk"],
  "pediatría": ["pediatric", "children", "neonatal"],
  "salud pública": ["public", "population", "policy", "incidence"],
  "radiología": ["imaging", "radiology", "scan", "ct", "mri"],
  "emergencias": ["emergency", "triage", "acute"],
  "neurología": ["neuro", "stroke", "seizure"],
  "ginecología": ["pregnancy", "obstetric", "gyne"],
  "cirugía": ["surgery", "operative", "perioperative"],
};

function normTextForMatch(p: Post) {
  const parts = [
    p.text,
    p.doi?.doi,
    p.doi?.title,
    p.doi?.venue,
    p.doi?.abstract,
    ...(p.doi?.tags ?? []),
  ].filter(Boolean) as string[];
  return parts.join(" ").toLowerCase();
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generateAiPack(doi: DoiPreview): AiPack {
  const seed = hashStr(doi.doi + "|" + doi.title);
  const rnd = mulberry32(seed);

  const pick = (xs: string[]) => xs[Math.floor(rnd() * xs.length)];

  const bg = [
    "Pregunta clínica: por qué importa para decisiones del día a día.",
    "Contexto: escenario común con trade-offs de riesgo no triviales.",
    "Justificación: umbrales pequeños pueden tener grandes consecuencias.",
  ];
  const meth = [
    "Métodos: diseño + cohorte + cómo se midieron exposición y desenlaces.",
    "Métodos: análisis pragmático centrado en endpoints clínicamente relevantes.",
    "Métodos: flujo estructurado con pasos reproducibles para investigadores jóvenes.",
  ];
  const res = [
    "Resultados: señales del efecto con incertidumbre; heterogeneidad probable.",
    "Resultados: la señal más fuerte aparece en subgrupos de mayor riesgo.",
    "Resultados: asociación consistente cuando la exposición es sostenida (tiempo + profundidad).",
  ];
  const tk = [
    "Conclusión práctica: aplica con metas conservadoras y específicas por paciente.",
    "Conclusión práctica: flujo simple: define PICO → criba → resume la certeza.",
    "Conclusión práctica: trata la exposición como dosis (intensidad × tiempo), no como binario.",
  ];

  const k1 = [
    "La dirección del desenlace primario coincide con la hipótesis (mock).",
    "Útil para journal club y resúmenes rápidos de evidencia (mock).",
    "La señal por subgrupos sugiere dónde enfocar el monitoreo (mock).",
  ];
  const k2 = [
    "Limitación: sesgo observacional / confusión no controlada (mock).",
    "Limitación: la generalización depende del entorno y los umbrales (mock).",
    "Limitación: el flujo aún requiere revisión de dominio para evitar simplificar de más (mock).",
  ];
  const k3 = [
    "Nota clínica: ajusta según riesgo basal y contexto del paciente.",
    "Práctico: 1 frase de resumen + 1 limitación mejora la calidad al compartir.",
    "Siguiente paso: se necesita validación prospectiva / replicación.",
  ];

  const figLabels = ["Efecto", "Certeza", "Aplicabilidad", "Señal", "Complejidad"];
  const figVals = ["Bajo", "Moderado", "Alto", "Mixto", "Fuerte", "Incierto"];

  const miniFigure = Array.from({ length: 3 }).map(() => ({
    label: pick(figLabels),
    value: pick(figVals),
  }));

  return {
    doi: doi.doi,
    generatedAt: nowLabel(),
    background: pick(bg),
    methods: pick(meth),
    results: pick(res),
    takeaway: pick(tk),
    keyPoints: [pick(k1), pick(k2), pick(k3)],
    miniFigure,
  };
}

export default function MedCore() {
  const [mode, setMode] = useState<"forYou" | "trending">("forYou");
  const [doiInput, setDoiInput] = useState("10.1234/medverse.2025.001");
  const [text, setText] = useState("");
  const [videoNote, setVideoNote] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const [user] = useLocalStorageState<UserProfile | null>("mv_user", null);
  const [following] = useLocalStorageState<string[]>("mv_following", []);

  const [aiByDoi, setAiByDoi] = useLocalStorageState<Record<string, AiPack>>("mv_ai_by_doi", {});
  const [posts, setPosts] = useLocalStorageState<Post[]>("mv_posts", [
    {
      id: "p1",
      author: {
        handle: "sara.m",
        name: "Dra. Sara Morrison",
        initials: "SM",
        headline: "Anestesiología | Cuidado perioperatorio",
      },
      createdAt: nowLabel(),
      doi: DOI_DB["10.1234/medverse.2025.001"],
      text:
        "Hot take: la hipotensión no es binaria. La trato como exposición tiempo+profundidad. En guardia veo subgrupos con metas basales distintas.",
      hasVideoNote: true,
      metrics: { reads: 124 },
      spark: { count: 218, active: false, likedBy: ["intern-vale", "carlos.r"] },
      orbit: { active: false },
      recast: { count: 37 },
      rounds: {
        count: 2,
        items: [
          { by: "med-student-ana", text: "De acuerdo. ¿Y la dosis-respuesta de vasopresores?" },
          { by: "resident-yoel", text: "Buenazo para journal club." },
        ],
      },
    },
    {
      id: "p2",
      author: {
        handle: "john.h",
        name: "Dr. John R. Hernandez",
        initials: "JH",
        headline: "Medicina Interna | Investigación aplicada",
      },
      createdAt: nowLabel(),
      doi: DOI_DB["10.5678/medverse.2024.042"],
      text:
        "Ruta para jóvenes investigadores: checklist liviano para búsqueda y cribado. Me funcionó con 2 RCTs de sepsis sin volverme loco.",
      hasVideoNote: false,
      metrics: { reads: 56 },
      spark: { count: 94, active: false, likedBy: ["carlos.r"] },
      orbit: { active: true },
      recast: { count: 12 },
      rounds: { count: 1, items: [{ by: "intern-vale", text: "¿Sirve para revisión rápida en guardia?" }] },
    },
    {
      id: "p3",
      author: {
        handle: "vale.intern",
        name: "Valeria Soto",
        initials: "VS",
        headline: "Interna | Rotación UCI",
      },
      createdAt: nowLabel(),
      text:
        "Caso: paciente post-cirugía con PAM bailarina. Uso metas de PAM adaptadas al basal y me funcionó mejor que 65 fijo.",
      metrics: { reads: 78 },
      spark: { count: 61, active: false, likedBy: ["sara.m", "carlos.r"] },
      orbit: { active: false },
      recast: { count: 9 },
      rounds: { count: 3, items: [{ by: "sara.m", text: "Clave: medir tiempo bajo umbral." }] },
    },
    {
      id: "p4",
      author: {
        handle: "carlos.r",
        name: "Dr. Carlos Ruiz",
        initials: "CR",
        headline: "Emergencias | Docente",
      },
      createdAt: nowLabel(),
      text:
        "Teaching pearl: al presentar un paper, di 1 aplicación clínica y 1 limitación. El equipo lo recuerda mejor.",
      hasVideoNote: false,
      metrics: { reads: 42 },
      spark: { count: 33, active: false, likedBy: ["john.h"] },
      orbit: { active: true },
      recast: { count: 6 },
      rounds: { count: 0, items: [] },
    },
    {
      id: "p5",
      author: {
        handle: "andrea.cardio",
        name: "Dra. Andrea Vega",
        initials: "AV",
        headline: "Cardiología | Imagen avanzada",
      },
      createdAt: nowLabel(),
      text:
        "Hallazgo: eco de stress en paciente joven con dolor atípico. Calcium score bajo cambia probabilidad pre-test antes de troponinas.",
      metrics: { reads: 91 },
      spark: { count: 102, active: false, likedBy: ["vale.intern", "john.h"] },
      orbit: { active: false },
      recast: { count: 14 },
      rounds: { count: 2, items: [{ by: "john.h", text: "Prob pre-test antes de pedir troponinas: clave." }] },
    },
    {
      id: "p6",
      author: {
        handle: "sofia.id",
        name: "Sofia Diaz",
        initials: "SD",
        headline: "Infecciosas | Fellow",
      },
      createdAt: nowLabel(),
      text:
        "Nota rápida: en IA de imágenes pidan sensibilidad/especificidad y calibración. AUROC no dice riesgo absoluto.",
      metrics: { reads: 64 },
      spark: { count: 44, active: false, likedBy: ["andrea.cardio"] },
      orbit: { active: false },
      recast: { count: 8 },
      rounds: { count: 1, items: [{ by: "carlos.r", text: "Ojo con prevalencia local, sobreajuste." }] },
    },
  ]);

  const doiPreview = useMemo(() => {
    const key = doiInput.trim();
    if (!key) return null;
    return DOI_DB[key] ?? null;
  }, [doiInput]);

  const youHandle = user?.handle || "you";
  const youName = user?.name || "T (Prototipo)";
  const youHeadline = user ? `${user.roleLine} • ${user.school}` : "Estudiante • Investigador/a joven";
  const youInitials = useMemo(() => {
    const n = youName.split(" ").filter(Boolean);
    return n
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() || "TU";
  }, [youName]);

  const trending = useMemo(() => {
    return [...posts].sort((a, b) => scoreTrending(b) - scoreTrending(a)).slice(0, 10);
  }, [posts]);

  const stories = useMemo(() => {
    return posts.slice(0, 10).map((p) => ({
      id: p.id,
      handle: p.author.handle,
      name: p.author.name,
      initials: p.author.initials,
      headline: p.author.headline,
    }));
  }, [posts]);

  const forYou = useMemo(() => {
    const u = user;
    const f = new Set(following);
    const list = [...posts]
      .map((p) => {
        const s = scoreForYou(p, u, f);
        return { post: p, score: s.score, reasons: s.reasons };
      })
      .sort((a, b) => b.score - a.score);

    return list;
  }, [posts, user, following]);

  function toggleSpark(id: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const active = !p.spark.active;
        const likedBy = new Set(p.spark.likedBy);

        if (active) likedBy.add(youHandle);
        else likedBy.delete(youHandle);

        return {
          ...p,
          spark: { active, count: p.spark.count + (active ? 1 : -1), likedBy: Array.from(likedBy) },
        };
      })
    );
  }

  function toggleOrbit(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, orbit: { active: !p.orbit.active } } : p)));
  }

  function doRecast(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, recast: { count: p.recast.count + 1 } } : p)));
  }

  function addComment(id: string, comment: string) {
    const c = comment.trim();
    if (!c) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, rounds: { count: p.rounds.count + 1, items: [{ by: youHandle, text: c }, ...p.rounds.items] } };
      })
    );
  }

  function openAbstract(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, metrics: { reads: p.metrics.reads + 1 } } : p)));
  }

  function copyDoi(doi: string) {
    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(doi);
        setCopied(doi);
        setTimeout(() => setCopied(null), 1200);
      } catch {
        // ignore
      }
    };
    void doCopy();
  }

  function generateAi(doi: DoiPreview) {
    setAiBusy(doi.doi);
    setTimeout(() => {
      const pack = generateAiPack(doi);
      setAiByDoi((prev) => ({ ...prev, [doi.doi]: pack }));
      setAiBusy(null);
    }, 550);
  }

  function publish() {
    const body = text.trim();
    if (!body && !doiPreview) return;

    const newPost: Post = {
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      author: { handle: youHandle, name: youName, initials: youInitials, headline: youHeadline },
      createdAt: nowLabel(),
      doi: doiPreview ?? undefined,
      text: body || "Compartí un DOI (sin comentarios adicionales).",
      hasVideoNote: videoNote,
      metrics: { reads: 0 },
      spark: { count: 0, active: false, likedBy: [] },
      orbit: { active: false },
      recast: { count: 0 },
      rounds: { count: 0, items: [] },
    };

    setPosts((p) => [newPost, ...p]);
    setText("");
    setVideoNote(false);
  }

  const feed =
    mode === "trending"
      ? trending.map((p) => ({ post: p, reasons: trendingReasons(p) }))
      : forYou.map((x) => ({ post: x.post, reasons: x.reasons }));

  return (
    <div className="pt-2">
      {/* ✅ Ya NO hay sidebar interno.
          Tu layout global (AppShell/NavBar) se encarga del sidebar estilo Instagram. */}
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4 max-[1080px]:grid-cols-1">
        <div className="space-y-4">
          {/* Stories */}
          <GlassCard className="p-4 shadow-none">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {stories.map((s) => (
                <div key={s.id} className="flex w-[68px] flex-col items-center gap-2">
                  <div className="rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 p-[2px]">
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-black/70">
                      <Avatar initials={s.initials} size={56} />
                    </div>
                  </div>
                  <div className="w-full truncate text-center text-[11px] text-white/70">@{s.handle}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Composer */}
          <GlassCard className="p-4 shadow-none">
            {!composerOpen ? (
              <button
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10"
                onClick={() => setComposerOpen(true)}
              >
                <Avatar initials={youInitials} size={40} />
                <span className="flex-1 text-sm text-white/60">¿Piensas en compartir algo?</span>
                <span className="text-xs text-white/50">Abrir</span>
              </button>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-extrabold">Comparte con la red</div>
                    <div className="mt-1 text-xs text-white/60">
                      Señales: especialidad, intereses, Interesante, actividad de mates.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
                        mode === "forYou" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                      )}
                      onClick={() => setMode("forYou")}
                    >
                      <Users size={16} /> Para ti
                    </button>
                    <button
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
                        mode === "trending" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                      )}
                      onClick={() => setMode("trending")}
                    >
                      <TrendingUp size={16} /> Tendencias
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Caso</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Hallazgo</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Teaching pearl</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Revisión rápida</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <Link2 size={16} className="opacity-80" />
                    <input
                      value={doiInput}
                      onChange={(e) => setDoiInput(e.target.value)}
                      placeholder="Pega un DOI (p.ej., 10.1234/medverse.2025.001)"
                      className="w-full bg-transparent outline-none placeholder:text-white/40"
                    />
                  </div>

                  <button
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3",
                      videoNote ? "bg-blue-500/20 border-blue-400/30" : "bg-white/5 hover:bg-white/10"
                    )}
                    onClick={() => setVideoNote((v) => !v)}
                  >
                    <Video size={16} /> Nota en video
                  </button>

                  {/* ✅ sin recargar (no uses <a href>) */}
                  <Link
                    to="/reels"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                  >
                    <ExternalLink size={16} /> Reels
                  </Link>
                </div>

                {doiInput.trim() && !doiPreview && (
                  <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-white/70">
                    DOI no encontrado en la BD mock. (En producción: Crossref/PubMed/Unpaywall)
                  </div>
                )}

                {doiPreview && (
                  <GlassCard className="mt-4 p-4 shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold">{doiPreview.title}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                            {doiPreview.venue}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                            {doiPreview.year}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                            {doiPreview.doi}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => copyDoi(doiPreview.doi)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                        >
                          <Copy size={14} /> {copied === doiPreview.doi ? "Copiado" : "Copiar DOI"}
                        </button>

                        <button
                          onClick={() => generateAi(doiPreview)}
                          className={clsx(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs",
                            aiBusy === doiPreview.doi
                              ? "border-white/10 bg-white/5 opacity-60 cursor-wait"
                              : "border-violet-300/25 bg-violet-300/10 hover:brightness-105"
                          )}
                          disabled={aiBusy === doiPreview.doi}
                          title="Botón mock: en app real, esto llamará a un servicio de IA"
                        >
                          <Wand2 size={14} /> {aiByDoi[doiPreview.doi] ? "Regenerar IA" : "Generar con IA"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-[1.3fr_.9fr] gap-4 max-[900px]:grid-cols-1">
                      <div>
                        <div className="text-sm font-bold text-white/90">Abstract (vista previa)</div>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{doiPreview.abstract}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[radial-gradient(600px_260px_at_70%_0%,rgba(140,107,255,.18),transparent_60%)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-white/90">Infografía del abstract</div>
                          {aiByDoi[doiPreview.doi] && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                              IA • {aiByDoi[doiPreview.doi].generatedAt}
                            </span>
                          )}
                        </div>

                        {aiBusy === doiPreview.doi ? (
                          <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-xs text-white/70">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 animate-ping rounded-full bg-cyan-300" />
                              <span>IA generando un resumen del DOI</span>
                            </div>
                            <div className="mt-2 h-2 animate-pulse rounded bg-white/10" />
                          </div>
                        ) : aiByDoi[doiPreview.doi] ? (
                          <AiInfographic pack={aiByDoi[doiPreview.doi]} />
                        ) : (
                          <>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                              {doiPreview.keyPoints.map((k) => (
                                <li key={k}>{k}</li>
                              ))}
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {doiPreview.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )}

                <textarea
                  className="mt-4 min-h-[110px] w-full resize-y rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/40"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe qué hace interesante el DOI para clínica o docencia"
                />

                {videoNote && (
                  <div className="mt-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3">
                    <div className="inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">
                      Nota en video (mock)
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Agrega un clip (30–90s) explicando por qué importa clínicamente.
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-white/60">
                    Tip: DOI + 1 limitación + 1 conclusión práctica. Se publica directo en tu feed.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setComposerOpen(false)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={publish}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 px-4 py-2.5 hover:brightness-105"
                    >
                      <Send size={16} /> Publicar
                    </button>
                  </div>
                </div>
              </>
            )}
          </GlassCard>

          {/* Feed */}
          <div className="space-y-4">
            {feed.map(({ post, reasons }) => (
              <PostCard
                key={post.id}
                post={post}
                reasons={reasons}
                ai={post.doi ? aiByDoi[post.doi.doi] : undefined}
                aiBusy={aiBusy}
                onGenerateAi={() => post.doi && generateAi(post.doi)}
                onOpenAbstract={() => openAbstract(post.id)}
                onCopyDoi={() => post.doi && copyDoi(post.doi.doi)}
                copied={copied}
                onSpark={() => toggleSpark(post.id)}
                onOrbit={() => toggleOrbit(post.id)}
                onRecast={() => doRecast(post.id)}
                onComment={(c) => addComment(post.id, c)}
                mateHandles={following}
              />
            ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4 max-[1080px]:hidden">
          <GlassCard className="p-5 shadow-none">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-extrabold">
                <TrendingUp size={16} /> Tendencias rápidas
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                Top {Math.min(5, trending.length)}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {trending.length === 0 ? (
                <div className="text-sm text-white/60">Sin tendencia aún. Interactúa con los mocks.</div>
              ) : (
                trending.slice(0, 5).map((p) => (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs text-white/60">{p.doi?.doi ?? "Post"}</div>
                    <div className="mt-1 truncate text-sm font-bold text-white/85">{p.doi?.title ?? p.text}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/60">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Intereses: {p.spark.count}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Recast: {p.recast.count}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Reads: {p.metrics.reads}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5 shadow-none">
            <div className="inline-flex items-center gap-2 text-sm font-extrabold">
              <Orbit size={16} /> Orbit / guardados
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Revisa lo que marcaste</span>
                <Link
                  to="/studyorbit"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                >
                  Abrir
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/60">
                Interesante = interés clínico/docente, Orbit = guardado para leer.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function scoreTrending(p: Post) {
  return p.metrics.reads * 2 + p.recast.count * 6 + p.spark.count * 1.5 + p.rounds.count * 1;
}

function trendingReasons(p: Post): string[] {
  const reasons: string[] = [];
  if (p.metrics.reads >= 80) reasons.push("Muchas lecturas");
  if (p.recast.count >= 15) reasons.push("Muy recasteado");
  if (p.spark.count >= 120) reasons.push("Muchos intereses");
  if (reasons.length === 0) reasons.push("Señal de tendencia");
  return reasons.slice(0, 2);
}

function scoreForYou(p: Post, user: UserProfile | null, followingSet: Set<string>) {
  const t = normTextForMatch(p);

  const uSpec = slug(user?.specialty || "");
  const uInterests = (user?.interests || []).map(slug);

  let specHit = 0;
  if (uSpec && SPECIALTY_MAP[uSpec]) {
    const kws = SPECIALTY_MAP[uSpec];
    specHit = kws.some((k) => t.includes(k)) ? 1 : 0;
  }

  let interestHitCount = 0;
  const matchedInterestLabels: string[] = [];

  for (const it of uInterests) {
    const kws = INTEREST_MAP[it] || [];
    const ok = kws.some((k) => t.includes(k));
    if (ok) {
      interestHitCount++;
      matchedInterestLabels.push(it);
    }
  }

  const isMate = followingSet.has(p.author.handle) ? 1 : 0;
  const mateSpark = p.spark.likedBy.some((h) => followingSet.has(h)) ? 1 : 0;

  const base = p.spark.count * 0.1 + p.recast.count * 0.25 + p.metrics.reads * 0.05 + p.rounds.count * 0.2;

  const score =
    base +
    specHit * 4 +
    interestHitCount * 2.2 +
    isMate * 3.2 +
    mateSpark * 2.2 +
    (p.spark.active ? 0.8 : 0) +
    (p.orbit.active ? 0.6 : 0);

  const reasons: string[] = [];
  if (isMate) reasons.push("De tus mates");
  if (mateSpark) reasons.push("Tus mates marcaron Interesante");
  if (specHit) reasons.push("Coincide con tu especialidad");

  if (matchedInterestLabels.length) {
    const nice = matchedInterestLabels.slice(0, 2).map(titleize).join(", ");
    reasons.push(`Intereses: ${nice}`);
  }

  if (reasons.length === 0) reasons.push("Popular en tu feed");

  return { score, reasons: reasons.slice(0, 2) };
}

function titleize(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function PostCard({
  post,
  reasons,
  ai,
  aiBusy,
  onGenerateAi,
  onOpenAbstract,
  onCopyDoi,
  copied,
  onSpark,
  onOrbit,
  onRecast,
  onComment,
  mateHandles,
}: {
  post: Post;
  reasons: string[];
  ai?: AiPack;
  aiBusy: string | null;
  onGenerateAi: () => void;
  onOpenAbstract: () => void;
  onCopyDoi: () => void;
  copied: string | null;
  onSpark: () => void;
  onOrbit: () => void;
  onRecast: () => void;
  onComment: (text: string) => void;
  mateHandles: string[];
}) {
  const [open, setOpen] = useState(false);
  const [c, setC] = useState("");

  const sparkedByMate = useMemo(() => {
    const mateSet = new Set(mateHandles);
    const one = post.spark.likedBy.find((h) => mateSet.has(h));
    return one || null;
  }, [post.spark.likedBy, mateHandles]);

  return (
    <GlassCard className="p-5 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={post.author.initials} size={44} />
          <div className="min-w-0">
            <div className="truncate font-extrabold">
              {post.author.name} <span className="font-normal text-white/55"> {post.createdAt}</span>
            </div>
            <div className="mt-1 text-xs text-white/65">{post.author.headline}</div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/75"
                >
                  {r}
                </span>
              ))}

              {sparkedByMate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] text-white/80">
                  <Flame size={14} /> Interesante de @{sparkedByMate}
                </span>
              )}
            </div>
          </div>
        </div>

        {post.hasVideoNote && (
          <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs text-white/80">
            Nota en video
          </span>
        )}
      </div>

      {post.doi && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-extrabold">{post.doi.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  {post.doi.venue}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  {post.doi.year}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {post.doi.doi}
                </span>
                <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Lecturas: {post.metrics.reads}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAbstract}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                title="Mock: suma lecturas"
              >
                <ExternalLink size={14} /> Abrir abstract
              </button>

              <button
                onClick={onCopyDoi}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              >
                <Copy size={14} /> {copied === post.doi.doi ? "Copiado" : "Copiar DOI"}
              </button>

              <button
                onClick={onGenerateAi}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs",
                  aiBusy === post.doi.doi
                    ? "border-white/10 bg-white/5 opacity-60 cursor-wait"
                    : "border-violet-300/25 bg-violet-300/10 hover:brightness-105"
                )}
                disabled={aiBusy === post.doi.doi}
              >
                <Wand2 size={14} /> {ai ? "Regenerar IA" : "Generar IA"}
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-white/70">{post.doi.abstract}</p>

          {aiBusy === post.doi.doi ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-cyan-300" />
                <span>IA generando un resumen de esta publicación</span>
              </div>
              <div className="mt-2 h-2 animate-pulse rounded bg-white/10" />
            </div>
          ) : ai ? (
            <div className="mt-3">
              <AiInfographic pack={ai} compact />
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-white/75">
              {post.doi.keyPoints.slice(0, 2).map((k) => (
                <div key={k} className="flex gap-2">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(52,208,255,.35)]" />
                  <span>{k}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm leading-relaxed">{post.text}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onSpark}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
            post.spark.active ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
          )}
        >
          <Sparkles size={16} /> Interesante <span className="text-white/60">{post.spark.count}</span>
        </button>

        <button
          onClick={onOrbit}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
            post.orbit.active ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
          )}
        >
          <Bookmark size={16} /> Orbit
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5",
            open ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
          )}
        >
          <MessageSquare size={16} /> Rounds <span className="text-white/60">{post.rounds.count}</span>
        </button>

        <button
          onClick={onRecast}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
        >
          <Repeat2 size={16} /> Recast <span className="text-white/60">{post.recast.count}</span>
        </button>
      </div>

      {open && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <input
              value={c}
              onChange={(e) => setC(e.target.value)}
              placeholder="Agrega un comentario (sé específico)"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/40"
            />
            <button
              className="rounded-2xl border border-blue-400/30 bg-blue-500/15 px-4 py-3 text-sm hover:brightness-105"
              onClick={() => {
                onComment(c);
                setC("");
              }}
            >
              Publicar
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {post.rounds.items.length === 0 ? (
              <div className="text-sm text-white/60">Aún no hay comentarios.</div>
            ) : (
              post.rounds.items.map((x, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-white/55">@{x.by}</div>
                  <div className="mt-1 text-sm leading-relaxed">{x.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function AiInfographic({ pack, compact }: { pack: AiPack; compact?: boolean }) {
  const pad = compact ? "p-3" : "p-4";

  return (
    <div className="mt-3">
      <div className={clsx("grid grid-cols-2 gap-3")}>
        <MiniTile title="Contexto" text={pack.background} pad={pad} />
        <MiniTile title="Métodos" text={pack.methods} pad={pad} />
        <MiniTile title="Resultados" text={pack.results} pad={pad} />
        <MiniTile title="Conclusión práctica" text={pack.takeaway} pad={pad} />
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-bold text-white/90">Puntos clave (IA mock)</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
          {pack.keyPoints.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          {pack.miniFigure.map((x, idx) => (
            <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              {x.label}: <span className="text-white/90">{x.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniTile({ title, text, pad }: { title: string; text: string; pad: string }) {
  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-white/5", pad)}>
      <div className="text-xs font-bold text-white/85">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/70">{text}</div>
    </div>
  );
}
