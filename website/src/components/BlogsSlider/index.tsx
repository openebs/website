import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import { useHistory } from 'react-router-dom';
import Carousel from '../Carousel';
import useStyles from './style';
import { VIEW_PORT } from '../../constants';
import CustomTag from '../CustomTag';
import getContentPreview from '../../utils/getContent';
import BlogImage from '../BlogImage';
import toLowerCaseHyphenSeparatedString from '../../utils/stringConversions';

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
    cssEase: 'linear',
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

  const handleTagSelect = (tag: string) => {
    history.push(`/blog/tag/${toLowerCaseHyphenSeparatedString(tag)}`);
  };

  const getTags = (tags: Array<string>) => {
    const tagItems = tags.map((tag) => (
      <button
        type="button"
        key={tag}
        onClick={() => handleTagSelect(tag)}
        className={classes.tag}
      >
        <CustomTag blogLabel={tag} />
      </button>
    ));
    return tagItems;
  };

  return (
    <>
      <div className={classes.sliderWrapper}>
        <Carousel settings={sliderSettings}>
          {recommendedBlogs.map((elm: any) => (
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
                    component="span"
                    className={classes.title}
                    color="textSecondary"
                    onClick={() => handleRedirectPath(elm.slug)}
                    gutterBottom
                  >
                    <ReactMarkdown>
                      {elm.title}
                    </ReactMarkdown>
                  </Typography>
                  <span>
                    <ReactMarkdown>
                      {getContentPreview(elm.excerpt)}
                    </ReactMarkdown>
                    <Button
                      size="small"
                      disableRipple
                      variant="text"
                      className={classes.cardActionButton}
                      onClick={() => handleRedirectPath(elm.slug)}
                    >
                      {t('blog.readMore')}
                    </Button>
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};
export default BlogsSlider;
