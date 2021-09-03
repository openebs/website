import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  alertBanner: {
    background: theme.palette.pattensBlue.main,
    padding: theme.spacing(1.5),
    textAlign: 'center',
    color: theme.palette.primary.main,
    '& a': {
      marginLeft: theme.spacing(0.5),
      color: theme.palette.secondary.main,
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        textDecoration: 'none',
      },
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '12px',
    },
  },
}));

export default useStyles;
