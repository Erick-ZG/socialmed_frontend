import type { ReactNode, CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import useLocalStorageState from "../utils/useLocalStorageState";

type Session = { handle: string; loggedInAt: string };
type Theme = "light" | "dark";

const nightBg: CSSProperties = {
  backgroundImage: `
    radial-gradient(1000px 700px at 65% 60%, rgba(47,102,255,.18), transparent 55%),
    radial-gradient(900px 600px at 20% 40%, rgba(140,107,255,.14), transparent 55%),
    radial-gradient(1200px 900px at 50% 90%, rgba(11,43,99,.30), transparent 46%),
    linear-gradient(180deg, #02081b, #040a21 40%, #02081b)
  `,
};

const twilightBg: CSSProperties = {
  backgroundImage: `
    radial-gradient(1100px 780px at 62% 58%, rgba(122,215,255,.18), transparent 55%),
    radial-gradient(900px 640px at 28% 35%, rgba(97,146,255,.16), transparent 55%),
    linear-gradient(180deg, #0b1224, #0f1b34 45%, #0a1120)
  `,
};

const starfield: CSSProperties = {
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(255,255,255,.10) 0 1px, transparent 2px),
    radial-gradient(circle at 80% 30%, rgba(255,255,255,.10) 0 1px, transparent 2px),
    radial-gradient(circle at 30% 70%, rgba(255,255,255,.09) 0 1px, transparent 2px),
    radial-gradient(circle at 70% 80%, rgba(255,255,255,.08) 0 1px, transparent 2px),
    radial-gradient(circle at 45% 25%, rgba(255,255,255,.06) 0 1px, transparent 2px),
    radial-gradient(circle at 55% 60%, rgba(255,255,255,.06) 0 1px, transparent 2px)
  `,
};

function prefersDarkMode() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [session] = useLocalStorageState<Session | null>("mv_session", null);
  const [theme, setTheme] = useLocalStorageState<Theme>("mv_theme", prefersDarkMode() ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const surface = useMemo(() => (theme === "light" ? twilightBg : nightBg), [theme]);
  const overlay = theme === "light" ? undefined : starfield;

  const isAuthScreen = loc.pathname === "/" && !session;
  if (isAuthScreen) return <>{children}</>;

  return (
    <div className="min-h-screen text-white" style={surface}>
      {overlay && <div className="pointer-events-none fixed inset-0 opacity-90" style={overlay} />}
      <NavBar theme={theme} onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))} />
      <main className="relative mx-auto w-[min(1260px,94vw)] py-7 text-[15px] leading-relaxed text-white">
        {children}
      </main>
      <footer className="relative mx-auto w-[min(1260px,94vw)] pb-7 text-white/60">
        © {new Date().getFullYear()} Medverse (prototype)
      </footer>
    </div>
  );
}
