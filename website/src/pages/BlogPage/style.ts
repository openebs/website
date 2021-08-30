import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  blogHeader: {
    backgroundImage: 'url(/images/png/blog_header_background.png)',
    backgroundSize: 'cover',
    background: '100%',
    backgroundRepeat: 'no-repeat',
    padding: theme.spacing(15, 38, 10),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(10, 20),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(10),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(4),
      marginTop: theme.spacing(10),
      backgroundImage: 'url(/images/png/blog_header_background_mobile.png)',
      backgroundSize: 'cover',
      background: '100%',
      backgroundRepeat: 'no-repeat',
    },
  },
  breadCrumbs: {
    '& .MuiBreadcrumbs-ol': {
      justifyContent: 'center',
      color: theme.palette.info.light,
      fontSize: '14px',
      fontWeight: 400,
    },
  },
  blogTitle: {
    fontSize: '2.625rem',
    fontWeight: 700,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      marginTop: theme.spacing(3),
    },
  },
  author: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      textAlign: 'center',
    },
  },
  authorImgWrapper: {
    marginRight: theme.spacing(1),
    width: '48px',
    height: '48px',
    '& .MuiAvatar-root': {
      width: '100%',
      height: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      margin: 'auto',
    },
  },
  authorImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
  authorName: {
    fontSize: '16px',
    fontWeight: 700,
    [theme.breakpoints.down('xs')]: {
      fontSize: '14px',
    },
  },
  date: {
    color: theme.palette.text.secondary,
    fontSize: '16px',
    fontWeight: 400,
    '& p': {
      margin: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
  },
  dateAndTimeWrapper: {
    display: 'flex',
    fontSize: '16px',
    '& p': {
      marginRight: theme.spacing(1),
    },
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      fontSize: '14px',
    },
  },
  shareWrapper: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
    fontWeight: 400,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      justifyContent: 'center',
      marginTop: theme.spacing(3),
    },
  },
  share: {
    fontSize: '16px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '14px',
      marginBottom: theme.spacing(1),
    },
  },
  socialIconsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    marginLeft: theme.spacing(1),
    gap: theme.spacing(2),
  },
  socialIconButton: {
    height: '36px',
    width: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.background.paper,
    borderRadius: '8px 8px 8px 0px',
    boxShadow: '0px 14.5357px 48px 11px rgba(119, 116, 232, 0.08)',
    cursor: 'pointer',
    transition: '265ms',
    WebkitTransition: '265ms',
    '& .at-share-btn': {
      background: 'none !important',
    },
    '& .at-icon-wrapper svg': {
      fill: `${theme.palette.info.light} !important`,
      width: '25px !important',
      height: '25px !important',
      marginTop: theme.spacing(0.75),
      marginLeft: theme.spacing(0.5),
    },
    '& .at-resp-share-element .at-share-btn:focus, .at-resp-share-element .at-share-btn:hover': {
      transform: 'translateY(0px)',
    },
    '&:hover': {
      transform: 'rotate(-180deg)',
      MSTransform: 'rotate(-180deg)',
      WebkitTransform: 'scale(-180deg)',
      borderRadius: '50%',
    },
    '&:hover img': {
      transform: 'rotate(180deg) scale(1.25)',
      MSTransform: 'rotate(180deg) scale(1.25)',
      WebkitTransform: 'rotate(180deg) scale(1.25)',
    },
  },
  blogBody: {
    width: '58%',
    margin: 'auto',
    padding: theme.spacing(10, 0),
    '& p': {
      fontSize: '1rem',
      color: theme.palette.text.secondary,
      lineHeight: '22px',
    },
    '& ul, & ol': {
      '& li': {
        fontSize: '1rem',
        color: theme.palette.text.secondary,
        lineHeight: '22px',
        position: 'relative',
      },
      '& li:not(:last-child)': {
        marginBottom: theme.spacing(1),
      },
    },
    '& ol': {
      paddingLeft: theme.spacing(2),
    },
    '& ul': {
      paddingLeft: 0,
      '& li': {
        paddingLeft: theme.spacing(1.85),
        listStyle: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '6px',
          width: '8px',
          height: '8px',
          borderRadius: '100%',
          background: theme.palette.info.light,
        },
      },
    },
    '& h2': {
      fontSize: '2rem',
      lineHeight: '50px',
    },
    '& pre code': {
      borderRadius: '4px',
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: theme.palette.primary.dark,
      color: theme.palette.grayishGreen.light,
    },
    '& p > code': {
      padding: theme.spacing(0.5, 1),
      borderRadius: '4px',
      background: theme.palette.blue.light,
    },
    '& img': {
      maxWidth: '100%',
    },
    '& a': {
      textDecoration: 'underline',
      color: theme.palette.secondary.main,
    },
    '& blockquote': {
      background: 'transparent',
      borderLeft: 'none',
      textAlign: 'center',
      margin: theme.spacing(3, 0),
      '&::before': {
        color: theme.palette.info.light,
        content: 'open-quote',
        fontSize: '60px',
        lineHeight: '10px',
        marginRight: theme.spacing(1.2),
        verticalAlign: '-16px',
      },
      '& p': { display: 'inline' },
    },
    [theme.breakpoints.down('md')]: {
      width: '65%',
      padding: theme.spacing(8, 0),
    },
    [theme.breakpoints.down('sm')]: {
      width: '75%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '85%',
      padding: theme.spacing(4, 0),
      '& p': {
        fontSize: '0.875rem',
        lineHeight: '20px',
      },
      '& ul li': {
        fontSize: '0.875rem',
        lineHeight: '20px',
      },
      '& h2': {
        fontSize: '1.25rem',
        lineHeight: '26px',
      },
      '& h4': {
        fontSize: '0.875rem',
        lineHeight: '20px',
      },
    },
  },
  blogImg: {
    marginBottom: theme.spacing(2),
    width: '100%',
    borderRadius: '20px 0px 20px 86px',
    [theme.breakpoints.down('xs')]: {
      borderRadius: '20px 0px 20px 40px',
    },
  },
  divider: {
    border: `1px solid ${theme.palette.divider}`,
    margin: 'auto',
    width: '75%',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      width: '95%',
    },
  },
  footerDivWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    margin: theme.spacing(0, 22, 5),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(0, 20, 5),
    },
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0, 8, 5),
    },
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0, 4, 5),
      display: 'block',
    },
  },
  footerText: {
    fontSize: '22px',
    fontWeight: 700,
  },
  arrowButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1),
    '&:hover': {
      background: 'transparent',
    },
    '& .MuiButton-label': {
      fontSize: '16px',
      fontWeight: 700,
    },
    '& .MuiButton-iconSizeMedium img': {
      width: '10px',
      height: '10px',
    },
  },
  rightArrowButtonWrapper: {
    textAlign: 'right',
    marginLeft: 'auto',
  },
  blogLink: {
    fontSize: '16px',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    maxWidth: '310px',
    cursor: 'pointer',
  },
  blogRecommendationTitle: {
    fontSize: '32px',
    fontWeight: 700,
    margin: theme.spacing(6, 0),
    textAlign: 'center',
  },
  blogSlider: {
    display: 'block',
    margin: theme.spacing(0, 22),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(0, 20),
    },
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0, 8),
    },
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0, 4),
    },
  },
  tagsWrapper: {
    marginTop: theme.spacing(5),
  },
  tagButton: {
    border: 'none',
    background: 'none',
    margin: theme.spacing(0.5, 1, 0.5, 0),
    cursor: 'pointer',
    padding: theme.spacing(0),
  },
  footer: {
    paddingTop: theme.spacing(8),
    background: 'url(/images/png/blog_footer_background.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    [theme.breakpoints.down('xs')]: {
      background: 'url(/images/png/blog_footer_background_mobile.png)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  },
}));

export default useStyles;
