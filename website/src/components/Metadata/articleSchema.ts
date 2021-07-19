import { Author, Image, SiteMetadata } from "./metadata.models";
interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image: Image;
  author?: Author;
  tags?: [string];
  site: SiteMetadata;
}

export const articleSchema = ({ title, description, url, image, author, tags, site }: ArticleSchemaProps) => {
  return {
    '@context': `https://schema.org/`,
    '@type': `Article`,
    author: {
      '@type': `Person`,
      name: author?.name,
      image: author?.image ? author?.image : undefined,
    },
    keywords: tags?.length ? tags?.join(`, `) : undefined,
    headline: title,
    url: url,
    image: image.src
      ? {
        '@type': `ImageObject`,
        url: image.src,
        width: image.shareImageWidth,
        height: image.shareImageHeight,
      }
      : undefined,
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
    description: description,
    mainEntityOfPage: {
      '@type': `WebPage`,
      '@id': site.siteUrl,
    },
  }
}
