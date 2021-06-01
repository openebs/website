import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BLOG_KEYWORDS } from "../../constants";
import useStyles from "./styles";

interface blogTitleProps {
  blogLabel: string;
}

const CustomTag: React.FC<blogTitleProps> = ({ blogLabel }) => {
  const classes = useStyles();
  const handleTags = () => {
    if (blogLabel === BLOG_KEYWORDS.CHOAS_ENGINEERING) {
      return (
        <Typography variant="h6" className={classes.chaosengineering}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    } else if (blogLabel === BLOG_KEYWORDS.DEVOPS) {
      return (
        <Typography variant="h6" className={classes.devops}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    } else if (blogLabel === BLOG_KEYWORDS.TUTORIALS) {
      return (
        <Typography variant="h6" className={classes.tutorials}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    } else if (blogLabel === BLOG_KEYWORDS.OPENEBS) {
      return (
        <Typography variant="h6" className={classes.openebs}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    } else if (blogLabel ===  BLOG_KEYWORDS.SOLUTIONS) {
      return (
        <Typography variant="h6" className={classes.solutions}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    } else {
      return (
        <Typography variant="h6" className={classes.secondary}>
          <ReactMarkdown children={blogLabel} />
        </Typography>
      );
    }
  };

  useEffect(() => {
    handleTags();
  });

  return handleTags();
};

export default CustomTag;
