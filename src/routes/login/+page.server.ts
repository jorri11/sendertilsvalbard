import { createSession, deleteSession, verifyPassword } from '$lib/server/auth';
import { getUserByEmail } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) redirect(303, '/admin');
};

export const actions: Actions = {
  login: async ({ cookies, request }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const user = getUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return fail(400, { message: 'Feil e-post eller passord.', email });
    }

    const session = createSession(user.id);
    cookies.set('session', session.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(session.expires)
    });

    redirect(303, '/admin');
  },
  logout: async ({ cookies }) => {
    deleteSession(cookies.get('session'));
    cookies.delete('session', { path: '/' });
    redirect(303, '/');
  }
};
