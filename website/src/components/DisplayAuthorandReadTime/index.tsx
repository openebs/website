import React from "react";
import { useTranslation } from "react-i18next";
import useStyles from "./styles";
import { readingTime } from "../../utils/readingTime";
import { Avatar, Button } from "@material-ui/core";
import { getAvatar } from "../../utils/getAvatar";
import { useHistory } from "react-router-dom";

interface displayAuthorandReadTimeProps {
  author: string;
  readTime: string;
}

// A component to display blog tag and estimate time to read
const DisplayAuthorandReadTime: React.FC<displayAuthorandReadTimeProps> = ({
  author,
  readTime,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const handleRedirectPath = (author: string) => {
    history.push(`/blog/author/${author.toLowerCase().replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-')}`);
  };
  const displayTagandTimeRequiredToRead = () => {
    return (
      <>
        <div className={classes.wrapperBlock}>
          <span className={classes.author}>
            <Avatar
              alt={author && author}
              src={`/images/blog/authors/${getAvatar(author)}.png`}
              className={classes.small}
            />
            <Button
              size="large"
              disableRipple
              variant="text"
              className={classes.cardActionButton}
              onClick={() => handleRedirectPath(author)}
            >
              {author && author}
            </Button>
          </span>
          <p className={classes.readTime}>
            <img
              loading="lazy"
              src="/images/svg/time-five.svg"
              alt={t("header.submitAlt")}
              className={classes.rightSpacing}
            />
            {`${readingTime(readTime)} ${t('blog.minToRead')}`}
          </p>
        </div>
      </>
    );
  };
  return <>{displayTagandTimeRequiredToRead()}</>;
};

export default DisplayAuthorandReadTime;
