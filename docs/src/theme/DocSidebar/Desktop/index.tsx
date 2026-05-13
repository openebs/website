import React from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CollapseButton from '@theme/DocSidebar/Desktop/CollapseButton';
import Content from '@theme/DocSidebar/Desktop/Content';
import type {Props} from '@theme/DocSidebar/Desktop';
import styles from './styles.module.css';

function DocSidebarDesktop({path, sidebar, onCollapse, isHidden}: Props) {
  const {
    navbar: {hideOnScroll},
    docs: {
      sidebar: {hideable},
    },
  } = useThemeConfig();

  const logoSrc = useBaseUrl('img/openebs-logo.svg');

  return (
    <div
      className={clsx(
        styles.sidebar,
        hideOnScroll && styles.sidebarWithHideableNavbar,
        isHidden && styles.sidebarHidden,
      )}>
      <div className={styles.sidebarHeader}>
        <Link className={styles.sidebarBrand} to="/">
          <img alt="OpenEBS" className={styles.sidebarBrandLogo} src={logoSrc} />
        </Link>
        <div className={styles.sidebarIcons}>
          <Link
            aria-label="GitHub"
            className={styles.sidebarIconLink}
            href="https://github.com/openebs/openebs">
            <span className={clsx(styles.sidebarIcon, styles.sidebarIconGithub)} />
          </Link>
          <Link
            aria-label="Slack"
            className={styles.sidebarIconLink}
            href="https://openebs.io/community">
            <span className={clsx(styles.sidebarIcon, styles.sidebarIconSlack)} />
          </Link>
        </div>
      </div>
      <Content path={path} sidebar={sidebar} />
      {hideable && <CollapseButton onClick={onCollapse} />}
    </div>
  );
}

export default React.memo(DocSidebarDesktop);
