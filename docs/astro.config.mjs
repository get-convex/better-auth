// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        starlight({
            title: 'Convex + Better Auth',
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/get-convex/better-auth' },
                { icon: 'npm', label: 'NPM', href: 'https://www.npmjs.com/package/@convex-dev/better-auth' },
                { icon: 'discord', label: 'Discord', href: 'https://discord.gg/convex-dev' },
            ],
            sidebar: [
                {slug: '', label: 'Quick Start', link: '/docs/'}
            ],
            customCss: ['./src/styles/global.css'],
        }),
        react(),
    ],
});