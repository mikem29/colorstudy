import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(404, 'Not found');
  }

  if (locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  return {};
};
