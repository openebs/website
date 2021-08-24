import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    textAlign: 'center',
    padding: theme.spacing(5, 5, 0),
  },
  tabsWrapper: {
    justifyContent: 'center',
  },
  tabs: {
    maxWidth: '100%',
    padding: theme.spacing(0.3),
    backgroundColor: 'transparent',
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0)',
  },
  tabRoot: {
    justifyContent: 'center',
    '& .MuiButtonBase-root': {
      color: theme.palette.text.secondary,
      [theme.breakpoints.down('xs')]: {
        fontSize: '14px',
      },
    },
    '& .Mui-selected': {
      color: theme.palette.text.hint,
      background: theme.palette.background.paper,
      boxShadow: '2px 5px 31px 4px rgba(70, 68, 151, 0.07)',
      borderRadius: '12px 12px 12px 0px',
      padding: theme.spacing(3, 1),
      margin: theme.spacing(2.5, 2),
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(2, 0.5),
      },
    },
  },
  scroller: {
    flexGrow: 0,
  },
  mainText: {
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    margin: theme.spacing(8, 0, 3),
    color: theme.palette.text.primary,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.25rem',
      maxWidth: '250px',
      margin: 'auto',
      marginBottom: theme.spacing(3),
    },
  },
  footer: {
    gridArea: 'footer',
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
  miniBlogSlider: {
    '& .slick-track': {
      display: 'flex',
    },
    '& .slick-slide': {
      height: 'inherit',
      [theme.breakpoints.down('xs')]: {
        opacity: '.3',
      },
    },
    '& .slick-slide > div': {
      height: '100%',
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(1.2),
      },
    },
    '& .slick-slide.slick-center': {
      [theme.breakpoints.down('xs')]: {
        opacity: 1,
      },
    },
  },
  cardWrapper: {
    height: '100%',
  },
  cardRoot: {
    maxWidth: '480px',
    boxShadow: 'none',
    background: 'transparent',
    margin: 'auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flex: '1 0 auto',
    padding: theme.spacing(2, 0),
  },
  rootBlogSection: {
    flexGrow: 1,
  },
  cardSize: {
    paddingTop: theme.spacing(4),
  },
  media: {
    height: 0,
    paddingTop: '56.25%',
    borderRadius: '24px 24px 24px 0px',
    position: 'relative',
    overflow: 'hidden',
    '& img': {
      minHeight: '100%',
      width: '100%',
      position: 'absolute',
      left: '0',
      top: '0',
      objectFit: 'cover',
      objectPosition: 'left',
    },
    cursor: 'pointer',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
    cursor: 'pointer',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
      fontSize: '16px',
    },
  },
  pos: {
    marginBottom: 12,
  },
  wrapper: {
    marginTop: theme.spacing(5),
    padding: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
  cardActionButton: {
    textTransform: 'none',
    color: theme.palette.warning.main,
    fontWeight: 700,
    marginRight: theme.spacing(2),
  },
  linkBtn: {
    textDecoration: 'none !important',
  },
  tag: {
    fontSize: 16,
    width: 'fit-content',
    padding: theme.spacing(0.1, 4),
    borderRadius: '8px',
    lineHeight: '8px',
    background: theme.palette.warning.light,
    color: theme.palette.text.hint,
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  actionWrapper: {
    justifyContent: 'space-between',
    padding: theme.spacing(0),
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  tabWrapper: {
    display: 'flex',
    overflow: 'auto',
    paddingBottom: theme.spacing(0.25),
    width: '70%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  rightSpacing: {
    border: 'none',
    background: 'none',
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  sliderWrapper: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0, 1),
      '& .slick-list': {
        padding: `${theme.spacing(0, 3, 0, 0)} !important`,
      },
    },
  },
}));

export default useStyles;
