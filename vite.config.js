import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd, env } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/151/',
  server: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${env.API_PORT || '3000'}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'github-pages-spa-fallback',
      apply: 'build',
      closeBundle() {
        const outputDirectory = resolve(cwd(), 'dist')
        copyFileSync(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'))
      },
    },
  ],
})