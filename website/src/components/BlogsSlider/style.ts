import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  cardRoot: {
    maxWidth: "480px",
    boxShadow: 'none',
    background: 'transparent',
  },
  media: {
    height: 0,
    paddingTop: "56.25%",
    borderRadius: '24px 24px 24px 0px',
  },
  tagsWrapper: {
    display: 'flex',
    gap: '12px'
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