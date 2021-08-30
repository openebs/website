import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 30),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(8),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3),
    },
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: theme.spacing(5.5),
    color: theme.palette.text.primary,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.25rem',
      padding: theme.spacing(0, 5),
    },
  },
  paper: {
    color: theme.palette.text.secondary,
    height: '520px',
    boxShadow: '0px 11px 33px 29px rgba(193, 192, 243, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftPaper: {
    borderRadius: '60px 20px 0px',
    padding: theme.spacing(0),
  },
  rightPaper: {
    borderRadius: '20px 20px 60px 0px',
    padding: theme.spacing(12, 6),
  },
  communityCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  gitHubLogo: {
    width: '35%',
    [theme.breakpoints.down('sm')]: {
      width: '28%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '45%',
    },
  },
  formWrapper: {
    display: 'flex',
  },
  input: {
    fontSize: '0.875rem',
    '&&&:before': {
      borderBottom: 'none',
    },
    '&&:after': {
      borderBottom: 'none',
    },
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(0.5, 0),
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  iconButton: {
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
  },
  cardTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
  },
  cardBodyText: {
    fontSize: '1rem',
    fontWeight: 400,
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${theme.palette.secondary.main}`,
    },
  },
  cardButton: {
    width: '168px',
    padding: theme.spacing(1.5),
    '&:hover': {
      animation: '$pulse 1s',
      boxShadow: '0 0 0 16px rgba(255,255,255,0)',
    },
  },
}));
export default useStyles;
