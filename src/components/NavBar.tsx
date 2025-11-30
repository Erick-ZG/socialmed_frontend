import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
} from "lucide-react";

import Avatar from "./Avatar";
import useLocalStorageState from "../utils/useLocalStorageState";

type NavItem = { to?: string; label: string; disabled?: boolean };

type Session = { handle: string; loggedInAt: string };

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  school: string;
  locationLine: string;
  specialty: string;
  interests: string[];
  avatarUrl?: string; // si lo pones, ideal que sea de /public (ej: "/esp.jpeg")
};

const items: NavItem[] = [
  { to: "/medcore", label: "MEDCORE" },
  { to: "/medcolab", label: "MEDCOLAB" }, // aunque sea mock
  { to: "/medmates", label: "MEDMATES" }, // aunque sea mock
  { to: "/medtools", label: "MEDTOOLS" },
];

function nowISO() {
  return new Date().toISOString();
}

function initials(name?: string) {
  if (!name) return "MV";
  const parts = name.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  const [session, setSession] = useLocalStorageState<Session | null>("mv_session", null);
  const [user, setUser] = useLocalStorageState<UserProfile | null>("mv_user", null);

  const isLogged = !!session;
  const isProfile = useMemo(() => loc.pathname.startsWith("/profile"), [loc.pathname]);

  const profilePath = useMemo(() => {
    const handle = user?.handle || session?.handle || "you";
    return `/profile/${handle}`;
  }, [user?.handle, session?.handle]);

  function loginDemo() {
    // Si no hay user, creamos uno demo para que “parezca real”
    const demo: UserProfile = user ?? {
      handle: "daniel.mego",
      name: "Daniel Mego",
      roleLine: "Med Student • Young Researcher",
      school: "Universidad (mock)",
      locationLine: "LatAm",
      specialty: "Medicina Interna",
      interests: ["Evidencia clínica", "Educación médica", "Investigación joven"],
      // avatarUrl: "/esp.jpeg", // <- solo si lo pones en /public
    };

    if (!user) setUser(demo);
    setSession({ handle: demo.handle, loggedInAt: nowISO() });
    setUserMenu(false);
    setOpen(false);
    nav("/");
  }

  function logout() {
    setSession(null);
    setUserMenu(false);
    setOpen(false);
    nav("/");
  }

  return (
    <header className="relative mx-auto w-[min(1140px,92vw)] pt-5">
      <nav className="flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <span className="text-sm font-black">✦</span>
          </div>
          <span className="text-lg font-extrabold tracking-[0.12em]">MEDVERSE</span>
        </NavLink>

        {/* Desktop links centered */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-[0.18em] text-white/80">
          {items.map((it) =>
            it.disabled || !it.to ? (
              <span key={it.label} className="cursor-not-allowed opacity-50">
                {it.label}
              </span>
            ) : (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  [
                    "transition-colors hover:text-white",
                    isActive ? "text-white" : "text-white/75",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>
            )
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!isLogged ? (
            <button
              onClick={loginDemo}
              className={[
                "hidden sm:inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors",
                isProfile ? "border-white/15 bg-white/5 hover:bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              Log in
            </button>
          ) : (
            <div className="relative hidden sm:block">
              {/* click-outside layer */}
              {userMenu && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenu(false)}
                  aria-hidden="true"
                />
              )}

              <button
                onClick={() => setUserMenu((v) => !v)}
                className="relative z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={userMenu}
              >
                <Avatar initials={initials(user?.name)} src={user?.avatarUrl} alt={user?.name || "User"} size={30} />
                <span className="max-w-[140px] truncate text-sm text-white/85">{user?.name ?? session.handle}</span>
                <ChevronDown size={16} className="opacity-80" />
              </button>

              {userMenu && (
                <div className="absolute right-0 z-30 mt-2 w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.45)]">
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-sm font-extrabold">{user?.name ?? "Account"}</div>
                    <div className="mt-1 text-xs text-white/60">{user?.roleLine ?? "Prototype session"}</div>
                  </div>

                  <div className="p-2">
                    <NavLink
                      to={profilePath}
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      <UserIcon size={16} /> My profile
                    </NavLink>

                    <NavLink
                      to="/onboarding"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      <Settings size={16} /> Edit onboarding
                    </NavLink>

                    <button
                      onClick={logout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex md:hidden items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-3">
          <div className="flex flex-col gap-2">
            {items.map((it) =>
              it.disabled || !it.to ? (
                <div key={it.label} className="rounded-xl px-3 py-2 text-white/45">
                  {it.label}
                </div>
              ) : (
                <NavLink
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2",
                      isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  {it.label}
                </NavLink>
              )
            )}

            <div className="mt-2 border-t border-white/10 pt-2">
              {!isLogged ? (
                <button
                  onClick={loginDemo}
                  className="w-full rounded-xl px-3 py-2 text-left text-white/85 hover:bg-white/10"
                >
                  Log in
                </button>
              ) : (
                <>
                  <NavLink
                    to={profilePath}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-white/85 hover:bg-white/10"
                  >
                    My profile
                  </NavLink>
                  <NavLink
                    to="/onboarding"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-white/85 hover:bg-white/10"
                  >
                    Edit onboarding
                  </NavLink>
                  <button
                    onClick={logout}
                    className="w-full rounded-xl px-3 py-2 text-left text-white/85 hover:bg-white/10"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
