import type { ReactNode, CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import useLocalStorageState from "../utils/useLocalStorageState";
import NavBar from "./NavBar";

type Theme = "light" | "dark";

const spaceBg: CSSProperties = {
  backgroundImage: `
    radial-gradient(1000px 700px at 65% 60%, rgba(47,102,255,.18), transparent 55%),
    radial-gradient(900px 600px at 20% 40%, rgba(140,107,255,.14), transparent 55%),
    radial-gradient(1200px 900px at 50% 90%, rgba(11,43,99,.30), transparent 46%),
    linear-gradient(180deg, #02081b, #040a21 40%, #02081b)
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

export default function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const isHome = loc.pathname === "/";

  const [theme, setTheme] = useLocalStorageState<Theme>("mv_theme", "dark");
  const onToggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ✅ Login/Home: blanco full, sin wrapper oscuro ni sidebar
  if (isHome) return <>{children}</>;

  return (
    <div className="min-h-screen text-white" style={spaceBg}>
      <div className="pointer-events-none fixed inset-0 opacity-90" style={starfield} />

      {/* Sidebar fijo (sin navbar arriba) */}
      <NavBar theme={theme} onToggleTheme={onToggleTheme} />

      {/* Content: full width, con padding-left para sidebar en desktop */}
      <main className="relative px-5 py-6 md:pl-[290px]">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
