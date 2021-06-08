// Util function for fetching the author's avatar image
const getAvatar = (author: string) => {
    const getAuthorName = author.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    const authorAvatar = `../Images/blog/authors/${getAuthorName}.png`; 
    return authorAvatar;
};

export {getAvatar};
