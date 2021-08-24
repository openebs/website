/**
 *
 * @param tagsDistribution contains the tag list with number of occurrences
 * @returns tags
 *
 * ex : getTagsSorted(tagsDistribution);
 * for this function call the tags will be returned in sorted by name of tag
 */

const getTagsSorted = (tagsDistribution: any) => Object.keys(tagsDistribution).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export default getTagsSorted;
