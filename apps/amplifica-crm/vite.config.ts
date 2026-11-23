import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // App padrão da agência: http://localhost:5174/agencia/admin/
    base: '/agencia/admin/',
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@ederson-agencia/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      },
    },
    server: {
      hmr: process.env.CRM_HMR_CLIENT_PORT ? false : { path: '/agencia/admin/vite-hmr' },
    },
    optimizeDeps: {
      exclude: ['pg', 'pg-native', 'postgres-bytea'],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        external: ['pg', 'pg-native'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
              if (id.includes('supabase')) return 'vendor-supabase';
              if (id.includes('motion')) return 'vendor-motion';
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
