import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: Theme) => ({
  tag: {
    fontSize: '1rem',
    width: 'max-content',
    padding: theme.spacing(0.1, 4),
    borderRadius: '8px 8px 8px 0px',
    lineHeight: '8px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
    },
    '& p': {
      lineHeight: 'inherit !important',
    },
  },
}));

export default useStyles;
