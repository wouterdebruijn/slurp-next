export type SlurpPlayerState = {
  playerId: string;
  sessionId: string;
  username: string;
  shotglassId: number;
};

export const SLURP_PLAYER_STORAGE_KEY = "slurp:player";
export const SLURP_PLAYER_STORAGE_EVENT = "slurp:player:change";

function notifySlurpPlayerChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SLURP_PLAYER_STORAGE_EVENT));
}

export function readSlurpPlayerState(): SlurpPlayerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SLURP_PLAYER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SlurpPlayerState;
  } catch {
    return null;
  }
}

export function writeSlurpPlayerState(state: SlurpPlayerState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SLURP_PLAYER_STORAGE_KEY, JSON.stringify(state));
  notifySlurpPlayerChange();
}

export function clearSlurpPlayerState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SLURP_PLAYER_STORAGE_KEY);
  notifySlurpPlayerChange();
}
