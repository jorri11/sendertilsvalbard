import { getCompanyById, markCompanyDeleted, upsertCompanyFromForm } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const company = getCompanyById(Number(params.id));
  if (!company) error(404, 'Firma finnes ikke.');
  return { company };
};

export const actions: Actions = {
  save: async ({ params, request }) => {
    try {
      upsertCompanyFromForm(await request.formData(), Number(params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunne ikke lagre firma.';
      return fail(400, { message });
    }

    redirect(303, `/admin/companies/${params.id}`);
  },
  delete: async ({ params }) => {
    const id = Number(params.id);
    const company = getCompanyById(id);
    if (!company) return fail(404, { message: 'Firma finnes ikke.' });

    markCompanyDeleted(id);
    redirect(303, '/admin');
  }
};
