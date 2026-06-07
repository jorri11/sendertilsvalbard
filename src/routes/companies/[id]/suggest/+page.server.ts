import { db, normalizeBoolean, normalizeUrl, type Company } from '$lib/server/db';
import { normalizeCategories } from '$lib/categories';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const company = db
    .prepare("SELECT * FROM companies WHERE id = ? AND status = 'published'")
    .get(Number(params.id)) as Company | undefined;

  if (!company) error(404, 'Firma finnes ikke.');

  return { company };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    const companyId = Number(params.id);
    const current = db
      .prepare("SELECT * FROM companies WHERE id = ? AND status = 'published'")
      .get(companyId) as Company | undefined;

    if (!current) error(404, 'Firma finnes ikke.');

    const form = await request.formData();
    const company_name = String(form.get('company_name') ?? '').trim();

    if (!company_name) {
      return fail(400, { message: 'Firmanavn må fylles ut.' });
    }

    db.prepare(
      `INSERT INTO submissions
        (company_id, submission_type, company_name, website, ships_to_svalbard, vat_refund, shipping_methods, categories, notes, contact_email, source_url)
       VALUES
        (@company_id, 'change_request', @company_name, @website, @ships_to_svalbard, @vat_refund, @shipping_methods, @categories, @notes, @contact_email, @source_url)`
    ).run({
      company_id: companyId,
      company_name,
      website: normalizeUrl(form.get('website')),
      ships_to_svalbard: normalizeBoolean(form.get('ships_to_svalbard')),
      vat_refund: normalizeBoolean(form.get('vat_refund')),
      shipping_methods: String(form.get('shipping_methods') ?? '').trim(),
      categories: normalizeCategories(form.getAll('categories')),
      notes: String(form.get('notes') ?? '').trim(),
      contact_email: String(form.get('contact_email') ?? '').trim(),
      source_url: normalizeUrl(form.get('source_url'))
    });

    return { success: true };
  }
};
