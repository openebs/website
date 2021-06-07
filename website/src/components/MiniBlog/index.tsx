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
import Slider from "react-slick";
import DisplayTagandReadTime from "../DisplayTagandReadTime";

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

  const fetchBlogs = async () => {
    const { default: blogs } = await import(`../../posts.json`);
    setJsonMdData(blogs);
  };

  useEffect(() => {
    fetchBlogs();
  });

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

 const totalBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs
  ).length;
  const chaosBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags.indexOf(BLOG_KEYWORDS.CHAOS_ENGINEERING) > -1).length;
  const openebsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags.indexOf(BLOG_KEYWORDS.OPENEBS) > -1).length;

  const devopsBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags.indexOf(BLOG_KEYWORDS.DEVOPS) > -1).length;

  const tutorialBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags.indexOf(BLOG_KEYWORDS.TUTORIALS) > -1).length;

  const solutionBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.tags.indexOf(BLOG_KEYWORDS.SOLUTIONS) > -1).length;

  const filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== "all") {
      return tabs.tags === value;
    }
    return tabs;
  });

  return (
    <>
      <span className={classes.root}>
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
      </span>
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
                  slidesToScroll: 1,
                },
              },
            ]}
          >
            {filteredData.map((elm: any) => {
              return (
                <Card key={elm.id} className={classes.cardRoot}>
                  <CardMedia
                    className={classes.media}
                    image={`/Images/blog/${elm.slug}.png`}
                  />
                  <CardContent>
                    <DisplayTagandReadTime
                      tags={elm.tags}
                      readTime={elm.content}
                    />
                    <Typography
                      component={"span"}
                      className={classes.title}
                      color="textSecondary"
                      gutterBottom
                    >
                      <ReactMarkdown children={elm.title} />
                    </Typography>
                    <span>
                      <ReactMarkdown
                        children={elm.content.substring(0, 200).replace(/[\n]/g, ". ").replace(/[^a-zA-Z ]/g, "") + "..."}
                      />
                      <Button
                        size="small"
                        disableRipple
                        variant="text"
                        className={classes.cardActionButton}
                        onClick={() =>
                          window.location.assign(
                            `/blog/${elm.slug}`
                          )
                        }
                      >
                        {t("blog.readMore")}
                      </Button>
                    </span>
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
