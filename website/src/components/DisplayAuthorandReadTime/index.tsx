import React from "react";
import { useTranslation } from "react-i18next";
import useStyles from "./styles";
import { readingTime } from "../../utils/readingTime";
import { Avatar, Button, Typography } from "@material-ui/core";

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
  const displayTagandTimeRequiredToRead = () => {
    return (
      <>
        <div className={classes.wrapperBlock}>
          <span className={classes.author}>
            <Avatar
              alt="author1"
              src={`../Images/blog/authors/${author
                .toLowerCase()
                .replace(/[^\w ]+/g, "")
                .replace(/ +/g, "-")}.png`}
              className={classes.small}
            />
            <Button
              size="large"
              disableRipple
              variant="text"
              className={classes.cardActionButton}
              onClick={() => window.location.assign(`/blog/?author=${author}`)}
            >
              <Typography component={"span"} variant={"body2"}>
                {author? author: ''}
              </Typography>
            </Button>
          </span>
          <p className={classes.readTime}>
            <img
              src="../Images/svg/time-five.svg"
              alt={t("header.submitAlt")}
              className={classes.rightSpacing}
            />
            {`${readingTime(readTime)} min read`}
          </p>
        </div>
      </>
    );
  };
  return <>{displayTagandTimeRequiredToRead()}</>;
};

export default DisplayAuthorandReadTime;
