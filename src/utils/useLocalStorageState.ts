import { useEffect, useState } from "react";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => safeParse(localStorage.getItem(key), initial));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
