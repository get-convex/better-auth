import 'dotenv/config'
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
  /*
  server: {
    routeRules: {
      '/api/auth/**': {
        proxy: {
          to: process.env.CONVEX_SITE_URL + '/api/auth/**',
        },
      },
    },
  },
  */
})
