import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login');
  const pendingAdminRequests = locals.user.is_superuser
    ? (db.prepare("SELECT count(*) AS count FROM admin_requests WHERE status = 'pending'").get() as { count: number }).count
    : 0;

  return {
    user: locals.user,
    pendingAdminRequests
  };
};
