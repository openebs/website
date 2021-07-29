import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Breadcrumbs,
  Container,
  Grid,
  Link,
} from "@material-ui/core";
import Footer from "../../../components/Footer";
import { VIEW_PORT, METADATA_TYPES } from "../../../constants";
import Sponsor from "../../../components/Sponsor";
import { getAvatar } from "../../../utils/getAvatar";
import { useViewport } from "../../../hooks/viewportWidth";
import { pageCount } from "../../../utils/getPageCount";
import { useCurrentHost } from "../../../hooks/useCurrentHost";
import { Metadata } from "../../../components/Metadata";
import { useAuthorName } from "../../../hooks/extractBlogPath";
import { Pagination } from "@material-ui/lab";
import BlogCard from "../../../components/BlogCard";
import ErrorPage from "../../ErrorPage";

interface blog { 
  title: string;
  author: string;
  excerpt: string;
  author_info: string;
  date: string;
  tags: Array<string>;
  content: string;
  id: number;
  slug: string; 
}

interface AuthorMetadata {
  author: string;
  author_info: string;
  image: string;
  url: string;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentOrigin } = useCurrentHost();
  const [ authorMetadata, setAuthorMetadata ] = useState<AuthorMetadata | null>(null);
  const [jsonMdData, setJsonMdData] = useState<blog[]>([
    { title: "",
      author: "",
      excerpt: "",
      author_info: "",
      date: "",
      tags: [""],
      content: "",
      id: 0,
      slug: "" }
  ]);
  const authorName = useAuthorName();
  const itemsPerPage = 6;
  const [page, setPage] = React.useState<number>(1);
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  const fetchBlogs = async () => {
    const { default: blogs } = await import(`../../../posts.json`);
    setJsonMdData(blogs);
  };

  useEffect(() => {
    fetchBlogs();
  },[]);

  const filteredAuthorData = (jsonMdData || []).filter(
    (blog: blog) => blog.author.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-') === authorName
  );

  const pagination = () => {
    return (
      <Pagination
        count={
        pageCount(filteredAuthorData)
        }
        page={page}
        onChange={(_event, val) => val? setPage(val) : setPage(1)}
        className={classes.pagination}
      />
    );
  };

  useEffect(() => {
    if(filteredAuthorData.length && currentOrigin && authorName) {
      const authorData = filteredAuthorData.find(res => res.author.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-') === authorName);
      const { author, author_info } = authorData!;
      const image = `${currentOrigin}/images/blog/authors/${getAvatar(filteredAuthorData[0]?.author)}.png`;
      const url = `${currentOrigin}/blog/author/${authorName}`;
      setAuthorMetadata({ author, author_info, image, url });
    }
  }, [filteredAuthorData, currentOrigin, authorName]);

  return (
    <>
     { authorMetadata && (
       <Metadata title={authorMetadata?.author} description={authorMetadata?.author_info} url={authorMetadata?.url} image={authorMetadata?.image} isPost={false} type={METADATA_TYPES.SERIES}  />
       )}
        <>
          <div className={classes.root}>
            <Container maxWidth="md">
              {(width > mobileBreakpoint && filteredAuthorData.length > 0) &&
                <Breadcrumbs aria-label="breadcrumb" className={classes.breadCrumbs}>
                  <Link color="inherit" href="/blog">
                    {t('blog.blog')}
                  </Link>
                  <Link color="inherit" href={`/blog/author/${authorName}`}>
                      {filteredAuthorData[0]?.author}
                  </Link>
                </Breadcrumbs>
              }
              <div className={classes.authorWrapper}>
                <Avatar
                  alt={filteredAuthorData[0]?.author}
                  src={`/images/blog/authors/${getAvatar(filteredAuthorData[0]?.author)}.png`}
                  className={classes.large}
                />
                <h1 className={classes.authorText}>{filteredAuthorData[0]?.author || authorName}</h1>
              </div>
              <p className={classes.authorDesc}>
                {filteredAuthorData[0]?.author_info}
              </p>
            </Container>
          </div>
          <div className={classes.sectionDiv}>
          {filteredAuthorData.length ?
          <>
            <Grid
              container
              direction="row"
              className={classes.blogsWrapper}
            >
              {filteredAuthorData
                ? filteredAuthorData
                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                    .map((elm: any) => {
                      return (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          key={elm.id}
                          className={classes.cardSize}
                        >
                          <BlogCard isAuthorPage={true} blog={elm} handleTagSelect={() => {}}></BlogCard>
                        </Grid>
                      );
                    })
                : " "}
            </Grid>
            {pagination()}
            </>
            :
            <ErrorPage blogStatus={true} />}
          </div>
        </>
      <div className={classes.blogFooter}>
          {/* Sponsor section  */}
          <Sponsor />
          {/* Display footer */}
          <footer className={classes.footer}>
            <Footer />
          </footer>
      </div>
      
    </>
  );
};
export default Blog;
