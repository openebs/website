import React from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';

function DocPaginator({ previous, next }) {
  return (
    <nav
      className="pagination-nav"
      aria-label={translate({
        id: 'theme.docs.paginator.navAriaLabel',
        message: 'Docs pages navigation',
        description: 'The ARIA label for the docs pagination',
      })}>
      <div className="pagination-nav__item">
        {previous && (
          <Link
            className="doc-button doc-button-outlined doc-button-curved doc-button-lg"
            to={previous.permalink}
            title={previous.title}>
            <div className="pagination-nav__label">Previous Article</div>
          </Link>
        )}
      </div>
      <div className="pagination-nav__item pagination-nav__item--next">
        {next && (
          <Link
            className="doc-button doc-button-outlined doc-button-curved doc-button-lg"
            to={next.permalink}
            title={next.title}>
            <div className="pagination-nav__label">Next Article</div>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default DocPaginator;
