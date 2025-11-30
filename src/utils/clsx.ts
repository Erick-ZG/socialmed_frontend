type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean>
  | ClassValue[];

export default function clsx(...values: ClassValue[]): string {
  const out: string[] = [];

  const push = (v: ClassValue) => {
    if (!v) return;

    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
      return;
    }

    if (Array.isArray(v)) {
      for (const item of v) push(item);
      return;
    }

    if (typeof v === "object") {
      for (const [k, ok] of Object.entries(v)) if (ok) out.push(k);
    }
  };

  for (const v of values) push(v);

  return out.join(" ");
}
