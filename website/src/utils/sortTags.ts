/**
 * 
 * @param tagsDistribution contains the tag list with number of occurrences
 * @param sortBy can have two values name | count; default set as name
 * @returns tags
 * 
 * ex : getTagsSorted(tagsDistribution,"count");
 * for this function call the tags will be returned in sorted by count order
 */

const getTagsSorted = (tagsDistribution: any, sortBy: "name" | "count" = "name") => {
  let tags = tagsDistribution;
  tags =
    sortBy === "name"
      ? Object.keys(tagsDistribution).sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        })
      : Object.keys(tagsDistribution).sort(function (a, b) {
          return tagsDistribution[b] - tagsDistribution[a];
        });
  return tags;
};

export { getTagsSorted };
