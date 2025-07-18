import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    // Allows this example to use other components without importing
    // them via @convex-dev/component-source. Not necessary for real
    // apps.
    ssr: { noExternal: ['@convex-dev/resend'] },
  },
})
