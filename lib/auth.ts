import { cookies } from "next/headers";
import { COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";

const COOKIE_NAME = "keyHash";

export async function getKeyHash(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setKeyHash(hash: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearKeyHash(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// --- Board unlock cookies (server-side session for locked boards) ---

const BOARD_UNLOCK_PREFIX = "board-unlock-";
const BOARD_UNLOCK_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function isBoardUnlocked(boardId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(`${BOARD_UNLOCK_PREFIX}${boardId}`)?.value === "1";
}

export async function setBoardUnlocked(boardId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${BOARD_UNLOCK_PREFIX}${boardId}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/board/${boardId}`,
    maxAge: BOARD_UNLOCK_MAX_AGE,
  });
}

// --- Timing-safe hash comparison ---

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  // constant-time comparison
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}
