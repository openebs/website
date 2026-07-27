import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: Theme) => ({
  readTime: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: theme.palette.primary.light,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
    },
  },
  wrapperBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActionButton: {
    textTransform: 'none',
    color: theme.palette.text.disabled,
    fontWeight: 700,
    marginRight: theme.spacing(2),
    fontSize: '1rem',
    padding: theme.spacing(0),
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
    },
  },
  small: {
    width: '32px',
    height: '32px',
    marginRight: theme.spacing(1),
  },
  rightSpacing: {
    marginRight: theme.spacing(1),
  },
  author: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default useStyles;
