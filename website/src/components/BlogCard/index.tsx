import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, CardActions, CardContent, CardMedia,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useStyles from './style';
import BlogImage from '../BlogImage';
import DisplayAuthorandReadTime from '../DisplayAuthorandReadTime';
import getContentPreview from '../../utils/getContent';
import CustomTag from '../CustomTag';

interface BlogCardProps {
    blog: {
            title: string;
            author: string;
            excerpt: string;
            author_info: string;
            date: string;
            tags: Array<string>;
            content: string;
            id: number;
            slug: string;
        }
    handleTagSelect: (tag: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, handleTagSelect }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const handleRedirectPath = (slug: string) => {
    history.push(`/blog/${slug}`);
  };

  const getTags = (tags: string[]) => tags.map((tag: string) => (
    <button
      type="button"
      key={tag}
      onClick={() => handleTagSelect(tag)}
      className={classes.tagButton}
    >
      <CustomTag blogLabel={tag} key={tag} />
    </button>
  ));

  return (
    <>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          onClick={() => handleRedirectPath(blog.slug)}
        >
          <BlogImage imgPath={`/images/blog/${blog.slug}.png`} alt={blog.title} />
        </CardMedia>
        <CardContent classes={{ root: classes.cardRoot }}>
          <DisplayAuthorandReadTime
            author={blog.author}
            readTime={blog.content}
          />
          <span
            role="link"
            tabIndex={0}
            className={classes.title}
            color="textPrimary"
            onClick={() => handleRedirectPath(blog.slug)}
            onKeyPress={() => handleRedirectPath(blog.slug)}
          >
            <ReactMarkdown>
              {blog.title}
            </ReactMarkdown>
          </span>
          <span className={classes.blogDescription}>
            <ReactMarkdown>
              {getContentPreview(blog.excerpt)}
            </ReactMarkdown>
          </span>
        </CardContent>
        <CardActions className={classes.actionWrapper} classes={{ root: classes.cardRoot }}>
          <span className={classes.tabWrapper}>
            {getTags(blog.tags)}
          </span>
          <Button
            size="large"
            disableRipple
            variant="text"
            className={classes.cardActionButton}
            onClick={() => handleRedirectPath(blog.slug)}
          >
            {t('blog.read')}
            <img
              loading="lazy"
              src="/images/svg/arrow_orange.svg"
              alt={t('header.submitAlt')}
              className={classes.arrow}
            />
          </Button>
        </CardActions>
      </Card>
    </>
  );
};
export default BlogCard;
