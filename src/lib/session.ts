import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = { isLoggedIn: false };

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? "shifaa_dev_session_secret_min_32_chars!!",
  cookieName: "shifaa_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
