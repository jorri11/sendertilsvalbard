import { db, normalizeBoolean, normalizeUrl } from '$lib/server/db';
import { normalizeCategories } from '$lib/categories';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const company_name = String(form.get('company_name') ?? '').trim();
    const website = normalizeUrl(form.get('website'));

    if (!company_name) {
      return fail(400, { message: 'Firmanavn må fylles ut.', values: Object.fromEntries(form) });
    }

    db.prepare(
      `INSERT INTO submissions
        (submission_type, company_name, website, ships_to_svalbard, vat_refund, shipping_methods, categories, notes, contact_email, source_url)
       VALUES
        ('new_company', @company_name, @website, @ships_to_svalbard, @vat_refund, @shipping_methods, @categories, @notes, @contact_email, @source_url)`
    ).run({
      company_name,
      website,
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
