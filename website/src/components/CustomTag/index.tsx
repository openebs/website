import { Typography } from "@material-ui/core";
import ReactMarkdown from "react-markdown";
import useStyles from "./styles";

interface blogTitleProps {
  blogLabel: string;
}

const CustomTag: React.FC<blogTitleProps> = ({ blogLabel }) => {
  const classes = useStyles();

  const getBackgroundColor = () => {
    const backgroundColorsDictionary = ['#FFE2D5', '#FFEDAD', '#DBF0F7', '#62A7BD', '#464497', '#DCDBF7', '#B2EFE8', '#FFCDCD'];
    const backgroundColor = backgroundColorsDictionary[Math.floor(Math.random() * backgroundColorsDictionary.length)];
    return backgroundColor;
  }

  const getTextColor = () => {
    const textColorsDictionary = ['#F26D00','#073D47','#FFFFFF', '#A4451B', '#3B4473', '#3B4473', '#F26D00', '#A4451B', '#A4451B', '#6A5711', '#62A7BD', '#223288', '#3D9086', '#963D16'];
    const textColor = textColorsDictionary[Math.floor(Math.random() * textColorsDictionary.length)];
    return textColor;
  }

  return (
    <>
       <Typography variant="h6" className={classes.tag} style = {{backgroundColor: getBackgroundColor(), color: getTextColor()}}>
        <ReactMarkdown children={blogLabel} />
      </Typography>
    </>
  );
};

export default CustomTag;
