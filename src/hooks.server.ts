import { getUserFromSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = getUserFromSession(event.cookies.get('session'));
  return resolve(event);
};
