
interface AuthorSchemaProps {
    author: string;
    description: string;
    url: string;
    shareImage: string;
    shareImageWidth: string;
    shareImageHeight: string;
    siteUrl: string;
}

export const authorSchema = ({ author, url, description, shareImage, shareImageWidth, shareImageHeight, siteUrl }: AuthorSchemaProps) => {
    return {
    '@context': `https://schema.org/`,
    '@type': `Person`,
    name: author,
    url: url,
    image: shareImage
      ? {
          '@type': `ImageObject`,
          url: shareImage,
          width: shareImageWidth,
          height: shareImageHeight,
        }
      : undefined,
    mainEntityOfPage: {
      '@type': `WebPage`,
      '@id': siteUrl,
    },
    description,
  }
}