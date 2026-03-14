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
