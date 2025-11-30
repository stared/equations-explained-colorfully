import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/equations-explained-colorfully/',
  plugins: [vue()],
});
