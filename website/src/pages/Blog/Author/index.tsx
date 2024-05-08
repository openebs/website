import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Breadcrumbs,
  Container,
  Grid,
  Link,
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';
import Footer from '../../../components/Footer';
import { VIEW_PORT, METADATA_TYPES } from '../../../constants';
import Sponsor from '../../../components/Sponsor';
import getAvatar from '../../../utils/getAvatar';
import useViewport from '../../../hooks/viewportWidth';
import pageCount from '../../../utils/getPageCount';
import { useCurrentHost } from '../../../hooks/useCurrentHost';
import { Metadata } from '../../../components/Metadata';
import { useAuthorName } from '../../../hooks/extractBlogPath';
import BlogCard from '../../../components/BlogCard';
import ErrorPage from '../../ErrorPage';
import toLowerCaseHyphenSeparatedString from '../../../utils/stringConversions';

interface BlogItem {
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
  const [authorMetadata, setAuthorMetadata] = useState<AuthorMetadata | null>(null);
  const [authorBlogsData, setAuthorBlogData] = useState<BlogItem[]>([
    {
      title: '',
      author: '',
      excerpt: '',
      author_info: '',
      date: '',
      tags: [],
      content: '',
      id: 0,
      slug: '',
    },
  ]);
  const authorName = useAuthorName();
  const itemsPerPage = 6;
  const [page, setPage] = React.useState<number>(1);
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const history = useHistory();

  useEffect(() => {
    const fetchBlogs = async () => {
      const { default: blogs } = await import('../../../posts.json');
      const filteredBlogsByAuthorName = blogs.filter(
        (blog: BlogItem) => toLowerCaseHyphenSeparatedString(blog.author) === authorName,
      );
      setAuthorBlogData(filteredBlogsByAuthorName);
    };
    fetchBlogs();
  }, [authorName]);

  const pagination = () => (
    <Pagination
      count={
        pageCount(authorBlogsData)
        }
      page={page}
      onChange={(_event, val) => (val ? setPage(val) : setPage(1))}
      className={classes.pagination}
    />
  );

  useEffect(() => {
    if (authorBlogsData?.length && currentOrigin && authorName) {
      const { author, author_info } = authorBlogsData[0]!;
      const image = `${currentOrigin}/images/blog/authors/${getAvatar(authorBlogsData[0]?.author)}.png`;
      const url = `${currentOrigin}/blog/author/${authorName}`;
      setAuthorMetadata({
        author, author_info, image, url,
      });
    }
  }, [authorBlogsData, currentOrigin, authorName]);

  return (
    <>
      { authorMetadata && (
      <Metadata title={authorMetadata?.author} description={authorMetadata?.author_info} url={authorMetadata?.url} image={authorMetadata?.image} isPost={false} type={METADATA_TYPES.SERIES} />
      )}
      { authorBlogsData && (
      <>
        <div className={classes.root}>
          <Container className={classes.sectionDiv}>
            {(width > mobileBreakpoint && authorBlogsData.length > 0)
                && (
                <Breadcrumbs aria-label="breadcrumb" className={classes.breadCrumbs}>
                  <Link color="inherit" href="/blog">
                    {t('blog.blog')}
                  </Link>
                  <Link color="inherit" href={`/blog/author/${authorName}`}>
                    {authorBlogsData[0]?.author}
                  </Link>
                </Breadcrumbs>
                )}
            <div className={classes.authorWrapper}>
              <Avatar
                alt={authorBlogsData[0]?.author}
                src={`/images/blog/authors/${getAvatar(authorBlogsData[0]?.author)}.png`}
                className={classes.large}
              />
              <div>
                <h1 className={classes.authorText}>{authorBlogsData[0]?.author || authorName}</h1>
                <p className={classes.authorDesc}>{authorBlogsData[0]?.author_info}</p>
              </div>
            </div>
          </Container>
        </div>
        <div className={classes.sectionDiv}>
          {authorBlogsData.length
            ? (
              <>
                <Grid
                  container
                  direction="row"
                  className={classes.blogsWrapper}
                >
                  {authorBlogsData
                    ? authorBlogsData
                      .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                      .map((elm: any) => (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          key={elm.id}
                          className={classes.cardSize}
                        >
                          <BlogCard blog={elm} handleTagSelect={(tag: string) => history.push(`/blog/tag/${toLowerCaseHyphenSeparatedString(tag)}`)} />
                        </Grid>
                      ))
                    : ' '}
                </Grid>
                {pagination()}
              </>
            )
            : <ErrorPage blogStatus />}
        </div>
      </>
      )}
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
