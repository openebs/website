const toLowerCaseHyphenSeparatedString = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export default toLowerCaseHyphenSeparatedString;
