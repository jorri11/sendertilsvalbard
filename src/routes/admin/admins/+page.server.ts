import { hashPassword } from '$lib/server/auth';
import { db, type User } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  return {
    users: db.prepare('SELECT id, email, created_at FROM users ORDER BY created_at DESC').all() as Pick<
      User,
      'id' | 'email' | 'created_at'
    >[],
    adminRequests: db
      .prepare("SELECT id, email, message, created_at FROM admin_requests WHERE status = 'pending' ORDER BY created_at ASC")
      .all() as { id: number; email: string; message: string | null; created_at: string }[]
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { message: 'E-post og passord må fylles ut.', email });
    }

    if (password.length < 12) {
      return fail(400, { message: 'Passordet må ha minst 12 tegn.', email });
    }

    try {
      db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hashPassword(password));
    } catch {
      return fail(400, { message: 'Denne adminbrukeren finnes allerede.', email });
    }

    return { success: true };
  },
  approveRequest: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    const password = String(form.get('password') ?? '');
    const adminRequest = db
      .prepare("SELECT id, email FROM admin_requests WHERE id = ? AND status = 'pending'")
      .get(id) as { id: number; email: string } | undefined;

    if (!adminRequest) {
      return fail(404, { message: 'Forespørselen finnes ikke lenger.' });
    }

    if (password.length < 12) {
      return fail(400, { message: 'Passordet må ha minst 12 tegn.' });
    }

    try {
      db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(adminRequest.email, hashPassword(password));
    } catch {
      return fail(400, { message: 'Denne adminbrukeren finnes allerede.' });
    }

    db.prepare("UPDATE admin_requests SET status = 'approved' WHERE id = ?").run(id);

    return { approved: true };
  },
  denyRequest: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));

    db.prepare("UPDATE admin_requests SET status = 'denied' WHERE id = ? AND status = 'pending'").run(id);

    return { denied: true };
  }
};
