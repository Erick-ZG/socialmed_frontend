import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Microscope,
  Wrench,
  FlaskConical,
  Users,
  ArrowRight,
  Orbit,
  Video,
  Sparkles,
  TrendingUp,
  Bookmark,
  FileText,
} from "lucide-react";

import FeatureTile from "../components/FeatureTile";
import GlassCard from "../components/GlassCard";
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

type PostLite = {
  id: string;
  author?: { handle?: string; name?: string; headline?: string };
  createdAt?: string;
  text?: string;
  metrics?: { reads: number };
  spark?: { count: number };
  recast?: { count: number };
  rounds?: { count: number };
  orbit?: { active: boolean };
  doi?: { doi?: string; title?: string };
  hasVideoNote?: boolean;
};

function scoreTrending(p: PostLite) {
  const reads = p.metrics?.reads ?? 0;
  const spark = p.spark?.count ?? 0;
  const recast = p.recast?.count ?? 0;
  const rounds = p.rounds?.count ?? 0;
  return reads * 2 + spark * 1.5 + recast * 6 + rounds * 1;
}

export default function Home() {
  const [session, setSession] = useLocalStorageState<Session | null>("mv_session", null);
  const [user, setUser] = useLocalStorageState<UserProfile | null>("mv_user", null);
  const [posts] = useLocalStorageState<PostLite[]>("mv_posts", []);

  const isLogged = !!session;

  function loginDemo() {
    const demo: UserProfile = user ?? {
      handle: "daniel.mego",
      name: "Daniel Mego",
      roleLine: "Estudiante de Medicina • Investigador joven",
      school: "Universidad (mock)",
      locationLine: "LatAm",
      specialty: "Medicina Interna",
      interests: ["Evidencia clínica", "Educación médica", "Investigación joven"],
    };
    if (!user) setUser(demo);
    setSession({ handle: demo.handle, loggedInAt: new Date().toISOString() });
  }

  const yourPosts = useMemo(() => {
    const handle = user?.handle || session?.handle;
    if (!handle) return 0;
    return posts.filter((p) => p.author?.handle === handle).length;
  }, [posts, user?.handle, session?.handle]);

  const orbitCount = useMemo(() => {
    return posts.filter((p) => p.orbit?.active).length;
  }, [posts]);

  const trending = useMemo(() => {
    return [...posts].sort((a, b) => scoreTrending(b) - scoreTrending(a)).slice(0, 5);
  }, [posts]);

  const feedPreview = useMemo(() => {
    return posts.slice(0, 4);
  }, [posts]);

  return (
    <div className="pt-2">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-6 pb-6 pt-16 shadow-glow">
        <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(560px_240px_at_62%_62%,rgba(52,208,255,.10),transparent_65%),radial-gradient(640px_300px_at_74%_72%,rgba(140,107,255,.11),transparent_66%)] opacity-90" />

        {/* HERO */}
        {!isLogged ? (
          <div className="relative mx-auto w-[min(920px,92vw)] text-center">
            <h1 className="text-[clamp(40px,5vw,62px)] font-bold leading-[1.02] tracking-[-0.04em]">
              Explora el universo médico
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-[16.5px] leading-[1.7] text-white/70">
              Descubre evidencia por DOI, comparte hallazgos clínicos y conecta con investigadores jóvenes.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                to="/medcore"
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-gradient-to-b from-blue-500/95 to-blue-500/60 px-4 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,.35)] hover:brightness-105"
              >
                Abrir MedCore <ArrowRight size={16} />
              </Link>

              <button
                onClick={loginDemo}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
              >
                Iniciar sesión (demo)
              </button>

              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
              >
                Editar onboarding
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto w-[min(1040px,92vw)]">
            <div className="text-center">
              <h1 className="text-[clamp(34px,4.2vw,54px)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                Bienvenido/a de vuelta, {user?.name ?? session?.handle}
              </h1>
              <p className="mx-auto mt-3 max-w-[780px] text-[15.5px] leading-[1.75] text-white/70">
                Tu Feed personalizado usa: especialidad, intereses, tus Intereses marcados y actividad de mates (mock).
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  to="/medcore"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-gradient-to-b from-blue-500/95 to-blue-500/60 px-4 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,.35)] hover:brightness-105"
                >
                  Nuevo post / Feed <ArrowRight size={16} />
                </Link>
                <Link
                  to={`/profile/${user?.handle ?? session?.handle}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                >
                  Ver perfil
                </Link>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                >
                  Editar onboarding
                </Link>
              </div>

              {(user?.specialty || user?.interests?.length) && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {user?.specialty && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      Especialidad: <span className="text-white/90">{user.specialty}</span>
                    </span>
                  )}
                  {(user?.interests ?? []).slice(0, 5).map((x) => (
                    <span
                      key={x}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-7 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
              <GlassCard className="p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white/80 inline-flex items-center gap-2">
                    <FileText size={16} /> Tus publicaciones
                  </div>
                  <span className="text-2xl font-extrabold">{yourPosts}</span>
                </div>
                <div className="mt-2 text-xs text-white/60">Publicaciones que creaste (desde localStorage).</div>
              </GlassCard>

              <GlassCard className="p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white/80 inline-flex items-center gap-2">
                    <Bookmark size={16} /> Guardados (Orbit)
                  </div>
                  <span className="text-2xl font-extrabold">{orbitCount}</span>
                </div>
                <div className="mt-2 text-xs text-white/60">Papers / posts guardados usando Orbit.</div>
              </GlassCard>

              <GlassCard className="p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white/80 inline-flex items-center gap-2">
                    <TrendingUp size={16} /> Trending ahora
                  </div>
                  <span className="text-2xl font-extrabold">{Math.min(10, posts.length)}</span>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Basado en reads + Intereses + Recast (mock).
                </div>
              </GlassCard>
            </div>

            {/* Feed preview */}
            <GlassCard className="mt-4 p-5 shadow-none">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-lg font-extrabold">
                  <Sparkles size={18} /> Feed inicial
                </div>
                <Link
                  to="/medcore"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Abrir MedCore
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {feedPreview.length === 0 ? (
                  <div className="text-sm text-white/60">Aún no hay publicaciones. Crea tu primer post en MedCore.</div>
                ) : (
                  feedPreview.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-bold">
                            {p.author?.name ?? "Autor"}{" "}
                            <span className="font-normal text-white/55">@{p.author?.handle ?? "handle"}</span>
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            {p.author?.headline ?? "Publicacion reciente"} {p.createdAt ? `- ${p.createdAt}` : ""}
                          </div>
                          {p.text && <div className="mt-2 text-sm text-white/75">{p.text}</div>}

                          {p.doi && (
                            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-xs text-white/60">{p.doi.doi}</div>
                              <div className="mt-1 text-sm font-bold text-white/90">
                                {p.doi.title ?? "Post de discusion"}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 text-xs text-white/60">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Intereses: {p.spark?.count ?? 0}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Comentarios: {p.rounds?.count ?? 0}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Recast: {p.recast?.count ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {p.hasVideoNote && (
                          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-[11px] text-white/80">
                            Nota en video
                          </span>
                        )}
                        {p.orbit?.active && (
                          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] text-white/80">
                            En Orbit
                          </span>
                        )}

                        <Link
                          to="/medcore"
                          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                        >
                          Abrir en MedCore <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Trending list */}
            <div className="mt-4 grid grid-cols-[1.25fr_.75fr] gap-4 max-[980px]:grid-cols-1">
              <GlassCard className="p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-extrabold inline-flex items-center gap-2">
                    <Sparkles size={18} /> Trending rápido
                  </div>
                  <Link
                    to="/medcore"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Abrir Feed
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {trending.length === 0 ? (
                    <div className="text-sm text-white/60">
                      Aún no hay posts. Ve a MedCore y publica un post con DOI.
                    </div>
                  ) : (
                    trending.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/55">
                          {p.author?.name ?? "Alguien"} · DOI:{" "}
                          <span className="text-white/80">{p.doi?.doi ?? "—"}</span>
                        </div>
                        <div className="mt-1 font-bold">{p.doi?.title ?? "Post de discusión"}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/65">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Reads: {p.metrics?.reads ?? 0}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Intereses: {p.spark?.count ?? 0}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Recast: {p.recast?.count ?? 0}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <div className="flex flex-col gap-4">
                <GlassCard className="p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-extrabold inline-flex items-center gap-2">
                      <Orbit size={18} /> StudyOrbit
                    </div>
                    <Link
                      to="/studyorbit"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Abrir
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    Registra tu tiempo de estudio con salas, rachas, puntos y la evolución de tu “astro”.
                  </p>
                </GlassCard>

                <GlassCard className="p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-extrabold inline-flex items-center gap-2">
                      <Video size={18} /> Reels
                    </div>
                    <Link
                      to="/reels"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Ver
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    Video notes estilo TikTok vinculados a un DOI — hallazgos clínicos rápidos.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* Features (common) */}
        <div className="relative mx-auto mt-9 w-[min(1040px,92vw)] grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          <FeatureTile to="/medcore" title="MedCore" subtitle="Feed de papers + discusión" icon={<Microscope size={30} />} tint="blue" />
          <FeatureTile to="/medtools" title="MedTools" subtitle="Apps/webs por categoría + Free/Paid" icon={<Wrench size={30} />} tint="cyan" />
          <FeatureTile to="/medcolab" title="MedCoLab" subtitle="Proyectos de investigación + colaboración" icon={<FlaskConical size={30} />} tint="teal" />
          <FeatureTile to="/medmates" title="MedMates" subtitle="Conecta con pares y mentores" icon={<Users size={30} />} tint="violet" />
        </div>
      </section>
    </div>
  );
}
