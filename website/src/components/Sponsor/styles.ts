import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'transparent',
    width: '100%',
    fontSize: '0.875rem',
    fontWeight: 400,
    textAlign: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: theme.spacing(4, 8),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(6, 0),
    },
  },
  sponsorCompany: {
    display: 'inline-block',
    width: '80%',
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down('lg')]: {
      paddingBottom: theme.spacing(0),
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: '250px',
      paddingBottom: theme.spacing(2),
    },
  },
  paragraph: {
    [theme.breakpoints.down('md')]: {
      fontSize: '.8rem',
    },
  },
  gridContainer: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(4),
    },
  },
}));
export default useStyles;
