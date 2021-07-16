import { Image, SiteMetadata } from "./metadata.models";
interface WebsiteSchemaProps {
  title: string;
  description: string;
  type?: string;
  url: string;
  image: Image;
  site: SiteMetadata;
}
export const websiteSchema = ({ title, description, type, url, image, site }: WebsiteSchemaProps) => {
  return {
    '@context': `https://schema.org/`,
    '@type': `${type || 'Website'}`,
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




