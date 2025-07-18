import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // tailwindcss(), sentry(), ...
    tanstackStart({
      /** Add your options here */
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    conditions: ['@convex-dev/component-source'],
  },
  // Allows this example to use other components without importing
  // them via @convex-dev/component-source. Not necessary for real
  // apps.
  ssr: { noExternal: ['@convex-dev/resend'] },
})
