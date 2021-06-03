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

  const chaosEngineering = () => {
    return (
      <Typography variant="h6" className={classes.chaosengineering}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  const devOps = () => {
    return (
      <Typography variant="h6" className={classes.devops}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  const tutorials = () => {
    return (
      <Typography variant="h6" className={classes.tutorials}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  const openEBS = () => {
    return (
      <Typography variant="h6" className={classes.openebs}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  const solutions = () => {
    return (
      <Typography variant="h6" className={classes.solutions}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  const secondary = () => {
    return (
      <Typography variant="h6" className={classes.secondary}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    );
  };

  // Switch statements to handle props based on the respective tags
  const handleTags = () => {
    switch (blogLabel) {
      case BLOG_KEYWORDS.CHAOS_ENGINEERING:
        return chaosEngineering();
      case BLOG_KEYWORDS.DEVOPS:
        return devOps();
      case BLOG_KEYWORDS.TUTORIALS:
        return tutorials();
      case BLOG_KEYWORDS.OPENEBS:
        return openEBS();
      case BLOG_KEYWORDS.SOLUTIONS:
        return solutions();
      default:
        return secondary();
    }
  };

  useEffect(() => {
    handleTags();
  });

  // returns the respective tag props
  return <>{handleTags()}</>;
};

export default CustomTag;
