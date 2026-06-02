import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.APP_USERNAME;
  const expectedPass = process.env.APP_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return false;
  }
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { SESSION_COOKIE };
