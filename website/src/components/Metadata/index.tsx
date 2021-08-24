import React from 'react';
import { Helmet } from 'react-helmet';
import { useCurrentHost } from '../../hooks/useCurrentHost';
import { articleSchema } from './articleSchema';
import { websiteSchema } from './websiteSchema';
import { Author } from './metadata.models';
import { METADATA_TYPES } from '../../constants';

interface MetadataProps {
    title: string;
    description: string;
    url: string;
    image: string;
    type?: string;
    isPost: boolean;
    tags?: [string];
    author?: Author;
}

export const Metadata: React.FC<MetadataProps> = ({
  title, description, url, isPost, image, tags, author, type,
}) => {
  const { currentOrigin } = useCurrentHost();
  const site = {
    logo: `${currentOrigin}/images/png/logo.png`,
    siteUrl: `${currentOrigin}`,
  };

  const imageObj = {
    src: image,
    shareImageWidth: '1200px',
    shareImageHeight: '630px',
  };

  const defaultConfig = {
    title: 'OpenEBS - Container Attached Storage',
    description: `OpenEBS is an open source storage platform that provides persistent and containerized block storage for DevOps and
        container environments.`,
    url: site.siteUrl,
    image: site.logo,
    shareImageWidth: imageObj.shareImageWidth,
    shareImageHeight: imageObj.shareImageHeight,
  };

  const jsonLd = isPost ? articleSchema({
    title, description, url, image: imageObj, author, tags, site,
  }) : websiteSchema({
    title, description, url, image: imageObj, type, site,
  });
  return (
    <Helmet>
      <title>{title || defaultConfig.title}</title>
      <meta name="description" content={description || defaultConfig.description} />
      <meta name="image" content={image} />
      <link rel="canonical" href={url || defaultConfig.url} />
      {/** Open Graph  */}
      <meta property="og:type" content={isPost ? METADATA_TYPES.ARTICLE : METADATA_TYPES.WEBSITE} />
      <meta property="og:title" content={title || defaultConfig.title} />
      <meta property="og:site_name" content={currentOrigin} />
      <meta property="og:url" content={url || defaultConfig.url} />
      <meta property="og:description" content={description || defaultConfig.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={defaultConfig.shareImageWidth} />
      <meta property="og:image:height" content={defaultConfig.shareImageHeight} />
      {/** Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@openebs" />
      <meta name="twitter:site" content="https://twitter.com/openebs" />
      <meta name="twitter:title" content={title || defaultConfig.title} />
      <meta name="twitter:description" content={description || defaultConfig.description} />
      <meta name="twitter:image" content={image} />
      {isPost && tags && tags.map((keyword) => (
        <meta property="article:tag" content={keyword} key={keyword} />
      ))}
      {isPost && author?.name && (
        <meta name="twitter:label1" content="Written by" />
      )}
      {isPost && author?.name && (
        <meta name="twitter:data1" content={author.name} />
      )}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd, undefined, 4)}
      </script>
    </Helmet>
  );
};
