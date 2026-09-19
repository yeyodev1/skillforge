import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Hosts desde los que se sirve el dev server a través de túneles (cloudflared).
    allowedHosts: ['.bakano.ec', '.trycloudflare.com'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Solo tokens, funciones y mixins: este archivo se antepone a CADA bloque
        // <style lang="scss">, así que nada que emita CSS puede vivir ahí.
        // El reset y las custom properties están en global.scss, que se importa
        // una sola vez desde main.ts.
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
})
