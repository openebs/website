import React from 'react';
import { Typography } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import useStyles from './styles';

interface blogTitleProps {
  blogLabel: string;
}

const CustomTag: React.FC<blogTitleProps> = ({ blogLabel }) => {
  const classes = useStyles();

  const getTabStyle = () => {
    const colorsDictionary = [
      {
        background: '#FFE2D5',
        text: '#A4451B',
      },
      {
        background: '#FFEDAD',
        text: '#6A5711',
      },
      {
        background: '#DBF0F7',
        text: '#62A7BD',
      },
      {
        background: '#DCDBF7',
        text: '#223288',
      },
      {
        background: '#B2EFE8',
        text: '#3D9086',
      },
      {
        background: '#FFCDCD',
        text: '#963D16',
      },
    ];
    const randomColor = colorsDictionary[Math.floor(Math.random() * colorsDictionary.length)];
    const tabStyle = { backgroundColor: randomColor.background, color: randomColor.text };
    return tabStyle;
  };

  return (
    <>
      <Typography variant="h6" className={classes.tag} style={getTabStyle()}>
        <ReactMarkdown>
          {blogLabel}
        </ReactMarkdown>
      </Typography>
    </>
  );
};

export default CustomTag;
