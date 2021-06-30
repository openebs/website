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
import { VIEW_PORT } from "../../constants";
import Sponsor from "../../components/Sponsor";
import Pagination from "@material-ui/lab/Pagination";
import DisplayAuthorandReadTime from "../../components/DisplayAuthorandReadTime";
import CustomTag from "../../components/CustomTag";
import { getAvatar } from "../../utils/getAvatar";
import { getContentPreview } from "../../utils/getContent";
import { useViewport } from "../../hooks/viewportWidth";

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

  const handleTagSelect = (tags: any) => {
    setValue(tags);
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
      count={
        filteredData
          ? Math.ceil(filteredData.length / 6 )
          : 0
      }
      page={page}
      onChange={(_event, val) => val? setPage(val) : setPage(1)}
      className={classes.pagination}
    />
    );
  };

  const getTagsMarkup = Object.keys(tagsDistribution).map((item: string) => 
          <StyledTab
            label={`${item}(${tagsDistribution[item as keyof typeof tagsDistribution]})`}
            value={item}
            key = {item}
          />
  );
  return (
    <>
      {!queryAuthorName ? (
        <>
          <div className={classes.root}>
            <Container maxWidth="lg">
              <h1 className={classes.mainText}>{t("blog.title")}</h1>
              <Paper className={classes.tabs}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  variant="scrollable"
                  classes={{ 
                    root: classes.tabRoot, scroller: classes.scroller }}
                  TabIndicatorProps={{
                    style: {
                      display: "none",
                    },
                  }}
                  orientation={mediumViewport ? "horizontal" : "vertical"}
                >
                  <StyledTab
                    label={"All(" + totalBlogCount + ")"}
                    value={t("blog.all")}
                  />
                  {getTagsMarkup}
                </Tabs>
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
                              image={`/images/blog/${elm.slug}.png`}
                            />
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
                                onClick={() =>
                                  window.location.assign(`/blog/${elm.slug}`)
                                }
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
                                onClick={() =>
                                  window.location.assign(`/blog/${elm.slug}`)
                                }
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
                              image={`/images/blog/${elm.slug}.png`}
                            />
                            <CardContent classes={{root: classes.cardRoot}}>
                              <DisplayAuthorandReadTime
                                author={elm.author}
                                readTime={elm.content}
                              />
                              <span
                                className={classes.title}
                                color="textPrimary"
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
                                onClick={() =>
                                  window.location.assign(
                                    `/blog/${queryAuthorName}/${elm.blog}`
                                  )
                                }
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
