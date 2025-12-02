import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  SunMoon,
  LogOut,
  Settings,
  User as UserIcon,
  Home,
  Search,
  Compass,
  Video,
  Users,
  Orbit,
  Bell,
  PlusSquare,
  Microscope,
  FlaskConical,
  Wrench,
} from "lucide-react";

import Avatar from "./Avatar";
import useLocalStorageState from "../utils/useLocalStorageState";

type Session = { handle: string; loggedInAt: string };
type Theme = "light" | "dark";

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  school: string;
  locationLine: string;
  specialty: string;
  interests: string[];
  avatarUrl?: string;
};

type SideItem = { to: string; label: string; icon: any; exact?: boolean };

function initials(name?: string) {
  if (!name) return "MV";
  const parts = name.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function NavItem({
  to,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={!!exact}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14.5px] transition",
          isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      <Icon size={20} className="opacity-90" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function NavBar({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [drawer, setDrawer] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  const [session, setSession] = useLocalStorageState<Session | null>("mv_session", null);
  const [user, setUser] = useLocalStorageState<UserProfile | null>("mv_user", null);

  const isLogged = !!session;

  const profilePath = useMemo(() => {
    const handle = user?.handle || session?.handle || "you";
    return `/profile/${handle}`;
  }, [user?.handle, session?.handle]);

  // En la pantalla / (login) no mostramos sidebar
  if (loc.pathname === "/") return null;
  // Si no está logeado y cae a otra ruta, igual no mostramos sidebar
  if (!isLogged) return null;

  const primary: SideItem[] = [
    { to: "/medcore", label: "Inicio", icon: Home, exact: true },
    { to: "/medcore", label: "Buscar", icon: Search },
    { to: "/medtools", label: "Explorar", icon: Compass },
    { to: "/reels", label: "Reels", icon: Video },
    { to: "/medmates", label: "Mates", icon: Users },
    { to: "/studyorbit", label: "StudyOrbit", icon: Orbit },
    { to: "/alerts", label: "Alertas", icon: Bell },
    { to: "/medcore", label: "Crear", icon: PlusSquare },
  ];

  const modules: SideItem[] = [
    { to: "/medcore", label: "MedCore", icon: Microscope },
    { to: "/medcolab", label: "MedCoLab", icon: FlaskConical },
    { to: "/medmates", label: "MedMates", icon: Users },
    { to: "/medtools", label: "MedTools", icon: Wrench },
  ];

  function logout() {
    // limpia storage + estados
    localStorage.removeItem("mv_session");
    localStorage.removeItem("mv_user");
    window.dispatchEvent(new CustomEvent("mv_storage", { detail: { key: "mv_session" } }));
    window.dispatchEvent(new CustomEvent("mv_storage", { detail: { key: "mv_user" } }));

    setSession(null);
    setUser(null);

    setDrawer(false);
    nav("/", { replace: true }); // ✅ al login
  }

  const youName = user?.name ?? session?.handle ?? "User";
  const youInitials = initials(youName);

  const Side = ({ onPick }: { onPick?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <NavLink
        to="/medcore"
        onClick={onPick}
        className="flex items-center gap-3 px-4 py-5"
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <span className="text-sm font-black">MV</span>
        </div>
        <span className="text-[15px] font-extrabold tracking-[0.18em]">MEDVERSE</span>
      </NavLink>

      {/* Main */}
      {/* Main (SCROLL) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        <div className="space-y-1">
          {primary.map((it) => (
            <NavItem key={it.label} {...it} onClick={onPick} />
          ))}
        </div>

        <div className="my-4 h-px bg-white/10" />

        <div className="px-2 pb-2 text-[11px] font-semibold tracking-[0.22em] text-white/45">
          MÓDULOS
        </div>
        <div className="space-y-1 pb-3">
          {modules.map((it) => (
            <NavItem key={it.label} {...it} onClick={onPick} />
          ))}
        </div>
      </div>


      {/* Bottom */}
      <div className="mt-auto p-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
          <NavLink
            to={profilePath}
            onClick={onPick}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
                isActive ? "bg-white/10" : "hover:bg-white/5",
              ].join(" ")
            }
          >
            <Avatar initials={youInitials} src={user?.avatarUrl} alt={youName} size={34} />
            <div className="min-w-0">
              <div className="truncate text-[14.5px] font-semibold text-white/90">{youName}</div>
              <div className="truncate text-[12px] text-white/55">@{user?.handle ?? session?.handle}</div>
            </div>
          </NavLink>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onToggleTheme();
                onPick?.();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
              title={theme === "light" ? "Usar tema oscuro" : "Usar tema claro"}
            >
              <SunMoon size={16} /> Tema
            </button>

            <NavLink
              to="/onboarding"
              onClick={onPick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
            >
              <Settings size={16} /> Ajustes
            </NavLink>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-white/10 bg-black/20 backdrop-blur-xl md:block">
        <Side />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2 text-sm font-extrabold tracking-[0.18em]">
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xs font-black">
            MV
          </span>
          MEDVERSE
        </div>

        <button
          type="button"
          onClick={() => setDrawer((v) => !v)}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
          aria-label="Menu"
        >
          {drawer ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] border-r border-white/10 bg-black/30 backdrop-blur-xl">
            <Side onPick={() => setDrawer(false)} />
          </div>
        </div>
      )}

      {/* Spacer top on mobile so content doesn't go under the top bar */}
      <div className="h-[60px] md:hidden" />
    </>
  );
}
