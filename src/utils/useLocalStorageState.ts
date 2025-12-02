import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_EVENT = "mv:local-storage";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export default function useLocalStorageState<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  const [value, setValue] = useState<T>(() => readJSON<T>(key, initialValue));

  useEffect(() => {
    const sync = (evt: Event) => {
      // 1) StorageEvent (solo otras tabs)
      if (evt instanceof StorageEvent) {
        if (evt.key !== key) return;
        setValue(readJSON<T>(key, initialRef.current));
        return;
      }

      // 2) CustomEvent (misma tab)
      const ce = evt as CustomEvent<{ key?: string }>;
      if (ce.detail?.key !== key) return;
      setValue(readJSON<T>(key, initialRef.current));
    };

    window.addEventListener("storage", sync);
    window.addEventListener(LOCAL_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LOCAL_EVENT, sync as EventListener);
    };
  }, [key]);

  const setAndStore = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;

        try {
          if (resolved === (null as unknown as T)) localStorage.removeItem(key);
          else localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore
        }

        // 🔥 avisar al resto de componentes en ESTA pestaña
        window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { key } }));

        return resolved;
      });
    },
    [key]
  );

  return [value, setAndStore] as const;
}
