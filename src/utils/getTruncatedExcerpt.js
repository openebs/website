export const getTruncatedExcerpt = (excerpt) => {
  const words = excerpt.split(' ')
  let recreateExcerpt = ''
  for (let i = 0; i < words.length; i++) {
    recreateExcerpt = recreateExcerpt.concat(' ', words[i])
    if (recreateExcerpt.length >= 150 && recreateExcerpt.length < 170) {
      break
    }
  }
  return recreateExcerpt
}
