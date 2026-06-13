import { createSubmissionFromForm, getPublishedCompanyById } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const company = getPublishedCompanyById(Number(params.id));

  if (!company) error(404, 'Firma finnes ikke.');

  return { company };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    const companyId = Number(params.id);
    const current = getPublishedCompanyById(companyId);

    if (!current) error(404, 'Firma finnes ikke.');

    const form = await request.formData();
    const company_name = String(form.get('company_name') ?? '').trim();

    if (!company_name) {
      return fail(400, { message: 'Firmanavn må fylles ut.' });
    }

    createSubmissionFromForm(form, { companyId, submissionType: 'change_request' });

    return { success: true };
  }
};
