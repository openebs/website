import React from "react";
import Carousel from "../Carousel";
import { useTranslation } from "react-i18next";
import useStyles from "./style";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { VIEW_PORT } from "../../constants";
import CustomTag from "../CustomTag";
import ReactMarkdown from "react-markdown";
import { getContentPreview } from "../../utils/getContent";
import BlogImage from '../BlogImage';
import { useHistory } from "react-router-dom";
import { toLowerCaseHyphenSeparatedString } from "../../utils/stringConversions";

interface BlogsSliderProps {
  recommendedBlogs: any;
}

const BlogsSlider: React.FC<BlogsSliderProps> = ({ recommendedBlogs }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const history = useHistory();
  const handleRedirectPath = (slug: string) => {
    history.push(`/blog/${slug}`);
  };

  const sliderSettings = {
    dots: false,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    cssEase: "linear",
    arrows: true,
    rtl: false,
    responsive: [
      {
        breakpoint: mobileBreakpoint,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const getTags = (tags: Array<string>) => {
    const tagItems = tags.map((tag) => {
      return (
        <button
          key={tag}
          onClick={() => handleTagSelect(tag)}
          className={classes.tag}
        >
            <CustomTag blogLabel={tag} />
        </button>
      );
    });
    return tagItems;
  };

  const handleTagSelect = (tag: string) => {
    history.push(`/blog/tag/${toLowerCaseHyphenSeparatedString(tag)}`);
  };

  return (
    <>
      <div className={classes.sliderWrapper}>
        <Carousel settings={sliderSettings}>
          {recommendedBlogs.map((elm: any) => {
            return (
              <div key={elm.id}>
                <Card className={classes.cardRoot}>
                  <CardMedia
                    className={classes.media}
                    onClick={() => handleRedirectPath(elm.slug)}
                  >
                    <BlogImage imgPath={`/images/blog/${elm.slug}.png`} alt={elm.title} />
                  </CardMedia>
                  <CardContent className={classes.cardContent}>
                    <div className={classes.tagsWrapper}>
                      {getTags(elm.tags)}
                    </div>
                    <Typography
                      component={"span"}
                      className={classes.title}
                      color="textSecondary"
                      onClick={() => handleRedirectPath(elm.slug)}
                      gutterBottom
                    >
                      <ReactMarkdown children={elm.title} />
                    </Typography>
                    <span>
                      <ReactMarkdown
                        children={getContentPreview(elm.excerpt)}
                      />
                      <Button
                        size="small"
                        disableRipple
                        variant="text"
                        className={classes.cardActionButton}
                        onClick={() => handleRedirectPath(elm.slug)}
                      >
                        {t("blog.readMore")}
                      </Button>
                    </span>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </Carousel>
      </div>
    </>
  );
};
export default BlogsSlider;
