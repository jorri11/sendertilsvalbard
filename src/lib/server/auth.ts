import { db, getFirstUser, getUserByEmail, type User } from './db.js';
import { sessions, users } from './db/schema.js';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';

const sessionDays = 14;

export type SessionUser = Pick<User, 'id' | 'email' | 'is_superuser'>;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hash, 'hex');
  return storedHash.length === candidate.length && timingSafeEqual(storedHash, candidate);
}

export function ensureEnvAdmin(): void {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    ensureAtLeastOneSuperuser();
    return;
  }

  const existing = getUserByEmail(email);
  if (existing) {
    db.update(users).set({ is_superuser: 1 }).where(eq(users.email, email)).run();
    return;
  }

  db.insert(users).values({ email, password_hash: hashPassword(password), is_superuser: 1 }).run();
}

export function ensureAtLeastOneSuperuser(): void {
  const existing = db.select({ id: users.id }).from(users).where(eq(users.is_superuser, 1)).limit(1).get();
  if (existing) return;

  const firstUser = getFirstUser();
  if (!firstUser) return;

  db.update(users).set({ is_superuser: 1 }).where(eq(users.id, firstUser.id)).run();
}

export function createAdminUser(email: string, password: string): void {
  db.insert(users).values({ email, password_hash: hashPassword(password), is_superuser: 0 }).run();
}

export function createSession(userId: number): { id: string; expires: string } {
  const id = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
  db.insert(sessions).values({ id, user_id: userId, expires_at: expires }).run();
  return { id, expires };
}

export function getUserFromSession(sessionId: string | undefined): SessionUser | null {
  if (!sessionId) return null;
  const row = db
    .select({ id: users.id, email: users.email, is_superuser: users.is_superuser })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.user_id))
    .where(and(eq(sessions.id, sessionId), sql`${sessions.expires_at} > datetime('now')`))
    .get();
  return row ?? null;
}

export function deleteSession(sessionId: string | undefined): void {
  if (!sessionId) return;
  db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

let adminBootstrapComplete = false;

export function bootstrapAdminUser(): void {
  if (adminBootstrapComplete) return;
  ensureEnvAdmin();
  adminBootstrapComplete = true;
}
