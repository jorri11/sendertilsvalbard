import { countPendingAdminRequests } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  const user = locals.user!;
  const pendingAdminRequests = user.is_superuser ? countPendingAdminRequests() : 0;

  return {
    user,
    pendingAdminRequests
  };
};
