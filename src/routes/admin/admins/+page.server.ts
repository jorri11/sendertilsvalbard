import { createAdminUser } from '$lib/server/auth';
import {
  getPendingAdminRequest,
  listPendingAdminRequests,
  listUsers,
  markAdminRequestApproved,
  markAdminRequestDenied
} from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user?.is_superuser) error(403, 'Kun superbruker kan administrere admins.');

  return {
    users: listUsers(),
    adminRequests: listPendingAdminRequests()
  };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    if (!locals.user?.is_superuser) error(403, 'Kun superbruker kan opprette admins.');

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
      createAdminUser(email, password);
    } catch {
      return fail(400, { message: 'Denne adminbrukeren finnes allerede.', email });
    }

    return { success: true };
  },
  approveRequest: async ({ locals, request }) => {
    if (!locals.user?.is_superuser) error(403, 'Kun superbruker kan godkjenne adminforespørsler.');

    const form = await request.formData();
    const id = Number(form.get('id'));
    const password = String(form.get('password') ?? '');
    const adminRequest = getPendingAdminRequest(id);

    if (!adminRequest) {
      return fail(404, { message: 'Forespørselen finnes ikke lenger.' });
    }

    if (password.length < 12) {
      return fail(400, { message: 'Passordet må ha minst 12 tegn.' });
    }

    try {
      createAdminUser(adminRequest.email, password);
      markAdminRequestApproved(id);
    } catch {
      return fail(400, { message: 'Denne adminbrukeren finnes allerede.' });
    }

    return { approved: true };
  },
  denyRequest: async ({ locals, request }) => {
    if (!locals.user?.is_superuser) error(403, 'Kun superbruker kan avslå adminforespørsler.');

    const form = await request.formData();
    const id = Number(form.get('id'));

    markAdminRequestDenied(id);

    return { denied: true };
  }
};
