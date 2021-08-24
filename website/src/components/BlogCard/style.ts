import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  tagButton: {
    border: 'none',
    background: 'none',
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  card: {
    boxShadow: 'none',
    background: 'transparent',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardRoot: {
    padding: '0',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    borderRadius: '24px 24px 24px 0px',
    position: 'relative',
    overflow: 'hidden',
    '& img': {
      minHeight: '100%',
      width: '100%',
      position: 'absolute',
      left: '0',
      top: '0',
      objectFit: 'cover',
      objectPosition: 'left',
    },
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    cursor: 'pointer',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  blogDescription: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.875rem',
    },
  },
  actionWrapper: {
    justifyContent: 'space-between',
    marginTop: 'auto',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  tabWrapper: {
    display: 'flex',
    overflow: 'auto',
    paddingBottom: theme.spacing(0.25),
    width: '70%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  cardActionButton: {
    textTransform: 'none',
    color: theme.palette.warning.main,
    fontWeight: 700,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  arrow: {
    marginLeft: theme.spacing(1),
  },
}));

export default useStyles;
