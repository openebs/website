import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'transparent',
    width: '100%',
    fontSize: '0.875rem',
    fontWeight: 400,
    textAlign: 'center',
    [theme.breakpoints.down('xl')]: {
      padding: theme.spacing(4, 8),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 0),
    },
  },
  sponsorCompany: {
    display: 'inline-block',
    width: '80%',
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down('xl')]: {
      paddingBottom: theme.spacing(0),
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '250px',
      paddingBottom: theme.spacing(2),
    },
  },
  paragraph: {
    [theme.breakpoints.down('lg')]: {
      fontSize: '.8rem',
    },
  },
  gridContainer: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(4),
    },
  },
}));
export default useStyles;
