import { Author, Image, SiteMetadata } from './metadata.models';
import { METADATA_TYPES } from '../../constants';

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image: Image;
  author?: Author;
  tags?: [string];
  site: SiteMetadata;
}

export const articleSchema = ({
  title, description, url, image, author, tags, site,
}: ArticleSchemaProps) => ({
  '@context': 'https://schema.org/',
  '@type': METADATA_TYPES.ARTICLE,
  author: {
    '@type': METADATA_TYPES.PERSON,
    name: author?.name,
    image: author?.image ? author?.image : undefined,
  },
  keywords: tags?.length ? tags?.join(', ') : undefined,
  headline: title,
  url,
  image: image.src
    ? {
      '@type': METADATA_TYPES.IMAGE_OBJECT,
      url: image.src,
      width: image.shareImageWidth,
      height: image.shareImageHeight,
    }
    : undefined,
  publisher: {
    '@type': METADATA_TYPES.ORGANIZATION,
    name: 'OpenEBS',
    logo: {
      '@type': METADATA_TYPES.IMAGE_OBJECT,
      url: site.logo,
      width: 60,
      height: 60,
    },
  },
  description,
  mainEntityOfPage: {
    '@type': METADATA_TYPES.WEBPAGE,
    '@id': site.siteUrl,
  },
});
