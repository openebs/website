/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import {useThemeConfig, useTitleFormatter} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
export default function Seo({title, description, keywords, image , siteUrl}) {
  const {image: defaultImage} = useThemeConfig();
  const pageTitle = useTitleFormatter(title);
  const pageImage = useBaseUrl(image || defaultImage, {
    absolute: true,
  });
  return (
    <Head>
      {title && <title>{pageTitle}</title>}
      {description && <meta name="description" content={description} />}
      {pageImage && <meta property="image" content={pageImage} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      {title && <meta property="og:title" content={pageTitle} />}
      {siteUrl && <meta property="og:site_name" content={siteUrl} />}
      {/* <meta property="og:url" content={url || defaultConfig.url} /> */}
      {description && <meta property="og:description" content={description} />}

      {keywords && (
        <meta
          name="keywords"
          content={Array.isArray(keywords) ? keywords.join(',') : keywords}
        />
      )}

      {pageImage && <meta property="og:image" content={pageImage} />}
      {pageImage && <meta name="twitter:image" content={pageImage} />}
      {pageImage && <meta name="twitter:card" content="summary_large_image" />}
    </Head>
  );
}
