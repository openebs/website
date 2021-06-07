// Util function for fetcing the author's avatar image
const getAvatar = (author: string) => {
    const authorAvatar = `../Images/blog/authors/${author
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-")}.png`; 
    return authorAvatar;
};

export {getAvatar};
