import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
  introSection: {
    padding: theme.spacing(7, 0, 4),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(10, 0, 0),
    },
  },
  pageHeader: {
    fontSize: '2.625rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: 'start',
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
      textAlign: 'center',
    },
  },
  introImage: {
    width: 'auto',
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(0),
      width: '100%',
    },
  },
  supportDescription: {
    color: theme.palette.text.secondary,
    fontSize: '16px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '14px',
      marginTop: theme.spacing(4),
    },
  },
  supportImage: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
      width: '90%',
    },
  },
  // Supported companies card styles
  cardWrapper: {
    padding: theme.spacing(6, 14),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(4, 6),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0, 3),
    },
  },
  cardSection: {
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1, 0),
    },
  },
  cardProps: {
    padding: theme.spacing(2),
    position: 'relative',
    height: '95%',
    borderRadius: '20px 60px 20px 0px',
    boxShadow: '0px 11px 33px 29px rgba(193, 192, 243, 0.06)',
    '&:hover $cardAction': {
      visibility: 'visible',
      bottom: '10px',
    },
    '&:hover': {
      height: '120%',
      boxShadow: '0px 4px 34px 21px rgba(70, 68, 151, 0.04)',
      borderRadius: '20px 20px 60px 0px',
    },
    [theme.breakpoints.down('xs')]: {
      boxShadow: ' 0px 4px 34px 21px rgba(70, 68, 151, 0.04)',
      borderRadius: '20px 20px 40px 0px',
      padding: theme.spacing(2, 1),
    },
  },
  cardAction: {
    visibility: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(2),
  },
  cardText: {
    padding: theme.spacing(1, 0),
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('xs')]: {
      fontSize: '14px',
    },
  },
  cardImageWrapper: {
    height: '3.75rem',
    width: 'auto',
    [theme.breakpoints.down('xs')]: {
      height: '2rem',
      marginBottom: theme.spacing(2),
    },
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
  arrow: {
    marginLeft: theme.spacing(1),
  },
  footer: {
    gridArea: 'footer',
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
}));

export default useStyles;
