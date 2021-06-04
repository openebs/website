import React from "react";
import Slider from "react-slick";
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

interface BlogsSliderProps {
  recommendedBlogs: any;
}

const BlogsSlider: React.FC<BlogsSliderProps> = ({recommendedBlogs}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  const SampleNextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display:"block" }}
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
        style={{ ...style, display:"block"}}
        onClick={onClick}
      >
        <img
          src="../Images/svg/left_arrow.svg"
          alt={t("home.adaptorsTestimonials.previousArrowAlt")}
        />
      </div>
    );
  };

const getTags = (tags: Array<string>) => {
    const tagItems = tags.map((tag) => <CustomTag blogLabel={tag} key = {tag}/>);
    return tagItems;
}

  return (
    <>
    <div className={classes.sliderWrapper}>
      <Slider dots={false}
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
            ]}>
      {recommendedBlogs.map(( elm: any ) => {
            return (  
              <Card key={elm.id} className={classes.cardRoot}>
              <CardMedia
                className={classes.media}
                image={`/Images/blog/${elm.slug}.png`}
              />
              <CardContent>
                <div className = {classes.tagsWrapper}>
                {getTags(elm.tags)}
                </div>
                <Typography
                  component={'span'} 
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                >
                  <ReactMarkdown children={elm.title} />
                </Typography>
                <span>
                  <ReactMarkdown children={elm.content.substring(0, 200) + "..."} />
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
      </div>
    </>
  );
};
export default BlogsSlider;