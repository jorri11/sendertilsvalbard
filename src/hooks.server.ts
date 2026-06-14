import { bootstrapAdminUser, getUserFromSession } from '$lib/server/auth';
import { migrateDatabase } from '$lib/server/db';
import { redirect, type Handle } from '@sveltejs/kit';

let bootstrapComplete = false;

const isAdminRoute = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

export const handle: Handle = async ({ event, resolve }) => {
  if (!bootstrapComplete) {
    migrateDatabase();
    bootstrapAdminUser();
    bootstrapComplete = true;
  }

  event.locals.user = getUserFromSession(event.cookies.get('session'));

  if (isAdminRoute(event.url.pathname) && !event.locals.user) {
    const redirectTo = event.url.pathname + event.url.search;
    redirect(303, `/login?${new URLSearchParams({ redirectTo })}`);
  }

  return resolve(event);
};
