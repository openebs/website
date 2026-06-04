import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { usePluginData } from '@docusaurus/useGlobalData';
import React from 'react';
import styles from './styles.module.css';
const WEBSITE_URL = 'https://openebs.io';
const NEWSLETTER_URL = 'https://lists.cncf.io/g/cncf-openebs-announcements';
const PRIVACY_POLICY_URL = `${WEBSITE_URL}/privacy-policy`;
const TRADEMARK_USAGE_URL = 'https://www.linuxfoundation.org/legal/trademark-usage';
const TOP_GITHUB_CONTRIBUTORS_URL = 'https://openebs.devstats.cncf.io/d/22/prs-authors-table?orgId=1&var-period_name=Last%20month&var-repogroup_name=All';
const NEW_GITHUB_CONTRIBUTORS_URL = 'https://openebs.devstats.cncf.io/d/52/new-contributors-table?orgId=1';
const GITHUB_PROFILE_URL = 'https://github.com/';
const socialLinks = [
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/openebs',
        icon: 'img/social_media/facebook.svg',
    },
    {
        label: 'GitHub',
        href: 'https://github.com/openebs/openebs',
        icon: 'img/social_media/github.svg',
    },
    {
        label: 'Slack',
        href: `${WEBSITE_URL}/community`,
        icon: 'img/social_media/slack.svg',
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/openebs',
        icon: 'img/social_media/linkedin.svg',
    },
    {
        label: 'YouTube',
        href: 'https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g',
        icon: 'img/social_media/youtube.svg',
    },
    {
        label: 'Twitter',
        href: 'https://twitter.com/openebs?s=20',
        icon: 'img/social_media/twitter.svg',
    },
];
function FooterColumn({ title, items = [] }) {
    if (!title || items.length === 0) {
        return null;
    }
    return (<div className={styles.column}>
      <h2 className={styles.columnTitle}>{title}</h2>
      <ul className={styles.columnList}>
        {items.map((item) => {
            if (!item.label || (!item.to && !item.href)) {
                return null;
            }
            return (<li key={`${title}-${item.label}`}>
              <Link className={styles.columnLink} to={item.to} href={item.href}>
                {item.label}
              </Link>
            </li>);
        })}
      </ul>
    </div>);
}
function ContributorColumn({ title, titleHref, contributors, }) {
    return (<div className={styles.column}>
      <h2 className={styles.columnTitle}>
        <Link className={styles.columnHeadingLink} href={titleHref}>
          {title}
        </Link>
      </h2>
      {contributors.length > 0 ? (<ul className={styles.columnList}>
          {contributors.map((login) => (<li key={`${title}-${login}`}>
              <Link className={styles.columnLink} href={`${GITHUB_PROFILE_URL}${login}`}>
                {login}
              </Link>
            </li>))}
        </ul>) : (<p className={styles.contributorsFallback}>
          <Link className={styles.columnLink} href={titleHref}>
            View on devstats →
          </Link>
        </p>)}
    </div>);
}
export default function Footer() {
    const { siteConfig } = useDocusaurusContext();
    const footer = (siteConfig.themeConfig.footer ?? {});
    const year = String(siteConfig.customFields?.currentYear ?? '');
    const assetBaseUrl = useBaseUrl('/');
    const logoSrc = useBaseUrl('img/openebs-logo.svg');
    const configuredColumns = footer.links ?? [];
    const getStartedColumn = configuredColumns.find((group) => group.title === 'Getting Started');
    const pluginData = (usePluginData('contributors-plugin') ?? {});
    const topContributors = pluginData.topContributors ?? [];
    const newContributors = pluginData.newContributors ?? [];
    return (<footer className={`footer ${styles.footer}`}>
      <div className={styles.topDivider}/>

      <div className={styles.content}>
        <div className={styles.brandColumn}>
          <Link className={styles.logoLink} to="/">
            <img alt="OpenEBS Logo" className={styles.logo} height="40" src={logoSrc} width="162"/>
          </Link>

          <div className={styles.newsletterBlock}>
            <h2 className={styles.columnTitle}>Subscribe to OpenEBS newsletter</h2>
            <Link className={styles.newsletterButton} href={NEWSLETTER_URL}>
              Subscribe
            </Link>
          </div>

          <div className={styles.socialIcons} aria-label="OpenEBS social links">
            {socialLinks.map((item) => (<Link aria-label={item.label} className={styles.socialIconLink} href={item.href} key={item.label}>
                <img alt={item.label} className={styles.socialIcon} height="20" src={`${assetBaseUrl}${item.icon}`} width="20"/>
              </Link>))}
          </div>
        </div>

        <div className={styles.linksGrid}>
          <FooterColumn title={getStartedColumn?.title} items={getStartedColumn?.items}/>
          <ContributorColumn contributors={topContributors} title="Top contributors (last month)" titleHref={TOP_GITHUB_CONTRIBUTORS_URL}/>
          <ContributorColumn contributors={newContributors} title="New contributors" titleHref={NEW_GITHUB_CONTRIBUTORS_URL}/>
        </div>
      </div>

      <div className={styles.bottomDivider}/>

      <div className={styles.legalRows}>
        <div className={styles.legalRow}>
          <span>Copyright © 2018-{year} The OpenEBS Authors | All rights reserved</span>
          <Link className={styles.legalLink} href={PRIVACY_POLICY_URL}>
            Privacy policy
          </Link>
        </div>

        <div className={styles.legalRow}>
          <span>
            © {year} The Linux Foundation. All rights reserved. The Linux Foundation has
            registered trademarks and uses trademarks. For a list of trademarks of The Linux
            Foundation,
            <span className={styles.legalNoWrap}>
              {' '}
              please see our{' '}
              <Link className={styles.legalLink} href={TRADEMARK_USAGE_URL}>
                Trademark Usage page.
              </Link>
            </span>
          </span>
        </div>
      </div>
    </footer>);
}
