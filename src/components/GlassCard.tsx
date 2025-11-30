import type { ReactNode } from "react";
import clsx from "../utils/clsx";

export default function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/[0.06] shadow-glow backdrop-blur-xl",
        className
      )}
    >
      {children}
    </section>
  );
}
