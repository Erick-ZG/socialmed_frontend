import type { ReactNode, CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import useLocalStorageState from "../utils/useLocalStorageState";

type Session = { handle: string; loggedInAt: string };

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
  const [session] = useLocalStorageState<Session | null>("mv_session", null);

  const isAuthScreen = loc.pathname === "/" && !session;

  // ✅ Home tipo Instagram: pantalla completa, blanca, sin navbar/footers del shell
  if (isAuthScreen) return <>{children}</>;

  return (
    <div className="min-h-screen text-white" style={spaceBg}>
      <div className="pointer-events-none fixed inset-0 opacity-90" style={starfield} />
      <NavBar />
      <main className="relative mx-auto w-[min(1140px,92vw)] py-7">{children}</main>
      <footer className="relative mx-auto w-[min(1140px,92vw)] pb-7 text-white/60">
        © {new Date().getFullYear()} Medverse (prototype)
      </footer>
    </div>
  );
}
