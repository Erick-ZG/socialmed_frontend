import { useMemo, useState } from "react";
import clsx from "../utils/clsx";

export default function Avatar({
  initials,
  size = 96,
  src,
  alt = "",
  className,
}: {
  initials: string;
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = useMemo(() => Boolean(src) && !failed, [src, failed]);

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_18px_60px_rgba(0,0,0,.55)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="text-lg font-extrabold tracking-wide">{initials}</span>
      )}
    </div>
  );
}
