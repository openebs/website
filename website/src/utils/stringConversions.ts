const toLowerCaseHyphenSeparatedString = (text: string) => {
    return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

const replaceHyphenWithSpace = (text: string) => {
    return text.replace("-", ' ');
}

const capitalizeTextTransform = (text: string) => {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export {toLowerCaseHyphenSeparatedString, replaceHyphenWithSpace, capitalizeTextTransform};