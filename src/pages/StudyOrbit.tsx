import { useEffect, useMemo, useState } from "react";
import { Clock, Flame, Sparkles, Users, Play, Pause, DoorOpen, ShoppingBag } from "lucide-react";
import GlassCard from "../components/GlassCard";
import clsx from "../utils/clsx";
import useLocalStorageState from "../utils/useLocalStorageState";

type OrbitState = {
  activeRoomId: string | null;
  isRunning: boolean;
  startedAt: number | null;
  elapsedMs: number;
  points: number;
  streakDays: number;
  lastStudyDay: string | null; // yyyy-mm-dd
};

const ROOMS = [
  { id: "r1", name: "Cardio Sprint", size: 7, focus: "Pomodoro 25/5 vibe" },
  { id: "r2", name: "Evidence Lab", size: 12, focus: "Leer + resumir papers" },
  { id: "r3", name: "Intern Night Shift", size: 5, focus: "Silencio, trabajo profundo" },
];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function StudyOrbit() {
  const [state, setState] = useLocalStorageState<OrbitState>("mv_orbit", {
    activeRoomId: null,
    isRunning: false,
    startedAt: null,
    elapsedMs: 0,
    points: 0,
    streakDays: 0,
    lastStudyDay: null,
  });

  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = useMemo(() => {
    if (!state.isRunning || !state.startedAt) return state.elapsedMs;
    return state.elapsedMs + (tick - state.startedAt);
  }, [state.elapsedMs, state.isRunning, state.startedAt, tick]);

  useEffect(() => {
    if (!state.isRunning) return;
    const pointsFromTime = Math.floor(elapsed / (5 * 60 * 1000));
    setState((prev) => {
      const base = prev.points;
      const should = Math.max(base, pointsFromTime);

      const t = todayKey();
      let streak = prev.streakDays;
      let last = prev.lastStudyDay;

      if (t !== last) {
        if (last) {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          const yesterday = todayKeyFromDate(y);
          streak = last === yesterday ? prev.streakDays + 1 : 1;
        } else {
          streak = 1;
        }
        last = t;
      }

      if (should === prev.points && streak === prev.streakDays && last === prev.lastStudyDay) return prev;
      return { ...prev, points: should, streakDays: streak, lastStudyDay: last };
    });
  }, [elapsed, state.isRunning, setState]);

  const activeRoom = useMemo(() => ROOMS.find((r) => r.id === state.activeRoomId) ?? null, [state.activeRoomId]);

  const astroLevel = useMemo(() => {
    const p = state.points;
    if (p >= 40) return { name: "Supernova", pct: 100 };
    if (p >= 25) return { name: "Red Giant", pct: Math.min(99, Math.round((p / 40) * 100)) };
    if (p >= 12) return { name: "Main Sequence", pct: Math.round((p / 25) * 100) };
    if (p >= 4) return { name: "Protostar", pct: Math.round((p / 12) * 100) };
    return { name: "Stardust", pct: Math.round((p / 4) * 100) };
  }, [state.points]);

  function joinRoom(id: string) {
    setState((prev) => ({ ...prev, activeRoomId: id, isRunning: false, startedAt: null, elapsedMs: 0 }));
  }

  function start() {
    if (!state.activeRoomId) return;
    setState((prev) => ({ ...prev, isRunning: true, startedAt: Date.now() }));
  }

  function pause() {
    setState((prev) => {
      if (!prev.isRunning || !prev.startedAt) return prev;
      const now = Date.now();
      const extra = now - prev.startedAt;
      return { ...prev, isRunning: false, startedAt: null, elapsedMs: prev.elapsedMs + extra };
    });
  }

  function leave() {
    setState((prev) => ({ ...prev, activeRoomId: null, isRunning: false, startedAt: null, elapsedMs: 0 }));
  }

  function buyMock(cost: number) {
    setState((prev) => (prev.points >= cost ? { ...prev, points: prev.points - cost } : prev));
  }

  return (
    <div className="pt-2">
      <div className="mb-4">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em]">StudyOrbit</h2>
        <p className="mt-1 text-white/70">Salas de estudio + timer → racha + puntos → “evolución astro”. (Frontend mock)</p>
      </div>

      <div className="grid grid-cols-[.95fr_1.05fr] gap-4 max-[980px]:grid-cols-1">
        <GlassCard className="p-5 shadow-none">
          <div className="flex items-center justify-between">
            <div className="text-lg font-extrabold">Salas</div>
            <div className="text-xs text-white/60 inline-flex items-center gap-2">
              <Users size={16} /> {ROOMS.reduce((a, r) => a + r.size, 0)} online
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {ROOMS.map((r) => (
              <button
                key={r.id}
                onClick={() => joinRoom(r.id)}
                className={clsx(
                  "w-full rounded-2xl border border-white/10 p-4 text-left hover:bg-white/10",
                  state.activeRoomId === r.id ? "bg-white/10" : "bg-white/5"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-extrabold">{r.name}</div>
                  <div className="text-xs text-white/60">{r.size} dentro</div>
                </div>
                <div className="mt-1 text-sm text-white/65">{r.focus}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="font-extrabold">Tus stats</div>
              <div className="text-xs text-white/60 inline-flex items-center gap-2">
                <Flame size={16} /> {state.streakDays} días de racha
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat icon={<Clock size={16} />} label="Tiempo hoy" value={fmt(elapsed)} />
              <MiniStat icon={<Sparkles size={16} />} label="Puntos" value={String(state.points)} />
            </div>

            <div className="mt-4">
              <div className="text-sm font-bold">Evolución astro</div>
              <div className="mt-2 text-sm text-white/70">{astroLevel.name}</div>
              <div className="mt-3 h-2 rounded-full border border-white/10 bg-white/5 overflow-hidden">
                <div className="h-full bg-white/20" style={{ width: `${astroLevel.pct}%` }} />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold">Sesión</div>
            {activeRoom ? (
              <div className="text-sm text-white/70 inline-flex items-center gap-2">
                <DoorOpen size={16} /> {activeRoom.name}
              </div>
            ) : (
              <div className="text-sm text-white/60">Únete a una sala para empezar</div>
            )}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-[radial-gradient(700px_260px_at_65%_0%,rgba(140,107,255,.18),transparent_60%)] p-6">
            <div className="text-5xl font-extrabold tracking-tight">{fmt(elapsed)}</div>
            <div className="mt-2 text-sm text-white/70">
              {state.isRunning ? "Modo focus: activado" : activeRoom ? "Listo cuando tú quieras" : "Elige una sala para comenzar"}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={state.isRunning ? pause : start}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
                  activeRoom
                    ? "border-blue-400/45 bg-gradient-to-b from-blue-500/95 to-blue-500/55 hover:brightness-105"
                    : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                )}
                disabled={!activeRoom}
              >
                {state.isRunning ? <Pause size={16} /> : <Play size={16} />}
                {state.isRunning ? "Pausar" : "Iniciar"}
              </button>

              <button
                onClick={leave}
                className={clsx(
                  "rounded-full border border-white/10 px-4 py-2.5",
                  activeRoom ? "bg-white/5 hover:bg-white/10" : "opacity-40 cursor-not-allowed"
                )}
                disabled={!activeRoom}
              >
                Salir de la sala
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold inline-flex items-center gap-2">
                <ShoppingBag size={18} /> Orbit Shop (mock)
              </div>
              <div className="text-sm text-white/60">Usa puntos para “desbloquear” perks</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <ShopItem title="Paper Boost" desc="Fija un paper en tu Feed por 24h" cost={6} onBuy={() => buyMock(6)} />
              <ShopItem title="Streak Shield" desc="Protege tu racha una vez" cost={10} onBuy={() => buyMock(10)} />
              <ShopItem title="Gold Badge" desc="Insignia de perfil (demo)" cost={18} onBuy={() => buyMock(18)} />
              <ShopItem title="Research Slot" desc="Slot extra en MedCoLab" cost={12} onBuy={() => buyMock(12)} />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function todayKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60 inline-flex items-center gap-2">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function ShopItem({ title, desc, cost, onBuy }: { title: string; desc: string; cost: number; onBuy: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-white/65">{desc}</div>
      <button
        onClick={onBuy}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        Comprar · {cost} pts
      </button>
    </div>
  );
}
