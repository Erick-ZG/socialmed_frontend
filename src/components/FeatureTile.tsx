import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "../utils/clsx";

type Props = {
  title: string;
  subtitle: string;
  to?: string;
  icon?: ReactNode;
  tint?: "blue" | "cyan" | "teal" | "violet";
  disabled?: boolean;
};

const tintBg: Record<NonNullable<Props["tint"]>, string> = {
  blue: "from-blue-500/25",
  cyan: "from-cyan-400/20",
  teal: "from-teal-400/20",
  violet: "from-violet-400/25",
};

export default function FeatureTile({
  title,
  subtitle,
  to,
  icon,
  tint = "blue",
  disabled,
}: Props) {
  const card = (
    <div
      className={clsx(
        "relative h-[220px] rounded-[26px] border border-white/10 bg-gradient-to-b to-white/[0.02] p-5 shadow-glow backdrop-blur-xl",
        tintBg[tint],
        disabled && "opacity-55 saturate-75"
      )}
    >
      <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(300px_200px_at_20%_20%,rgba(255,255,255,.10),transparent_60%)] opacity-80" />
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
          {icon}
        </div>
        <div className="mt-6 text-[26px] font-bold tracking-tight">{title}</div>
        <div className="mt-2 text-[14.5px] leading-relaxed text-white/70">{subtitle}</div>
      </div>
    </div>
  );

  if (!to || disabled) return card;
  return <Link to={to}>{card}</Link>;
}
