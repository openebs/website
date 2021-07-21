import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  createStyles,
  Grid,
  Link,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
  withStyles,
} from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import { BLOG_TAGS, VIEW_PORT } from "../../constants";
import Sponsor from "../../components/Sponsor";
import Pagination from "@material-ui/lab/Pagination";
import DisplayAuthorandReadTime from "../../components/DisplayAuthorandReadTime";
import CustomTag from "../../components/CustomTag";
import { getAvatar } from "../../utils/getAvatar";
import { getContentPreview } from "../../utils/getContent";
import { useViewport } from "../../hooks/viewportWidth";
import { pageCount } from "../../utils/getPageCount";
import { useHistory } from "react-router-dom";
import BlogImage from "../../components/BlogImage";
import { getTagsSorted } from "../../utils/sortTags";
import SeoJson from "../../resources/seo.json";
import { currentOrigin } from "../../utils/currentHost";
import { Metadata } from "../../components/Metadata";
import ErrorPage from "../ErrorPage";

interface StyledTabProps {
  label: string;
  value: string;
}

interface TabProps {
  id: string;
  title: string;
  blog: string;
  description: string;
  image: string;
  tags: Array<string>;
  author: string;
  length: number;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [jsonMdData, setJsonMdData] = useState<any>("");
  const [value, setValue] = React.useState("all");
  const [tagsDistribution, setTagsDistribution] = useState({});
  const params = new URLSearchParams(window.location.search);
  const queryAuthorName = params.get("author");
  const mediumViewport = useMediaQuery(
    `(min-width:${VIEW_PORT.MOBILE_BREAKPOINT}px)`
  );
  const itemsPerPage = 6;
  const [page, setPage] = React.useState<number>(1);
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const history = useHistory();
  const StyledTab = withStyles((theme: Theme) =>
    createStyles({
      root: {
        textTransform: "none",
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightBold,
        fontSize: "16px",
        opacity: 1,
        marginRight: theme.spacing(1),
        "&:focus": {
          opacity: 1,
          color: theme.palette.warning.dark,
        },
        "&:active": {
          opacity: 1,
          color: theme.palette.warning.dark,
        },
      },
    })
  )((props: StyledTabProps) => <Tab disableRipple {...props} />);

  const fetchBlogs = async () => {
    const { default: blogs } = await import(`../../posts.json`);
    setJsonMdData(blogs);
  };

  const handleRedirectPath = (slug: string) => {
    history.push(`/blog/${slug}`);
  };

  useEffect(() => {
    fetchBlogs();
  });

