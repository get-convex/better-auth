import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [pluginCollapsibleSections()],
  defaultProps: {
    // Change the default style of collapsible sections
    collapseStyle: 'collapsible-start',
  },
}