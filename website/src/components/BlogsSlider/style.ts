import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  cardRoot: {
    maxWidth: "480px",
    boxShadow: 'none',
    background: 'transparent',
    margin: 'auto'
  },
  media: {
    height: 0,
    paddingTop: "56.25%",
    borderRadius: "24px 24px 24px 0px",
    position: 'relative',
    overflow: 'hidden',
    '& img':{
      minHeight: '100%',
      width: '100%',
      position: 'absolute',
      left: '0',
      top: '0',
      objectFit: 'cover',
      objectPosition: 'left'
    }
  },
  tagsWrapper: {
    display: 'flex',
    overflow: "scroll",
    paddingBottom: theme.spacing(0.75),
  },
  tag: {
    marginRight: theme.spacing(1)
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
  },
  cardActionButton: {
    textTransform: "none",
    color: theme.palette.warning.main,
    fontWeight: 700,
    marginRight: theme.spacing(2),
  },
  sliderWrapper: {
      '& .slick-slide':{
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(2),
          },
      }
  },
  arrowWrapper: {
    display: "block"
  }
}));

export default useStyles;