  const filteredAuthorData = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.author === queryAuthorName
  );

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
    setPage(1);
  };
  // functions to get the blog count for each individual tags
  const totalBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs
  ).length;

  const handleTagSelect = (tag: string) => {
    setValue(tag);
    setPage(1);
  };

  const getTags = (tags: any) => {
    return tags.map((tag: any) => (
      <button
        key={tag}
        onClick={() => handleTagSelect(tag)}
        className={classes.rightSpacing}
      >
        <CustomTag blogLabel={tag} key={tag} />
      </button>
    ));
  };

  const filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== "all") {
      const tagData = tabs.tags.find((el: any) => el === value);
      return tagData === value;
    }
    return tabs;
  });
  useEffect(() => {
    let tagsArray: Array<string> = [];
    if (jsonMdData.constructor === Array) { // this check is necessary to avoid parsing errors on JSON data
      for (let i = 0; i < jsonMdData.length; i++) {
        tagsArray = [...tagsArray, ...jsonMdData[i].tags];
      }
      setTagsDistribution(tagsArray.reduce((acum: any,cur: string) => Object.assign(acum,{[cur]: (acum[cur] || 0)+1}),{}));
    }
  }, [jsonMdData]);

  const pagination = () => {
    return (
      <Pagination
      count={ queryAuthorName ?
       pageCount(filteredAuthorData) : pageCount(filteredData)
      }
      page={page}
      onChange={(_event, val) => val? setPage(val) : setPage(1)}
      className={classes.pagination}
    />
    );
  };
  const sortedTags = getTagsSorted(tagsDistribution);
  const tagsMarkup = sortedTags.map((item: string) => {
    if (tagsDistribution[item as keyof typeof tagsDistribution] > 1) {
      // If medium view port display StyledTab of material-ui else display grid for custom tabs to match Figma design
      return (
        mediumViewport ? 
          <StyledTab
            label={`${item} (${tagsDistribution[item as keyof typeof tagsDistribution]})`}
            value={item}
            key = {item}
          />
          :
          <Grid item xs={6} key={item}>
            <Button 
              className={[classes.tabButton, (value === item) ? classes.activeTabButton : ''].join(' ')} 
              onClick={() => handleTagSelect(item)}>
              {item} 
              <span className={(value !== item) ? classes.tagCount : ''}>
                  ({tagsDistribution[item as keyof typeof tagsDistribution]})
              </span>
            </Button>
          </Grid>
      );
    }
    return null;
  });

  return (
    <>
     <Metadata title={SeoJson.pages.blog.title} description={SeoJson.pages.blog.description} url={`${currentOrigin}${SeoJson.pages.blog.url}`} image={`${currentOrigin}${SeoJson.pages.blog.image}`} isPost={false} type="Series"  />
      {!queryAuthorName ? (
        <>
          <div className={classes.root}>
            <Container maxWidth="lg">
              <h1 className={classes.mainText}>{t("blog.title")}</h1>
              <Paper className={classes.tabs}>
                {mediumViewport ?
                <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                classes={{ 
                  root: classes.tabRoot, scroller: classes.scroller }}
                TabIndicatorProps={{
                  style: {
                    display: "none",
                  },
                }}
                orientation="horizontal"
              >
                <StyledTab
                  label={`${t('blog.all')} (${totalBlogCount})`}
                  value={BLOG_TAGS.ALL}
                />
                {tagsMarkup}
              </Tabs>
              :
              <Grid container className={classes.mobileTabsWrapper}>
                  <Grid item xs={6}>
                      <Button 
                        className={[classes.tabButton, (value === BLOG_TAGS.ALL) ? classes.activeTabButton : ''].join(' ')} 
                        onClick={() => handleTagSelect(BLOG_TAGS.ALL)}>
                        {t('blog.all')} 
                        <span className={(value !== BLOG_TAGS.ALL) ? classes.tagCount : ''}>({totalBlogCount})</span>
                      </Button>
                  </Grid>
                  {tagsMarkup}
              </Grid>
            }    
              </Paper>
            </Container>
          </div>
          <div className={classes.sectionDiv}>
            <h1 className={classes.blogTitle}>{t("blog.articles")}</h1>
            <Grid container direction="row" className={classes.blogsWrapper} >
              {filteredData
                ? filteredData
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
                          <Card className={classes.card}>
                            <CardMedia
                              className={classes.media}
                              onClick={() => handleRedirectPath(elm.slug)}
                            >
                              <BlogImage imgPath={`/images/blog/${elm.slug}.png`} alt={elm.title} />
                            </CardMedia>
                            <CardContent classes={{root: classes.cardRoot}}>
                              <DisplayAuthorandReadTime
                                author={elm.author}
                                readTime={elm.content}
                              />
                              <Typography
                                component={"span"}
                                variant={"body2"}
                                className={classes.title}
                                color="textPrimary"
                                gutterBottom
                                onClick={() => handleRedirectPath(elm.slug)}
                              >
                                <ReactMarkdown children={elm.title} />
                              </Typography>
                              <Typography component={"span"} variant={"body2"} className={classes.blogDescription}>
                                <ReactMarkdown
                                  children={getContentPreview(elm.excerpt)}
                                />
                              </Typography>
                            </CardContent>
                            <CardActions className={classes.actionWrapper} classes={{root: classes.cardRoot}}>
                              <span className={classes.tabWrapper}>
                                {getTags(elm.tags)}
                              </span>
                              <Button
                                size="large"
                                disableRipple
                                variant="text"
                                className={classes.cardActionButton}
                                onClick={() => handleRedirectPath(elm.slug)}
                              >
                                {t("blog.read")}
                                <img
                                  loading="lazy"
                                  src="../images/svg/arrow_orange.svg"
                                  alt={t("header.submitAlt")}
                                  className={classes.arrow}
                                />
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })
                : ""}
            </Grid>
            {pagination()}

          </div>
        </>
      ) : (
        <>
          <div className={classes.root}>
            <Container maxWidth="md">
              {(width > mobileBreakpoint) &&
                <Breadcrumbs aria-label="breadcrumb" className={classes.breadCrumbs}>
                  <Link color="inherit" href="/blog">
                    {t('blog.blog')}
                  </Link>
                  <Link color="inherit" href={`/blog/?author=${queryAuthorName}`}>
                      {queryAuthorName}
                  </Link>
                </Breadcrumbs>
              }
              <div className={classes.authorWrapper}>
                <Avatar
                  alt={queryAuthorName && queryAuthorName}
                  src={`../images/blog/authors/${getAvatar(queryAuthorName)}.png`}
                  className={classes.large}
                />
                <h1 className={classes.authorText}>{queryAuthorName}</h1>
              </div>
              <p className={classes.authorDesc}>
                {filteredAuthorData[0] ? filteredAuthorData[0].author_info : ""}
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
                          <Card className={classes.card}>
                            <CardMedia
                              className={classes.media}
                              onClick={() => handleRedirectPath(elm.slug)}
                            >
                               <BlogImage imgPath={`/images/blog/${elm.slug}.png`} alt={elm.title} />
                            </CardMedia>
                            <CardContent classes={{root: classes.cardRoot}}>
                              <DisplayAuthorandReadTime
                                author={elm.author}
                                readTime={elm.content}
                              />
                              <span
                                className={classes.title}
                                color="textPrimary"
                                onClick={() => handleRedirectPath(elm.slug)}
                              >
                                <ReactMarkdown children={elm.title} />
                              </span>
                              <span className={classes.blogDescription}>
                                <ReactMarkdown
                                  children={getContentPreview(elm.excerpt)}
                                />
                              </span>
                            </CardContent>
                            <CardActions className={classes.actionWrapper} classes={{root: classes.cardRoot}}>
                              <span className={classes.tabWrapper}>
                                {getTags(elm.tags)}
                              </span>
                              <Button
                                size="large"
                                disableRipple
                                variant="text"
                                className={classes.cardActionButton}
                                onClick={() => handleRedirectPath(elm.slug)}
                              >
                                {t("blog.read")}
                                <img
                                  loading="lazy"
                                  src="../images/svg/arrow_orange.svg"
                                  alt={t("header.submitAlt")}
                                  className={classes.arrow}
                                />
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })
                : " "}
            </Grid>
            {pagination()}
            </>:
            <ErrorPage blogStatus={true} />}
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
