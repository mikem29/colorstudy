import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  // Homepage is public - no authentication required
  return {
    user: event.locals.user
  };
};