import React from "react";
import CustomTag from "../CustomTag";
import { useTranslation } from "react-i18next";
import useStyles from "./styles";
import { readingTime } from "../../utils/readingTime";

interface displayTagandReadTimeProps {
  tags: string;
  readTime: string;
}

// A component to display blog tag and estimate time to read
const DisplayTagandReadTime: React.FC<displayTagandReadTimeProps> = ({
  tags,
  readTime,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const displayTagandTimeRequiredToRead = () => {
    return (
      <>
        <div className={classes.wrapperBlock}>
          <CustomTag blogLabel={tags} />
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

export default DisplayTagandReadTime;
