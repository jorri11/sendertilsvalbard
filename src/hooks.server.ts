import { bootstrapAdminUser, getUserFromSession } from "$lib/server/auth";
import { migrateDatabase } from "$lib/server/db";
import { type Handle } from "@sveltejs/kit";

let bootstrapComplete = false;

export const handle: Handle = async ({ event, resolve }) => {
  if (!bootstrapComplete) {
    migrateDatabase();
    bootstrapAdminUser();
    bootstrapComplete = true;
  }

  event.locals.user = getUserFromSession(event.cookies.get("session"));
  return resolve(event);
};
