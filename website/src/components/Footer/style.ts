import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    padding: theme.spacing(2, 10, 0),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 5, 0),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 3, 0),
    },
  },
  toolbar: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0),
    },
  },
  topDivider: {
    border: `1px solid ${theme.palette.divider}`,
    margin: 'auto',
    width: '85%',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      width: '95%',
    },
  },
  paper: {
    padding: theme.spacing(2),
    boxShadow: 'none',
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0),
    },
  },
  firstGrid: {
    paddingRight: theme.spacing(20),
    [theme.breakpoints.down('lg')]: {
      paddingRight: theme.spacing(20),
      paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      paddingRight: theme.spacing(5),
      paddingLeft: theme.spacing(0),
    },
    [theme.breakpoints.down('xs')]: {
      paddingRight: theme.spacing(0),
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2),
    },
  },
  logo: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      width: '100px',
      marginBottom: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
      width: '100px',
      marginBottom: theme.spacing(0),
    },
  },
  columnTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  newsletterInput: {
    fontSize: '14px',
    '&&&:before': {
      borderBottom: 'none',
    },
    '&&:after': {
      borderBottom: 'none',
    },
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(0.5, 0),
  },
  newsletterLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  newsletterFormWrapper: {
    display: 'flex',
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
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
    transition: '265ms',
    WebkitTransition: '265ms',
    marginRight: theme.spacing(2),
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
  socialIconsWrapper: {
    display: 'flex',
    marginTop: theme.spacing(4),
  },
  columnListWrapper: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '16px',
    fontWeight: 400,
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  columnListItem: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(1.5),
    },
  },
  bottomDivider: {
    border: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    margin: 'auto',
    width: '95%',
    marginTop: theme.spacing(5),
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  copyrightsWrapper: {
    display: 'flex',
    padding: theme.spacing(2, 4),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 0),
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      padding: theme.spacing(2, 0),
      marginTop: theme.spacing(6),
    },
  },
  copyrights: {
    fontSize: '1rem',
    [theme.breakpoints.down('md')]: {
      fontSize: '.9rem',
    },
  },
  privacyPolicyLink: {
    marginLeft: theme.spacing(4),
    color: theme.palette.warning.main,
    textDecoration: 'underline',
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(2, 0, 4),
    },
  },
  contributeButton: {
    textTransform: 'none',
    fontSize: '14px',
    color: theme.palette.brown.dark,
    padding: theme.spacing(1, 2),
    border: `2px solid ${theme.palette.brown.dark}`,
    boxSizing: 'border-box',
    borderRadius: '4px',
    display: 'inline-flex',
  },
  githubMobileIcon: {
    height: '20px',
    marginRight: theme.spacing(0.5),
  },
  contributorsMobile: {
    marginTop: theme.spacing(2),
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${theme.palette.secondary.main}`,
    },
  },
  solidButton: {
    marginRight: theme.spacing(2.5),
    marginTop: theme.spacing(3),
    '&:hover': {
      animation: '$pulse 1s',
      boxShadow: '0 0 0 22px rgba(255,255,255,0)',
    },
  },
}));
export default useStyles;
