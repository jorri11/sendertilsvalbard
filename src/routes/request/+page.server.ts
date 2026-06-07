import { db, normalizeBoolean } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const company_name = String(form.get('company_name') ?? '').trim();
    const website = String(form.get('website') ?? '').trim();

    if (!company_name) {
      return fail(400, { message: 'Firmanavn ma fylles ut.', values: Object.fromEntries(form) });
    }

    db.prepare(
      `INSERT INTO submissions
        (company_name, website, ships_to_svalbard, vat_refund, shipping_methods, categories, notes, contact_email, source_url)
       VALUES
        (@company_name, @website, @ships_to_svalbard, @vat_refund, @shipping_methods, @categories, @notes, @contact_email, @source_url)`
    ).run({
      company_name,
      website,
      ships_to_svalbard: normalizeBoolean(form.get('ships_to_svalbard')),
      vat_refund: normalizeBoolean(form.get('vat_refund')),
      shipping_methods: String(form.get('shipping_methods') ?? '').trim(),
      categories: String(form.get('categories') ?? '').trim(),
      notes: String(form.get('notes') ?? '').trim(),
      contact_email: String(form.get('contact_email') ?? '').trim(),
      source_url: String(form.get('source_url') ?? '').trim()
    });

    return { success: true };
  }
};
