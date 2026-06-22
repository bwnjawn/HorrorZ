import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // --- NUEVO: Configuración para contenedores Docker ---
  server: {
    host: true, // Permite conexiones externas al contenedor
    port: 5173, // Puerto interno por defecto de Vite
    watch: {
      usePolling: true, // Forzar hot-reload si usas volúmenes en Windows/Docker
    },
  },
});
