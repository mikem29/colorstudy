import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    csrf: {
      trustedOrigins: ['https://www.huemixy.com', 'https://huemixy.com']
    }
  }
};

export default config;