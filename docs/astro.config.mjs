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
                {slug: '', label: 'Quick Start', link: '/docs/'},
                {slug: 'schemas-and-sync', label: 'Schemas & Data Syncing', link: '/docs/schemas-and-sync/'},
                {slug: 'basic-usage', label: 'Basic Usage', link: '/docs/basic-usage/'},
                {slug: 'integrations', label: 'Integrations', link: '/docs/integrations/'},
                {label: 'Guides', collapsed: false, items: [
                    {slug: 'guides/migrating-existing-users', label: 'Migrating Existing Users', link: '/docs/guides/migrating-existing-users/'},
                    {slug: 'guides/migrate-056-060', label: 'Migrating from 0.5.6 to 0.6.0', link: '/docs/guides/migrate-056-060/'},
                    {slug: 'guides/migrate-040-050', label: 'Migrating from 0.4.0 to 0.5.0', link: '/docs/guides/migrate-040-050/'},
                ]},
            ],
            customCss: ['./src/styles/global.css'],
        }),
        react(),
    ],
});