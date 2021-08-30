import { WORDS_PER_MINUTE } from '../constants';

const readingTime = (content:string) => {
  const words = content.trim().split(/\s+/).length; // calculate total number of words (length) by splitting at each whitespace
  return Math.ceil(words / WORDS_PER_MINUTE);
};

export default readingTime;
