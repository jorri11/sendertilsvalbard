import { bootstrapAdminUser, getUserFromSession } from "$lib/server/auth";
import { migrateDatabase } from "$lib/server/db";
import { redirect, type Handle } from "@sveltejs/kit";

let bootstrapComplete = false;

export const handle: Handle = async ({ event, resolve }) => {
  const host = event.url.hostname;

  if (host === "www.sendertilsvalbard.no") {
    console.log("wwww redirect");
    throw redirect(
      301,
      `https://sendertilsvalbard.no${event.url.pathname}${event.url.search}`,
    );
  }
  if (!bootstrapComplete) {
    migrateDatabase();
    bootstrapAdminUser();
    bootstrapComplete = true;
  }

  event.locals.user = getUserFromSession(event.cookies.get("session"));
  return resolve(event);
};
