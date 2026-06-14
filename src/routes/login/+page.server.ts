import { createSession, deleteSession, verifyPassword } from '$lib/server/auth';
import { getUserByEmail } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const fallbackRedirect = '/admin';

const safeRedirectTo = (value: FormDataEntryValue | string | null) => {
  if (typeof value !== 'string') return fallbackRedirect;
  if (!value.startsWith('/') || value.startsWith('//')) return fallbackRedirect;
  return value;
};

export const load: PageServerLoad = ({ locals, url }) => {
  const redirectTo = safeRedirectTo(url.searchParams.get('redirectTo'));

  if (locals.user) redirect(303, redirectTo);

  return { redirectTo };
};

export const actions: Actions = {
  login: async ({ cookies, request }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const redirectTo = safeRedirectTo(form.get('redirectTo'));
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

    redirect(303, redirectTo);
  },
  logout: async ({ cookies }) => {
    deleteSession(cookies.get('session'));
    cookies.delete('session', { path: '/' });
    redirect(303, '/');
  }
};
