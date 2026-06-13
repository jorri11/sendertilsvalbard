import { createAdminRequest } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const message = String(form.get('message') ?? '').trim();

    if (!email) {
      return fail(400, { message: 'E-post må fylles ut.' });
    }

    createAdminRequest(email, message);

    return { success: true };
  }
};
