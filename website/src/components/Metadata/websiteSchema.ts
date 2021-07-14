interface WebsiteSchemaProps {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  shareImageWidth: string;
  shareImageHeight: string;
  logo: string;
  siteUrl: string;
}
export const websiteSchema = ({ title, description, type, url, image, shareImageWidth, shareImageHeight, logo, siteUrl }: WebsiteSchemaProps) => {
  return {
    '@context': `https://schema.org/`,
    '@type': type,
    url: url,
    image: image
      ? {
          '@type': `ImageObject`,
          url: image,
          width: shareImageWidth,
          height: shareImageHeight,
        }
      : undefined,
    headline: title,
    publisher: {
      '@type': `Organization`,
      name: `OpenEBS`,
      logo: {
        '@type': `ImageObject`,
        url: logo,
        width: 60,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': `WebPage`,
      '@id': siteUrl,
    },
    description,
  }
}




