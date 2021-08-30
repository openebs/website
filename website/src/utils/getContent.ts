// Util function for fetching the blog description preview content
const getContentPreview = (excerpt: string) => {
  const excerptContent = excerpt.length > 200 ? `${excerpt.substring(0, 200).replace(/[\n]/g, '. ').replace(/[^a-zA-Z ]/g, '')}...` : excerpt;
  return excerptContent;
};

export default getContentPreview;
