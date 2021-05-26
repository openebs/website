import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
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
import ReactMarkdown from "react-markdown";
import { BLOG_KEYWORDS, VIEW_PORT } from "../../constants";
import index from "../../blogs/index.md";
import CustomTag from "../CustomTag";
import Slider from "react-slick";

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

const MiniBlog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [jsonMdData, setJsonMdData] = useState<any>();
  const [value, setValue] = React.useState("all");
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  const SampleNextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <img
          src="../Images/svg/right_arrow.svg"
          alt={t("home.adaptorsTestimonials.nextArrowAlt")}
        />
      </div>
    );
  };

  const SamplePrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <img
          src="../Images/svg/left_arrow.svg"
          alt={t("home.adaptorsTestimonials.previousArrowAlt")}
        />
      </div>
    );
  };

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
          <h1 className={classes.mainText}>{t("blog.title")}</h1>
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
      <Grid container justify="center">
        <Grid item xs={10}>
          <Slider
            dots={false}
            autoplay={true}
            autoplaySpeed={4000}
            speed={500}
            slidesToShow={2}
            slidesToScroll={1}
            cssEase="linear"
            arrows={true}
            rtl={false}
            prevArrow={<SamplePrevArrow />}
            nextArrow={<SampleNextArrow />}
            responsive={[
              {
                breakpoint: mobileBreakpoint,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
                }
              }
            ]}
          >
            {filteredData.map((elm: any) => {
              return (
                <Card key={elm.id} className={classes.cardRoot}>
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
                      <Button
                        size="small"
                        disableRipple
                        variant="text"
                        className={classes.cardActionButton}
                        onClick={() =>
                          window.location.assign(
                            `/blog/${elm.author}/${elm.blog}`
                          )
                        }
                      >
                        {t("blog.readMore")}
                      </Button>
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Slider>
        </Grid>
      </Grid>
    </>
  );
};
export default MiniBlog;
