// Function to get count of blog for each tag categories
const getCount = (blogData: any, value: any) => {
  return (blogData || []).filter((tab: any) => tab.tags.indexOf(value) > -1).length;
};

export default getCount;
