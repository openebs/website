interface ArticleSchemaProps {
    authorName: string;
    authorImage: string;
    tags: [string];
    title: string;
    description: string;
    url: string;
    image: string;
    shareImageWidth: string;
    shareImageHeight: string;
    logo: string;
    siteUrl: string;
}
export const articleSchema = ({ authorName, authorImage, tags, title, description, url, image, shareImageWidth, shareImageHeight, logo, siteUrl }: ArticleSchemaProps) => {
    return {
        '@context': `https://schema.org/`,
        '@type': `Article`,
        author: {
          '@type': `Person`,
          name: authorName,
          image: authorImage ? authorImage : undefined,
        },
        keywords: tags.length ? tags.join(`, `) : undefined,
        headline: title,
        url: url,
        image: image
          ? {
              '@type': `ImageObject`,
              url: image,
              width: shareImageWidth,
              height: shareImageHeight,
            }
          : undefined,
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
        description: description,
        mainEntityOfPage: {
          '@type': `WebPage`,
          '@id': siteUrl,
        },
      }
    
}

