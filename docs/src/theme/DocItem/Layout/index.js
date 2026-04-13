import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocPaginator from '@theme/DocPaginator';
import TOC from '@theme/TOC';
import Search from '@theme/SearchBar';
import EditThisPage from '@theme/EditThisPage';
import { VersionDropdown } from '@site/src/components/VersionDropdown';
import { Feedback } from '@site/src/components/Feedback';
import { useViewport } from '@site/src/hooks/useViewport';
import styles from '../styles.module.scss';

export default function DocItemLayout({ children }) {
  const { metadata, frontMatter, toc } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const breakpoints = siteConfig?.customFields?.breakpoints;
  const { width } = useViewport() || { width: 0 };

  const {
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
  } = frontMatter;

  const { title, editUrl } = metadata;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      function adjustScroll() {
        const hash = window.location.hash.replace('#', '');
        const element = hash && document.getElementById(hash);
        if (element) {
          window.scrollTo({ top: element.offsetTop, behavior: 'auto' });
        }
      }
      adjustScroll();
      window.addEventListener('hashchange', adjustScroll, false);
      return () => {
        window.removeEventListener('hashchange', adjustScroll, false);
      };
    }
  }, []);

  return (
    <>
      <div className="row">
        <div
          className={clsx('col', {
            [styles.docItemCol]: !hideTableOfContents,
          })}>
          <div className={styles.docItemContainer}>
            <article>
              {!hideTitle && (
                <div className={styles.docContentHeader}>
                  <header>
                    <h1 className={styles.docTitle}>{title}</h1>
                  </header>
                  {width > 767 && (
                    <div className={clsx(styles.actionButtons)}>
                      {editUrl && <EditThisPage editUrl={editUrl} />}
                      <VersionDropdown />
                    </div>
                  )}
                </div>
              )}
              <div
                className={`searhBar ${
                  width < (breakpoints?.sm || 767)
                    ? 'wt_versionDropdown'
                    : ''
                }`}>
                <Search />
                {width < (breakpoints?.sm || 767) && <VersionDropdown />}
              </div>
              <DocVersionBanner />
              <div className="markdown">{children}</div>
            </article>
            <div className="margin-vert--lg">
              <DocPaginator
                previous={metadata.previous}
                next={metadata.next}
              />
            </div>
          </div>
        </div>
        {!hideTableOfContents &&
          toc.length > 0 &&
          width > (breakpoints?.lg || 1100) && (
            <div className="rightAligned-col-250 col col--3 padding-left--lg">
              <TOC toc={toc} />
            </div>
          )}
      </div>
      <Feedback />
    </>
  );
}
