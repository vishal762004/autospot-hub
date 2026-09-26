import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Vitest 3 bundles a Vite type version that is incompatible with the Vite 8
  // plugin type even though the runtime plugin is valid.
  // @ts-expect-error Vite/Vitest plugin type duplication
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
