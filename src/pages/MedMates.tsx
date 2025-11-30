import { useMemo } from "react";
import { UserPlus, UserCheck, Sparkles, Filter } from "lucide-react";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import clsx from "../utils/clsx";
import useLocalStorageState from "../utils/useLocalStorageState";

type Person = {
  handle: string;
  name: string;
  headline: string;
  location: string;
  specialty: string;
  interests: string[];
  sparksLast7d: number;
};

const PEOPLE: Person[] = [
  { handle: "sara.m", name: "Dr. Sara Morrison", headline: "Anesthesiology • Periop care", location: "Baltimore, US", specialty: "Anestesiología", interests: ["Dolor", "Evidencia clínica", "Guías"], sparksLast7d: 1280 },
  { handle: "vale.intern", name: "Vale Intern", headline: "Estudiante de medicina • Journal Club", location: "Lima, Perú", specialty: "Medicina Interna", interests: ["Meta-análisis", "Diagnóstico", "Educación médica"], sparksLast7d: 540 },
  { handle: "carlos.r", name: "Carlos Rivera", headline: "Residente • Cardiología", location: "Quito, Ecuador", specialty: "Cardiología", interests: ["Ensayos clínicos", "Guías", "Farmacología"], sparksLast7d: 760 },
];

type UserProfile = {
  handle: string;
  specialty: string;
  interests: string[];
};

export default function MedMates() {
  const [following, setFollowing] = useLocalStorageState<string[]>("mv_following", []);
  const [user] = useLocalStorageState<UserProfile | null>("mv_user", null);

  const suggestions = useMemo(() => {
    const uSpec = user?.specialty || "";
    const uInterests = new Set(user?.interests || []);
    return [...PEOPLE].sort((a, b) => {
      const aScore = (a.specialty === uSpec ? 2 : 0) + a.interests.filter((x) => uInterests.has(x)).length;
      const bScore = (b.specialty === uSpec ? 2 : 0) + b.interests.filter((x) => uInterests.has(x)).length;
      return bScore - aScore;
    });
  }, [user]);

  function toggleFollow(handle: string) {
    setFollowing((prev) => (prev.includes(handle) ? prev.filter((x) => x !== handle) : [...prev, handle]));
  }

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em]">MedMates</h2>
        <p className="mt-1 text-white/70">Conecta con estudiantes e investigadores jóvenes (frontend mock).</p>
      </div>

      <div className="grid grid-cols-[1.05fr_.95fr] gap-4 max-[980px]:grid-cols-1">
        <GlassCard className="p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold">Sugeridos para ti</div>
            <div className="inline-flex items-center gap-2 text-xs text-white/60">
              <Filter size={16} /> especialidad + intereses
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {suggestions.map((p) => {
              const isFollowing = following.includes(p.handle);
              return (
                <div key={p.handle} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase()} size={46} />
                      <div>
                        <div className="font-extrabold">{p.name}</div>
                        <div className="mt-1 text-xs text-white/65">{p.headline}</div>
                        <div className="mt-1 text-xs text-white/55">
                          {p.location} · {p.specialty}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(p.handle)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                        isFollowing
                          ? "border-white/10 bg-white/10 hover:bg-white/15"
                          : "border-blue-400/35 bg-blue-500/15 hover:brightness-105"
                      )}
                    >
                      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.interests.map((t) => (
                      <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {t}
                      </span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      <Sparkles size={14} /> {p.sparksLast7d} sparks (7d)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5 shadow-none">
          <div className="text-lg font-extrabold">Tu círculo</div>
          <p className="mt-2 text-sm text-white/70">
            La gente que sigues influye en el ranking del Feed “Para ti” (lógica mock).
          </p>

          <div className="mt-4 space-y-3">
            {following.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/70">
                Sigue al menos un mate para ver “influencia de amigos” en MedCore.
              </div>
            ) : (
              following.map((h) => (
                <div key={h} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">@{h}</div>
                    <button
                      onClick={() => toggleFollow(h)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Dejar de seguir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
