import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  createStyles,
  Grid,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
  withStyles,
} from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import { BLOG_KEYWORDS, VIEW_PORT } from "../../constants";
import Sponsor from "../../components/Sponsor";
import CustomTag from "../../components/CustomTag";
import Pagination from "@material-ui/lab/Pagination";

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
  tags: string;
  author: string;
  length: number;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [jsonMdData, setJsonMdData] = useState<any>("");
  const [value, setValue] = React.useState("all");
  const params = new URLSearchParams(window.location.search);
  const queryAuthorName = params.get("author");
  const queryTitleName = params.get("title");
  const queryTagName = params.get("tags");
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const itemsPerPage = 6;
  const [page, setPage] = React.useState<number>(1);

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

  const fetchBlogs = async() => {
    const {default: blogs} = await import(`../../posts.json`);
    setJsonMdData(blogs);
  }

  useEffect(() => {
    fetchBlogs();
  });

  const filteredAuthorData = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.author === queryAuthorName
  );

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  // functions to get the blog count for each individual tags
  const totalBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs
  ).length;
  const chaosBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags === BLOG_KEYWORDS.CHAOS_ENGINEERING
  ).length;
  const openebsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags === BLOG_KEYWORDS.OPENEBS
  ).length;
  const devopsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags === BLOG_KEYWORDS.DEVOPS
  ).length;
  const tutorialBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags === BLOG_KEYWORDS.TUTORIALS
  ).length;
  const solutionBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags === BLOG_KEYWORDS.SOLUTIONS
  ).length;

  const filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== "all") {
      return tabs.tags === value;
    }
    return tabs;
  });

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
                  className={classes.tabLayout}
                  TabIndicatorProps={{
                    style: {
                      display: "none",
                    },
                  }}
                  orientation={mobileBreakpoint ? "horizontal" : "vertical"}
                >
                  <StyledTab
                    label={"All(" + totalBlogCount + ")"}
                    value={t("blog.all")}
                  />
                  <StyledTab
                    label={"Chaos Engineering(" + chaosBlogCount + ")"}
                    value={t("blog.chaosengineering")}
                  />
                  <StyledTab
                    label={"DevOps(" + devopsBlogCount + ")"}
                    value={t("blog.devops")}
                  />
                  <StyledTab
                    label={"OpenEBS(" + openebsBlogCount + ")"}
                    value={t("blog.openebs")}
                  />
                  <StyledTab
                    label={"Solutions(" + solutionBlogCount + ")"}
                    value={t("blog.solutions")}
                  />
                  <StyledTab
                    label={"Tutorials(" + tutorialBlogCount + ")"}
                    value={t("blog.tutorials")}
                  />
                </Tabs>
              </Paper>
            </Container>
          </div>
          <div className={classes.cardWrapper}>
            <h1>{t("blog.articles")}</h1>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
            >
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
                          <Card className={classes.cardRoot}>
                            <CardMedia
                              className={classes.media}
                              image={`/blog/images/${elm.slug}.png`}
                            />
                            <CardContent>
                              <CustomTag blogLabel={elm.tags} />
                              <Typography
                                component={"span"}
                                variant={"body2"}
                                className={classes.title}
                                color="textSecondary"
                                gutterBottom
                              >
                                <ReactMarkdown children={elm.title} />
                              </Typography>
                              <Typography component={"span"} variant={"body2"}>
                                <ReactMarkdown
                                  children={
                                    elm.content.substring(0, 200) + "..."
                                  }
                                />
                              </Typography>
                            </CardContent>
                            <CardActions className={classes.actionWrapper}>
                              <span className={classes.author}>
                                <Avatar
                                  alt="author1"
                                  src={`/blog/authors/${elm.author}.png`}
                                  className={classes.small}
                                />
                                <Button
                                  size="large"
                                  disableRipple
                                  variant="text"
                                  className={classes.cardActionButton}
                                  onClick={() =>
                                    window.location.assign(
                                      `/blog/?tags=${elm.tags}&title=${elm.title}&author=${elm.author}`
                                    )
                                  }
                                >
                                  <Typography
                                    component={"span"}
                                    variant={"body2"}
                                  >
                                    {elm.author}
                                  </Typography>
                                </Button>
                              </span>
                              <Button
                                size="large"
                                disableRipple
                                variant="text"
                                className={classes.cardActionButton}
                                onClick={() =>
                                  window.location.assign(`/blog/${elm.blog}`)
                                }
                              >
                                {t("blog.read")}
                                <img
                                  src="../Images/svg/arrow_orange.svg"
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
            <Pagination
              count={
                totalBlogCount > 6
                  ? Math.ceil(totalBlogCount / 6 + 1)
                  : Math.ceil(totalBlogCount / 6)
              }
              page={page}
              onChange={(_event, val) => setPage(val)}
              shape="rounded"
              className={classes.pagination}
            />
          </div>
        </>
      ) : (
        <>
          <div className={classes.root}>
            <Container maxWidth="md">
              <p
                className={classes.authorURL}
              >{`/blog/${queryTagName}/${queryTitleName}/${queryAuthorName}`}</p>
              <div className={classes.authorWrapper}>
                <Avatar
                  alt={queryAuthorName ? queryAuthorName : ""}
                  src={`/blog/authors/${
                    filteredAuthorData[0] ? filteredAuthorData[0].author : ""
                  }.png`}
                  className={classes.large}
                />
                <h1 className={classes.authorText}>{queryAuthorName}</h1>
              </div>
              <p className={classes.authorDesc}>
                {filteredAuthorData[0] ? filteredAuthorData[0].author_info : ""}
              </p>
            </Container>
          </div>
          <div className={classes.cardWrapper}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
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
                          <Card className={classes.cardRoot}>
                            <CardMedia
                              className={classes.media}
                              image={`/blog/images/${elm.slug}.png`}
                            />
                            <CardContent>
                              <CustomTag blogLabel={elm.tags} />
                              <span
                                className={classes.title}
                                color="textSecondary"
                              >
                                <ReactMarkdown children={elm.title} />
                              </span>
                              <span>
                                <ReactMarkdown
                                  children={
                                    elm.content.substring(0, 200) + "..."
                                  }
                                />
                              </span>
                            </CardContent>
                            <CardActions className={classes.actionWrapper}>
                              <span className={classes.author}>
                                <Avatar
                                  alt={elm.author}
                                  src={`/blog/authors/${elm.author}.png`}
                                  className={classes.small}
                                />
                                <Typography
                                  component={"span"}
                                  variant={"body2"}
                                >
                                  {elm.author}
                                </Typography>
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
                                  src="../Images/svg/arrow_orange.svg"
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
            <Pagination
              count={
                filteredAuthorData.length > 6
                  ? Math.ceil(filteredAuthorData.length / 6 + 1)
                  : Math.ceil(filteredAuthorData.length / 6)
              }
              page={page}
              onChange={(_event, val) => setPage(val)}
              shape="rounded"
              className={classes.pagination}
            />
          </div>
        </>
      )}
      {/* Sponsor section  */}
      <Sponsor />
      {/* Display footer */}
      <footer className={classes.footer}>
        <Footer />
      </footer>
    </>
  );
};
export default Blog;
