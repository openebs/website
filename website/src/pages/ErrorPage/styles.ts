import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
    marginTop: theme.spacing(10),
  },
  footer: {
    gridArea: 'footer',
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
  wrapper: {
    textAlign: 'center',
  },
  errorImage: {
    width: '60%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  pageHeader: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: theme.spacing(5, 0),
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
      margin: theme.spacing(8, 4),
    },
  },
  solidButton: {
    marginRight: theme.spacing(2.5),
    marginBottom: theme.spacing(5),
    width: '168px',
    fontSize: '0.875rem',
    padding: theme.spacing(1.5),
    '&:hover': {
      animation: '$pulse 1s',
      boxShadow: '0 0 0 22px rgba(255,255,255,0)',
    },
  },
}));

export default useStyles;
