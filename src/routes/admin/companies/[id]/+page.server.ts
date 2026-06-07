import { db, upsertCompanyFromForm, type Company } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(Number(params.id)) as Company | undefined;
  if (!company) error(404, 'Firma finnes ikke.');
  return { company };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    try {
      upsertCompanyFromForm(await request.formData(), Number(params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunne ikke lagre firma.';
      return fail(400, { message });
    }

    redirect(303, `/admin/companies/${params.id}`);
  }
};
