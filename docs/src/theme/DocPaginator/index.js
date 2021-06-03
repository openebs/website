/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';

function DocPaginator(props) {
  const {metadata} = props;
  return (
    <nav
      className="pagination-nav"
      aria-label={translate({
        id: 'theme.docs.paginator.navAriaLabel',
        message: 'Docs pages navigation',
        description: 'The ARIA label for the docs pagination',
      })}>
      <div className="pagination-nav__item">
        {metadata.previous && (
          <Link
            className="doc-button doc-button-outlined doc-button-curved doc-button-lg"
            to={metadata.previous.permalink}
            title={metadata.previous.title}
            >
            <div className="pagination-nav__label">
              Previous Article
            </div>
          </Link>
        )}
      </div>
      <div className="pagination-nav__item pagination-nav__item--next">
        {metadata.next && (
          <Link className="doc-button doc-button-outlined doc-button-curved doc-button-lg" to={metadata.next.permalink} title={metadata.next.title}>
            <div className="pagination-nav__label">
              Next Article
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default DocPaginator;
