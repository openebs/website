/**
 *
 * @param tagsDistribution contains the tag list with number of occurrences
 * @returns tags
 *
 * ex : getTagsSorted(tagsDistribution);
 * for this function call the tags will be returned in sorted by name of tag
 */

const getTagsSorted = (tagsDistribution: any) => {
  return Object.keys(tagsDistribution).sort(function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
};

export { getTagsSorted };
