// Util function for fetching the blog description preview content
const getContentPreview = (content: string) => {
    const blogContent = content.substring(0, 200)
    .replace(/[\n]/g, ". ")
    .replace(/[^a-zA-Z ]/g, "") + "..."; 
    return blogContent;
};

export {getContentPreview};
