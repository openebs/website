/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import {useThemeConfig, useTitleFormatter } from '@docusaurus/theme-common';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from '@docusaurus/useBaseUrl';

const websiteSchema = ({ title, description, url, image, site }) => {
  return {
    '@context': `https://schema.org/`,
    '@type': `Website`,
    url: url,
    image: image.src
      ? {
          '@type': `ImageObject`,
          url: image.src,
          width: image.shareImageWidth,
          height: image.shareImageHeight,
        }
      : undefined,
    headline: title,
    publisher: {
      '@type': `Organization`,
      name: `OpenEBS`,
      logo: {
        '@type': `ImageObject`,
        url: site.logo,
        width: 60,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': `WebPage`,
      '@id': site.siteUrl,
    },
    description,
  }
}

export default function Seo({title, description, keywords, image , siteUrl, pageUrl}) {
  const {image: defaultImage} = useThemeConfig();
  const { siteConfig } = useDocusaurusContext();
  const pageTitle = useTitleFormatter(title);
  const pageImage = useBaseUrl(image || defaultImage, {
    absolute: true,
  });

  const site = {
    logo: `${siteUrl}/docs/img/logo.png`,
    siteUrl: siteUrl
  }

  const imageObj = {
    src: pageImage,
    shareImageWidth: '1200px',
    shareImageHeight: '630px'
  };

  const jsonLd = websiteSchema({ title, description, url: pageUrl, image: imageObj, site });

  return (
    <Head>
      <title>{pageTitle || siteConfig.title}</title>
      {description && <meta name="description" content={description} />}
      {pageImage && <meta property="image" content={pageImage} />}
      {pageUrl && <link rel="canonical" href={pageUrl} />}
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle || siteConfig.title} />
      {siteUrl && <meta property="og:site_name" content={siteUrl} />}
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      {description && <meta property="og:description" content={description} />}
      {pageImage && <meta property="og:image" content={pageImage} />}
      {pageImage && <meta property="og:image:width" content={imageObj.shareImageWidth} /> }
      {pageImage && <meta property="og:image:height" content={imageObj.shareImageHeight} /> }
      
      {keywords && (
        <meta
          name="keywords"
          content={Array.isArray(keywords) ? keywords.join(',') : keywords}
        />
      )}
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteConfig.title} />
      {description && <meta name="twitter:description" content={description} /> }
      {pageImage && <meta name="twitter:image" content={pageImage} />}
      <meta name="twitter:creator" content="@openebs" />
      <meta name="twitter:site" content="https://twitter.com/openebs" />

      {/* Schema org*/}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd, undefined, 4)}
      </script>
    </Head>
  );
}
