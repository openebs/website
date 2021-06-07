// Util function for fetcing the blog description content
const getContent = (content: string) => {
    const blogContent = content.substring(0, 200)
    .replace(/[\n]/g, ". ")
    .replace(/[^a-zA-Z ]/g, "") + "..."; 
    return blogContent;
};

export {getContent};
