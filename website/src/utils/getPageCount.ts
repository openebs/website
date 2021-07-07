// Function to get page count according the pageData 
const pageCount = (pageData: any) => {
    return pageData
    ? Math.ceil(pageData.length / 6 )
    : 0;
}

export {pageCount};