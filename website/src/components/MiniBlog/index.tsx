import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
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
import ReactMarkdown from "react-markdown";
import { VIEW_PORT } from "../../constants";
import Slider from "react-slick";
import DisplayAuthorandReadTime from "../DisplayAuthorandReadTime";
import CustomTag from "../CustomTag";
import { getContentPreview } from "../../utils/getContent";

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

const MiniBlog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [jsonMdData, setJsonMdData] = useState<any>();
  const [value, setValue] = React.useState("all");
  const [tagsDistribution, setTagsDistribution] = useState({});
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

  const handleTagSelect = (tags: string) => {
    setValue(tags);
  };

  const getTags = (tags: Array<string>) => {
    return tags.map((tag: string) => (
      <button
        key={tag}
        onClick={() => handleTagSelect(tag)}
        className={classes.rightSpacing}
      >
        <CustomTag blogLabel={tag} key={tag} />
      </button>
    ));
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

  const filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== "all") {
      const tagData = tabs.tags.find((el: string) => el === value);
      return tagData === value;
    }
    return tabs;
  });

  useEffect(() => {
    let tagsArray: Array<string> = [];
    if (jsonMdData && jsonMdData.constructor === Array) { // this check is necessary to avoid parsing errors on JSON data
      for (let i=0; i < jsonMdData.length; i++) {
        tagsArray = [...tagsArray, ...jsonMdData[i].tags];
      }
      setTagsDistribution(tagsArray.reduce((acum: any,cur: string) => Object.assign(acum,{[cur]: (acum[cur] || 0)+1}),{}));
    }
  }, [jsonMdData]);

  const getTagsMarkup = Object.keys(tagsDistribution).map((item: string) => 
          <StyledTab
            label={`${item}(${tagsDistribution[item as keyof typeof tagsDistribution]})`}
            value={item}
            key = {item}
          />
  );

  return (
    <>
      <span className={classes.root}>
        <Container maxWidth="lg">
          <h1 className={classes.mainText}>{t("blog.title")}</h1>
          <Paper className={classes.tabs}>
            <Tabs
              value={value}
              classes={{ 
                root: classes.tabRoot, scroller: classes.scroller }}
              onChange={handleChange}
              textColor="secondary"
              variant="scrollable"
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
              {getTagsMarkup}
            </Tabs>
          </Paper>
        </Container>
      </span>
      <Grid container justify="center">
        <Grid item xs={filteredData.length === 1 ? 5 : 10}>
          <Slider
            dots={false}
            autoplay={true}
            autoplaySpeed={4000}
            speed={500}
            slidesToShow={filteredData.length === 1 ? filteredData.length : 2}
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
                <div>
                  <Card key={elm.id} className={classes.cardRoot}>
                    <CardMedia
                      className={classes.media}
                      image={`/Images/blog/${elm.slug}.png`}
                    />
                    <CardContent>
                      <DisplayAuthorandReadTime
                        author={elm.author}
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
                        children={getContentPreview(elm.content)}
                        />
                      </span>
                    </CardContent>
                    <CardActions className={classes.actionWrapper}>
                      <span className={classes.tabWrapper}>
                        {getTags(elm.tags)}
                      </span>
                      <Button
                        size="small"
                        disableRipple
                        variant="text"
                        className={classes.cardActionButton}
                        onClick={() =>
                          window.location.assign(`/blog/${elm.slug}`)
                        }
                      >
                        {t("blog.readMore")}
                      </Button>
                    </CardActions>
                  </Card>
                </div>
              );
            })}
          </Slider>
        </Grid>
      </Grid>
    </>
  );
};
export default MiniBlog;
