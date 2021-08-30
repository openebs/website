import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    backgroundImage: 'url(/images/png/faq_background.png)',
    textAlign: 'left',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'cover',
    padding: theme.spacing(16, 0, 0),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(5, 1),
      marginTop: theme.spacing(10),
      backgroundImage: 'url(/images/png/faq_background_mobile.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
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
  authorWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: theme.spacing(3, 0, 2.5),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      margin: theme.spacing(0),
    },
  },
  large: {
    width: '50px',
    height: '50px',
    margin: theme.spacing(0.4, 1.8, 0, 0),
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(2),
    },
  },
  authorText: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: theme.spacing(0),
    alignItems: 'center',
    fontSize: '2.625rem',
    lineHeight: 'normal',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  authorDesc: {
    paddingBottom: theme.spacing(3),
    fontSize: '16px',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.875rem',
      margin: theme.spacing(0),
      paddingBottom: theme.spacing(0),
    },
  },
  footer: {
    gridArea: 'footer',
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
  sectionDiv: {
    padding: theme.spacing(3, 0),
    width: '75%',
    margin: 'auto',
    maxWidth: 'inherit',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(3, 0),
      width: '80%',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3, 0),
      width: '85%',
    },
  },
  blogsWrapper: {
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  cardSize: {
    maxWidth: '480px !important',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      maxWidth: '380px !important',
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '480px',
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: '90% !important',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    '& .Mui-selected': {
      color: theme.palette.text.hint,
      background: `${theme.palette.background.paper} !important`,
      boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
      borderRadius: '8px 8px 8px 0px',
    },
    '& .MuiPaginationItem-root': {
      fontWeight: 'bold',
    },
  },
  blogFooter: {
    background: 'url(/images/png/blog_index_background.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    [theme.breakpoints.down('xs')]: {
      background: 'url(/images/png/blog_index_background_mobile.png)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  },
}));

export default useStyles;
