import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';
import { BLOG_TAGS, VIEW_PORT } from '../../constants';
import Carousel from '../Carousel';
import DisplayAuthorandReadTime from '../DisplayAuthorandReadTime';
import CustomTag from '../CustomTag';
import getContentPreview from '../../utils/getContent';
import BlogImage from '../BlogImage';
import getTagsSorted from '../../utils/sortTags';

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
  const [value, setValue] = React.useState('all');
  const [tagsDistribution, setTagsDistribution] = useState({});
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const history = useHistory();
  const handleTagSelect = (tags: string) => {
    setValue(tags);
  };

  const handleRedirectPath = (slug: string) => {
    history.push(`/blog/${slug}`);
  };

  const getTags = (tags: Array<string>) => tags.map((tag: string) => (
    <button
      type="button"
      key={tag}
      onClick={() => handleTagSelect(tag)}
      className={classes.rightSpacing}
    >
      <CustomTag blogLabel={tag} key={tag} />
    </button>
  ));

  const StyledTab = withStyles((theme: Theme) => createStyles({
    root: {
      textTransform: 'none',
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
      fontSize: '16px',
      opacity: 1,
      marginRight: theme.spacing(1),
      '&:focus': {
        opacity: 1,
        color: theme.palette.warning.dark,
      },
      '&:active': {
        opacity: 1,
        color: theme.palette.warning.dark,
      },
    },
  }))((props: StyledTabProps) => <Tab disableRipple {...props} />);

  const fetchBlogs = async () => {
    const { default: blogs } = await import('../../posts.json');
    setJsonMdData(blogs);
  };

  useEffect(() => {
    fetchBlogs();
  });

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const totalBlogCount = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs,
  ).length;

  const filteredData = (jsonMdData || []).filter((tabs: TabProps) => {
    if (value !== BLOG_TAGS.ALL) {
      const tagData = tabs.tags.find(
        (tag: string) => tag.toLowerCase() === value.toLowerCase(),
      );
      return tagData;
    }
    return tabs;
  });

  const reducer = (acum: { [key: string]: any }, cur: string) => {
    const keys = Object.keys(acum);
    const key: string = keys.find((item) => cur.toLowerCase() === item.toLowerCase()) || cur;
    return Object.assign(acum, { [key]: (acum[key] || 0) + 1 });
  };

  useEffect(() => {
    let tagsArray: Array<string> = [];
    if (jsonMdData && jsonMdData.constructor === Array) {
      // this check is necessary to avoid parsing errors on JSON data
      for (let i = jsonMdData.length - 1; i >= 0; i--) {
        tagsArray = [...tagsArray, ...jsonMdData[i].tags];
      }
      setTagsDistribution(
        tagsArray.reduce<Record<string, string>>(reducer, {}),
      );
    }
  }, [jsonMdData]);

  const sortedTags = getTagsSorted(tagsDistribution);
  const tagsMarkup = sortedTags.map((item: string) => {
    if (tagsDistribution[item as keyof typeof tagsDistribution] > 1) {
      return (
        <StyledTab
          label={`${item} (${
            tagsDistribution[item as keyof typeof tagsDistribution]
          })`}
          value={item}
          key={item}
        />
      );
    }
    return null;
  });

  const sliderSettings = {
    dots: false,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: filteredData.length === 1 ? filteredData.length : 2,
    slidesToScroll: 1,
    cssEase: 'linear',
    arrows: true,
    rtl: false,
    className: classes.miniBlogSlider,
    responsive: [
      {
        breakpoint: mobileBreakpoint,
        settings: {
          slidesToShow: 1,
          arrows: false,
          centerMode: true,
          centerPadding: '30px',
        },
      },
    ],
  };

  return (
    <>
      <span className={classes.root}>
        <Container maxWidth="lg">
          <h1 className={classes.mainText}>{t('blog.title')}</h1>
          <Paper className={classes.tabs}>
            <Tabs
              value={value}
              classes={{ root: classes.tabRoot, scroller: classes.scroller }}
              onChange={handleChange}
              variant="scrollable"
              TabIndicatorProps={{
                style: {
                  display: 'none',
                },
              }}
              orientation={mobileBreakpoint ? 'horizontal' : 'vertical'}
            >
              <StyledTab
                label={`${t('blog.all')} (${totalBlogCount})`}
                value={BLOG_TAGS.ALL}
              />
              {tagsMarkup}
            </Tabs>
          </Paper>
        </Container>
      </span>
      <Grid container justify="center">
        <Grid
          item
          sm={filteredData.length === 1 ? 5 : 10}
          xs={12}
          className={classes.sliderWrapper}
        >
          <Carousel settings={sliderSettings}>
            {filteredData.slice(0, 10).map((elm: any) => (
              <div className={classes.cardWrapper} key={elm.id}>
                <Card key={elm.id} className={classes.cardRoot}>
                  <CardMedia
                    className={classes.media}
                    onClick={() => handleRedirectPath(elm.slug)}
                  >
                    <BlogImage
                      imgPath={`/images/blog/${elm.slug}.png`}
                      alt={elm.title}
                    />
                  </CardMedia>
                  <CardContent className={classes.cardContent}>
                    <DisplayAuthorandReadTime
                      author={elm.author}
                      readTime={elm.content}
                    />
                    <Typography
                      component="span"
                      className={classes.title}
                      color="textSecondary"
                      gutterBottom
                      onClick={() => handleRedirectPath(elm.slug)}
                    >
                      <ReactMarkdown>{elm.title}</ReactMarkdown>
                    </Typography>
                    <span>
                      <ReactMarkdown>
                        {getContentPreview(elm.excerpt)}
                      </ReactMarkdown>
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
                      onClick={() => handleRedirectPath(elm.slug)}
                    >
                      {t('blog.readMore')}
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))}
          </Carousel>
        </Grid>
      </Grid>
    </>
  );
};
export default MiniBlog;
