import {
	getPendingSubmissionById,
	listAdminCompanies,
	listPendingSubmissions,
	markSubmissionApproved,
	markSubmissionRejected,
	upsertCompanyFromForm
} from '$lib/server/db';
import { selectedCategories } from '$lib/categories';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  return {
    companies: listAdminCompanies(),
    submissions: listPendingSubmissions()
  };
};

export const actions: Actions = {
  approve: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    const submission = getPendingSubmissionById(id);
    if (!submission) return fail(404, { message: 'Forslaget finnes ikke.' });

    const companyForm = new FormData();
    companyForm.set('name', submission.company_name);
    companyForm.set('website', submission.website ?? '');
    if (submission.ships_to_svalbard) companyForm.set('ships_to_svalbard', 'on');
    if (submission.vat_refund) companyForm.set('vat_refund', 'on');
    companyForm.set('shipping_methods', submission.shipping_methods ?? '');
    for (const category of selectedCategories(submission.categories)) {
      companyForm.append('categories', category);
    }
    companyForm.set('notes', submission.notes ?? '');
    companyForm.set('source_url', submission.source_url ?? '');

    if (submission.submission_type === 'change_request' && submission.company_id) {
      upsertCompanyFromForm(companyForm, submission.company_id);
    } else {
      upsertCompanyFromForm(companyForm);
    }
    markSubmissionApproved(id);
    redirect(303, '/admin');
  },
  reject: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    markSubmissionRejected(id);
    redirect(303, '/admin');
  }
};
