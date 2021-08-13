const toLowerCaseHyphenSeparatedString = (text: string) => {
    return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

export {toLowerCaseHyphenSeparatedString};