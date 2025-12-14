"use client";

import { useSyncExternalStore } from "react";

import {
  type SlurpPlayerState,
  SLURP_PLAYER_STORAGE_EVENT,
  SLURP_PLAYER_STORAGE_KEY,
} from "@/utils/slurpStorage";

type Snapshot = {
  checked: boolean;
  state: SlurpPlayerState | null;
};

const SERVER_SNAPSHOT: Snapshot = { checked: false, state: null };

let cachedRaw: string | null | undefined;
let cachedSnapshot: Snapshot | undefined;

function getClientSnapshot(): Snapshot {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;

  const raw = window.localStorage.getItem(SLURP_PLAYER_STORAGE_KEY);
  if (raw === cachedRaw && cachedSnapshot) return cachedSnapshot;

  cachedRaw = raw;

  if (!raw) {
    cachedSnapshot = { checked: true, state: null };
    return cachedSnapshot;
  }

  try {
    cachedSnapshot = {
      checked: true,
      state: JSON.parse(raw) as SlurpPlayerState,
    };
    return cachedSnapshot;
  } catch {
    cachedSnapshot = { checked: true, state: null };
    return cachedSnapshot;
  }
}

export function useSlurpPlayerState() {
  const snapshot = useSyncExternalStore<Snapshot>(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};

      const onStorage = (event: StorageEvent) => {
        if (event.key !== SLURP_PLAYER_STORAGE_KEY) return;
        onStoreChange();
      };

      const onInternal = () => onStoreChange();

      window.addEventListener("storage", onStorage);
      window.addEventListener(SLURP_PLAYER_STORAGE_EVENT, onInternal);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(SLURP_PLAYER_STORAGE_EVENT, onInternal);
      };
    },
    getClientSnapshot,
    () => SERVER_SNAPSHOT
  );

  return snapshot;
}
