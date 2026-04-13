import React from 'react';
import clsx from 'clsx';
import { useTOCHighlight } from '@docusaurus/theme-common/internal';
import styles from './styles.module.scss';

const LINK_CLASS_NAME = 'table-of-contents__link';
const ACTIVE_LINK_CLASS_NAME = 'table-of-contents__link--active';

function Headings({ toc, isChild }) {
  if (!toc.length) {
    return null;
  }

  return (
    <ul
      className={
        isChild
          ? ''
          : `${styles.toc_contents} table-of-contents table-of-contents__left-border`
      }>
      {toc.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={LINK_CLASS_NAME}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: heading.value }}
          />
          {heading.children && (
            <Headings isChild toc={heading.children} />
          )}
        </li>
      ))}
    </ul>
  );
}

function TOC({ toc }) {
  useTOCHighlight({
    linkClassName: LINK_CLASS_NAME,
    linkActiveClassName: ACTIVE_LINK_CLASS_NAME,
    minHeadingLevel: 2,
    maxHeadingLevel: 3,
  });
  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar')}>
      <span>On this page:</span>
      <Headings toc={toc} />
    </div>
  );
}

export default TOC;
