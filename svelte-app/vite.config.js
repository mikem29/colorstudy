import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';

/** @type {import('vite').UserConfig} */
const config = ({ mode }) => ({
  plugins: [sveltekit()],
  server: {
    port: 5173
  },
  // Ensure .env variables are available to the server
  define: {
    'process.env': loadEnv(mode, process.cwd(), '')
  }
});

export default config;