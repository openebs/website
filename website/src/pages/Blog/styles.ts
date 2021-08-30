import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    backgroundImage: 'url(/images/png/faq_background.png)',
    textAlign: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'cover',
    padding: theme.spacing(16, 5, 0),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(5, 1),
      marginTop: theme.spacing(10),
      backgroundImage: 'url(/images/png/faq_background_mobile.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    },
  },
  tabRoot: {
    justifyContent: 'center',
    '& .MuiTab-root': {
      color: `${theme.palette.text.secondary} !important`,
    },
    '& .Mui-selected': {
      color: `${theme.palette.text.hint} !important`,
      padding: theme.spacing(2, 1),
    },
  },
  scroller: {
    flexGrow: 0,
    background: theme.palette.background.paper,
    boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
    borderRadius: '12px 12px 12px 0px',
  },
  tabs: {
    margin: `${theme.spacing(1)}px auto`,
    background: 'transparent',
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: 'none',
    position: 'relative',
    top: '25px',
  },
  mobileTabsWrapper: {
    background: theme.palette.background.paper,
    boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
    borderRadius: '12px 12px 12px 0px',
    padding: theme.spacing(2, 0),
  },
  tabButton: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
  },
  activeTabButton: {
    color: `${theme.palette.text.hint} !important`,
  },
  tagCount: {
    color: theme.palette.text.disabled,
    marginLeft: theme.spacing(0.5),
  },
  mainText: {
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
    maxWidth: '670px',
    margin: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2.625rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
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
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(3, 0),
      width: '80%',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3, 0),
      width: '85%',
    },
  },
  blogTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
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
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    cursor: 'pointer',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
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
