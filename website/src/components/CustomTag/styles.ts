import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  tag: {
    fontSize: '1rem',
    width: 'max-content',
    padding: theme.spacing(0.1, 4),
    borderRadius: '8px 8px 8px 0px',
    lineHeight: '8px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.75rem',
    },
    '& p': {
      lineHeight: 'inherit !important',
    },
  },
}));

export default useStyles;
