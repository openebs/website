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
import index from "../../blogs/index.md";
import CustomTag from "../../components/CustomTag";
import Pagination from "@material-ui/lab/Pagination";
import listReactFiles from 'list-react-files';

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
  tag: string;
  author: string;
  length: number;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [jsonMdData, setJsonMdData] = useState<any>();
  const [value, setValue] = React.useState("all");
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

  useEffect(() => {
    // require('list-react-files')(__dirname).then((file: any) => console.log(file, '--------------'));
    listReactFiles(__dirname).then((files: any) => console.log(files));
    async function fetchBlogs() {
      const indexBlog: any = index;
      await fetch(indexBlog)
        .then((response) => {
          if (response.ok) return response.text();
          else return Promise.reject("could't fetch text correctly");
        })
        .then((text) => {
          const tb = require("mdtable2json").getTables(text);
          setJsonMdData(tb[0].json);
        })
        .catch((err) => console.error(err));
    }
    fetchBlogs();
  }, []);

  console.log(jsonMdData);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  var totalBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs
  ).length;
  var chaosBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tag === BLOG_KEYWORDS.CHOAS_ENGINEERING
  ).length;
  var openebsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tag === BLOG_KEYWORDS.OPENEBS
  ).length;
  var devopsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tag === BLOG_KEYWORDS.DEVOPS
  ).length;
  var tutorialBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tag === BLOG_KEYWORDS.TUTORIALS
  ).length;
  var solutionBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tag === BLOG_KEYWORDS.SOLUTIONS
  ).length;

  var filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== "all") {
      return tabs.tag === value;
    }
    return tabs;
  });

  return (
    <>
      <div className={classes.root}>
        <Container maxWidth="lg">
          <h1 className={classes.mainText}>
            Community contributed guides and blogs
          </h1>
          <Paper className={classes.tabs}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="secondary"
              variant="standard"
              className={classes.tabLayout}
              TabIndicatorProps={{
                style: {
                  display: "none",
                },
              }}
              orientation={mobileBreakpoint ? "horizontal" : "vertical"}
              centered
            >
              <StyledTab label={"All(" + totalBlogCount + ")"} value="all" />
              <StyledTab
                label={"Chaos Engineering(" + chaosBlogCount + ")"}
                value="chaosengineering"
              />
              <StyledTab
                label={"DevOps(" + devopsBlogCount + ")"}
                value="devops"
              />
              <StyledTab
                label={"OpenEBS(" + openebsBlogCount + ")"}
                value="openebs"
              />
              <StyledTab
                label={"Solutions(" + solutionBlogCount + ")"}
                value="solutions"
              />
              <StyledTab
                label={"Tutorials(" + tutorialBlogCount + ")"}
                value="tutorials"
              />
            </Tabs>
          </Paper>
        </Container>
      </div>
      <div className={classes.cardWrapper}>
        <h1>All articles</h1>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          {filteredData
            ? filteredData.map((elm: any) => {
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
                        image={`/blog/images/${elm.image}`}
                      />
                      <CardContent>
                        <CustomTag blogLabel={elm.tag} />
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          <ReactMarkdown children={elm.title} />
                        </Typography>
                        <Typography>
                          <ReactMarkdown children={elm.description + "..."} />
                        </Typography>
                      </CardContent>
                      <CardActions className={classes.actionWrapper}>
                        <span className={classes.author}>
                          <Avatar
                            alt="author1"
                            src={`/blog/authors/${elm.avatar}`}
                            className={classes.small}
                          />
                          <Button
                            size="large"
                            disableRipple
                            variant="text"
                            className={classes.cardActionButton}
                            onClick={() =>
                              window.location.assign(
                                `/blog/${elm.author}`
                              )
                            }
                          >
                            <Typography>{elm.author}</Typography>
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
                          Read
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
        <Pagination count={10} shape="rounded" />
      </div>
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
