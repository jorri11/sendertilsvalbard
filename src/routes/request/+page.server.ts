import { createSubmissionFromForm } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const company_name = String(form.get('company_name') ?? '').trim();
    if (!company_name) {
      return fail(400, { message: 'Firmanavn må fylles ut.', values: Object.fromEntries(form) });
    }

    createSubmissionFromForm(form, { submissionType: 'new_company' });

    return { success: true };
  }
};
