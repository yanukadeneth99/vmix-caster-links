"use client";

import { useCallback, useEffect, useState } from "react";
import type { Caster } from "@/types/caster";

/**
 * Holds the caster list and mirrors it into localStorage.
 *
 * localStorage is the browser's built-in key/value store. It survives refreshes and restarts, but
 * it is tied to one browser on one machine: the list does not follow you to another computer, and
 * clearing browser data erases it.
 *
 * IMPORTANT: this hook reads localStorage while rendering, which only works because its component
 * is loaded browser-only (see CasterList's dynamic import in app/page.tsx). Using it in a
 * server-rendered component would crash, because localStorage does not exist on the server.
 */

// The ":v1" suffix versions the saved data. If the Caster shape ever changes, bumping this to v2
// means old saved records are simply ignored instead of crashing the new code.
const STORAGE_KEY = "vmix-casters:v1";

/** Reads the saved list, returning an empty list rather than throwing if anything is wrong. */
function readStoredCasters(): Caster[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Drop anything that no longer matches the expected shape, so one corrupt record cannot take
    // down the whole page.
    return parsed.filter(
      (item): item is Caster =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Caster).id === "string" &&
        typeof (item as Caster).code === "string" &&
        typeof (item as Caster).name === "string",
    );
  } catch {
    // Throws when storage is disabled, full, or holds invalid JSON. An empty list is always safe.
    return [];
  }
}

export function useCasters() {
  // Passing the function itself (not readStoredCasters()) makes React call it once, on the very
  // first render, instead of on every render. So the saved list is there from the first paint and
  // nothing flashes in afterwards.
  const [casters, setCasters] = useState<Caster[]>(readStoredCasters);

  // Save on every change. This is what effects are for: pushing React state out to something
  // outside React. It does not set state, so it cannot cause a re-render loop.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(casters));
    } catch {
      // Private browsing and full storage both throw here. Losing persistence is bad, but crashing
      // the page while the user is mid-edit is worse.
    }
  }, [casters]);

  const addCaster = useCallback(() => {
    // Appended to the end so the list reads top to bottom in the order you filled it in.
    setCasters((prev) => [
      ...prev,
      { id: crypto.randomUUID(), code: "", name: "" },
    ]);
  }, []);

  const updateCaster = useCallback(
    (id: string, patch: Partial<Omit<Caster, "id">>) => {
      setCasters((prev) =>
        prev.map((caster) =>
          caster.id === id ? { ...caster, ...patch } : caster,
        ),
      );
    },
    [],
  );

  const removeCaster = useCallback((id: string) => {
    setCasters((prev) => prev.filter((caster) => caster.id !== id));
  }, []);

  return { casters, addCaster, updateCaster, removeCaster };
}
