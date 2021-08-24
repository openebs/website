import { Image, SiteMetadata } from './metadata.models';
import { METADATA_TYPES } from '../../constants';

interface WebsiteSchemaProps {
  title: string;
  description: string;
  type?: string;
  url: string;
  image: Image;
  site: SiteMetadata;
}
export const websiteSchema = ({
  title, description, type, url, image, site,
}: WebsiteSchemaProps) => ({
  '@context': 'https://schema.org/',
  '@type': `${type || METADATA_TYPES.WEBSITE}`,
  url,
  image: image.src
    ? {
      '@type': METADATA_TYPES.IMAGE_OBJECT,
      url: image.src,
      width: image.shareImageWidth,
      height: image.shareImageHeight,
    }
    : undefined,
  headline: title,
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
  mainEntityOfPage: {
    '@type': METADATA_TYPES.WEBPAGE,
    '@id': site.siteUrl,
  },
  description,
});
