import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session) {
    throw redirect(302, "/");
  }
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.session) {
      throw fail(401);
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    throw redirect(302, "/login");
  }
};