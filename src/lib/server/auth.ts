import { db } from './db.js';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { User } from './db.js';

const sessionDays = 14;

export type SessionUser = Pick<User, 'id' | 'email'>;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, 'hex'), candidate);
}

export function ensureEnvAdmin(): void {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;

  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hashPassword(password));
}

export function createSession(userId: number): { id: string; expires: string } {
  const id = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expires);
  return { id, expires };
}

export function getUserFromSession(sessionId: string | undefined): SessionUser | null {
  if (!sessionId) return null;
  const row = db
    .prepare(
      `SELECT users.id, users.email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
    )
    .get(sessionId) as SessionUser | undefined;
  return row ?? null;
}

export function deleteSession(sessionId: string | undefined): void {
  if (!sessionId) return;
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

ensureEnvAdmin();
