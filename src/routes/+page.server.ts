import { companyCategories, listCompanies } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const category = url.searchParams.get('category')?.trim() ?? '';

  return {
    companies: listCompanies({ q, category }),
    categories: companyCategories(),
    filters: { q, category }
  };
};
