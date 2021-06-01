import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  blogHeader: {
    backgroundImage: 'url(/Images/png/blog_header_background.png)',
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
      backgroundImage: 'url(/Images/png/blog_header_background_mobile.png)',
      backgroundSize: 'cover',
      background: '100%',
      backgroundRepeat: 'no-repeat',
    },
  },
  blogTitle: {
    fontSize: '42px',
    fontWeight: 700,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '24px',
    },
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      display: 'block',
    },
  },
  author: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      textAlign: 'center'
    },
  },
  authorImg: {
    marginRight: theme.spacing(1)
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
      marginRight: theme.spacing(1)
    }
  },
  dateAndTimeWrapper: {
    display: 'flex',
    fontSize: '16px',
    '& p': {
      marginRight: theme.spacing(1)
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
      justifyContent: 'center',
      marginTop: theme.spacing(4)
    },
  },
  share: {
    fontSize: '16px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '14px',
    },
  },
  socialIconsWrapper: {
    display: 'flex',
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
    '& .at-share-btn':{
      background: 'none !important'
    },
    '& .at-icon-wrapper svg':{
      fill: '#61A7BC !important',
      width: '25px !important',
      height: '25px !important',
      marginTop: theme.spacing(0.75),
      marginLeft: theme.spacing(0.5)
    },
    '& .at-resp-share-element .at-share-btn:focus, .at-resp-share-element .at-share-btn:hover':{
      transform: 'translateY(0px)'
    }
  },
  blogBody: {
    padding: theme.spacing(10, 39),
    margin: 'auto',
    '& p':{
      fontSize: '16px',
      color: theme.palette.text.secondary,
      lineHeight: '22px'
    },
    '& h2': {
      fontSize: '32px', 
      lineHeight: '50px'
    },
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(8, 20),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(8),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(4),
      '& p':{
        fontSize: '14px',
        lineHeight: '20px'
      },
      '& h2': {
        fontSize: '20px', 
        lineHeight: '26px'
      },
      '& h4': {
        fontSize: '14px', 
        lineHeight: '20px'
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
      display: 'block'
    },
  },
  footerText: {
    fontSize: '22px',
    fontWeight: 700
  },
  arrowButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1),
    '&:hover': {
      background: 'transparent'
    },
    '& .MuiButton-label': {
      fontSize: '16px',
      fontWeight: 700,
    },
    '& .MuiButton-iconSizeMedium img': {
      width: '10px',
      height: '10px'
    },
  },
  rightArrowButtonWrapper: {
    marginLeft: 'auto'
  },
  blogLink: {
    fontSize: '16px',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    maxWidth: '310px',
    cursor: 'pointer'
  },
  blogRecommendationTitle: {
    fontSize: '32px',
    fontWeight: 700,
    marginTop: theme.spacing(6)
  },
  footer: {
    
  }
}));

export default useStyles;