const path = require('path');
const fs = require('fs');

const dirPath = path.join(__dirname, '../src/blogs');
let postList;
const getPosts = () => {
    postList = [];
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error('Failed to load files from the directory' + err);
        }
        files.forEach((file, index) => {
            let obj = {};
            let post;
            fs.readFile(`${dirPath}/${file}`, 'utf8', (err, contents) => {
                const getMetaDataIndices = (acc, elem, i) => {
                    if (/^---/.test(elem)) {
                        acc.push(i);
                    }
                    return acc;
                }
                const parseMetaData = ({ lines, metaDataIndices }) => {
                    if (metaDataIndices.length) {
                        let metadata = lines.slice(metaDataIndices[0] + 1, metaDataIndices[1]);
                        metadata.forEach((line) => {
                            obj[line.split(': ')[0]] = line.split(': ')[1];
                        });
                        return obj;
                    }
                }

                const parseContent = ({ lines, metaDataIndices }) => {
                    if (metaDataIndices.length) {
                        lines = lines.slice(metaDataIndices[1] + 1, lines.length);
                    }
                    return lines.join('\n');
                }
                const sortAccrodingtoDate = (jsonObj) => {
                    const dmyOrdD = (a, b) => { return myDate(b.date) - myDate(a.date); }
                    const myDate = (s) => { var a = s.split(/-|\//); return new Date(a[2], a[1] - 1, a[0]); }
                    return jsonObj.sort(dmyOrdD);
                }
                
                const convertTitleToSlug = (Text)=>{
                    return Text
                        .toLowerCase()
                        .replace(/[^\w ]+/g,'')
                        .replace(/ +/g,'-')
                        ;
                }

                const lines = contents.split('\n');
                const metaDataIndices = lines.reduce(getMetaDataIndices, []);
                const metadata = parseMetaData({ lines, metaDataIndices });
                const content = parseContent({ lines, metaDataIndices });
                
                if (metadata){
                    post = {
                        id: index + 1,
                        title: metadata.title || 'No title',
                        author: metadata.author || 'No author',
                        author_info: metadata.author_info || 'No author information',
                        date: metadata.date || 'No date available',
                        tags: metadata.tags.split(',').map(e => e.trim()) || 'No tags available',
                        excerpt: metadata.excerpt || '',
                        content: content || 'No content available', 
                        notHasFeatureImage: metadata.not_has_feature_image 
                    };
                }
                

                postList.push(post);
                if (postList.length === files.length) {
                    let sortedJSON = sortAccrodingtoDate(postList);
                    let sortedJSONWithID = sortedJSON.map(item => ({...item, id: sortedJSON.indexOf(item) + 1, slug: convertTitleToSlug(item.title)}))
                    let data = JSON.stringify(sortedJSONWithID);
                    fs.writeFileSync('src/posts.json', data);
                }

            })
        })
    })
}

getPosts();