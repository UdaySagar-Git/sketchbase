import { cookies } from "next/headers";

const COOKIE_NAME = "keyHash";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
    maxAge: MAX_AGE,
  });
}

export async function clearKeyHash(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
