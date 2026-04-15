import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const WEBSITE_URL = 'https://openebs.io';

const config: Config = {
  title: 'OpenEBS Docs',
  tagline: 'OpenEBS Docs: Information regarding the latest releases',
  url: WEBSITE_URL,
  baseUrl: '/docs/',
  onBrokenLinks: 'log',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  favicon: '/docs/img/favicon.ico',
  organizationName: 'openebs',
  projectName: 'website',

  future: {
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    breakpoints: {
      xs: 0,
      sm: 767,
      md: 996,
      lg: 1100,
      xl: 0,
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'main',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/openebs/website/edit/main/docs/',
          includeCurrentVersion: true,
          lastVersion: 'current',
          versions: {
            current: {
              label: 'main',
              path: 'main',
            },
            '4.4.x': {
              label: '4.4.x',
              path: '4.4.x',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-BNB79447GR',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/card-openebs.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
    },
    navbar: {
      title: 'OpenEBS Docs',
      logo: {
        alt: 'OpenEBS Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/openebs/openebs',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: `${WEBSITE_URL}/community`,
          label: 'Community',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Getting Started',
          items: [
            {label: 'Docs', to: '/'},
            {label: 'GitHub', href: 'https://github.com/openebs/openebs'},
            {label: 'Community', href: `${WEBSITE_URL}/community`},
            {label: 'FAQ', href: `${WEBSITE_URL}/faq`},
            {label: 'Blog', href: `${WEBSITE_URL}/blog`},
            {label: 'Commercial Support', href: `${WEBSITE_URL}/commercial-support`},
          ],
        },
        {
          title: 'Contact Us',
          items: [
            {label: 'Email Us', href: `${WEBSITE_URL}/email-us`},
            {label: 'Feature Request', href: `${WEBSITE_URL}/feature-request`},
          ],
        },
        {
          title: 'Social',
          items: [
            {label: 'GitHub', href: 'https://github.com/openebs/openebs'},
            {label: 'Slack', href: `${WEBSITE_URL}/community`},
            {label: 'Twitter', href: 'https://twitter.com/openebs'},
            {label: 'LinkedIn', href: 'https://www.linkedin.com/company/openebs'},
            {label: 'YouTube', href: 'https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The OpenEBS Authors | All rights reserved`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
