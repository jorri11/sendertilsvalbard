import { redirect } from '@sveltejs/kit';
import { countPendingAdminRequests } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login');
  const pendingAdminRequests = locals.user.is_superuser ? countPendingAdminRequests() : 0;

  return {
    user: locals.user,
    pendingAdminRequests
  };
};
