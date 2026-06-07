import { db, upsertCompanyFromForm, type Company, type Submission } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  return {
    companies: db.prepare('SELECT * FROM companies ORDER BY updated_at DESC, name ASC').all() as Company[],
    submissions: db
      .prepare(
        `SELECT submissions.*, companies.name AS current_company_name
         FROM submissions
         LEFT JOIN companies ON companies.id = submissions.company_id
         WHERE submissions.status = 'pending'
         ORDER BY submissions.created_at ASC`
      )
      .all() as (Submission & { current_company_name: string | null })[]
  };
};

export const actions: Actions = {
  approve: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    const submission = db.prepare("SELECT * FROM submissions WHERE id = ? AND status = 'pending'").get(id) as
      | Submission
      | undefined;
    if (!submission) return fail(404, { message: 'Forslaget finnes ikke.' });

    const companyForm = new FormData();
    companyForm.set('name', submission.company_name);
    companyForm.set('website', submission.website ?? '');
    if (submission.ships_to_svalbard) companyForm.set('ships_to_svalbard', 'on');
    if (submission.vat_refund) companyForm.set('vat_refund', 'on');
    companyForm.set('shipping_methods', submission.shipping_methods ?? '');
    companyForm.set('categories', submission.categories ?? '');
    companyForm.set('notes', submission.notes ?? '');
    companyForm.set('source_url', submission.source_url ?? '');

    if (submission.submission_type === 'change_request' && submission.company_id) {
      upsertCompanyFromForm(companyForm, submission.company_id);
    } else {
      upsertCompanyFromForm(companyForm);
    }
    db.prepare("UPDATE submissions SET status = 'approved' WHERE id = ?").run(id);
    redirect(303, '/admin');
  },
  reject: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    db.prepare("UPDATE submissions SET status = 'rejected' WHERE id = ?").run(id);
    redirect(303, '/admin');
  }
};
