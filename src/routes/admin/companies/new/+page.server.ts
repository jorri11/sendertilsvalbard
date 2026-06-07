import { upsertCompanyFromForm } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    let id: number;

    try {
      id = upsertCompanyFromForm(await request.formData());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunne ikke lagre firma.';
      return fail(400, { message });
    }

    redirect(303, `/admin/companies/${id}`);
  }
};
