export const githubProfile = function(id) {
    if (id.indexOf('(') > -1) {
        id = id.substring(id.lastIndexOf('(') + 1, id.lastIndexOf(')')).trim();
    }
    return {
        id,
        profile: `https://github.com/${id}`
    }
}