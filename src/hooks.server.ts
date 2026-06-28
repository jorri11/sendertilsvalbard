import { bootstrapAdminUser, getUserFromSession } from "$lib/server/auth";
import { migrateDatabase } from "$lib/server/db";
import { redirect, type Handle } from "@sveltejs/kit";

let bootstrapComplete = false;

export const handle: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get("host")?.split(":")[0].toLowerCase();
  const isBareDomain = host === "sendertilsvalbard.no";
  const isSafeNavigation = event.request.method === "GET" || event.request.method === "HEAD";

  if (isBareDomain && isSafeNavigation) {
    const url = new URL(event.url);
    url.protocol = "https:";
    url.hostname = "www.sendertilsvalbard.no";
    throw redirect(308, url);
  }

  if (!bootstrapComplete) {
    migrateDatabase();
    bootstrapAdminUser();
    bootstrapComplete = true;
  }

  event.locals.user = getUserFromSession(event.cookies.get("session"));
  return resolve(event);
};
