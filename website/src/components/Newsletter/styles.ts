import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  newsletter: {
    marginTop: theme.spacing(8),
    width: '100%',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.light,
    padding: theme.spacing(5, 1),
    position: 'relative',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.25rem',
      marginTop: theme.spacing(0),
    },
  },
  textField: {
    textAlign: 'center',
    padding: theme.spacing(3.5, 2),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(3.5, 2),
    },
  },
  newsWrapper: {
    display: 'grid',
    justifyContent: 'center',
  },
  newsletterInput: {
    color: theme.palette.common.white,
    fontSize: '14px',
    '&&&:before': {
      borderBottom: 'none',
    },
    '&&:after': {
      borderBottom: 'none',
    },
    borderBottom: `1px solid ${theme.palette.common.white}`,
    padding: theme.spacing(0.5, 0),
  },
  newsletterLabel: {
    color: theme.palette.common.white,
    fontSize: '0.875rem',
  },
  newsletterFormWrapper: {
    display: 'flex',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${theme.palette.secondary.main}`,
    },
  },
  solidButton: {
    marginTop: theme.spacing(2),
    boxShadow: 'none',
    '&:hover': {
      animation: '$pulse 1s',
      boxShadow: '0 0 0 22px rgba(255,255,255,0)',
    },
  },
}));

export default useStyles;
