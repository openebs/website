import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    background: theme.palette.background.default,
    minHeight: '100vh',
    // ScrollBar Styling
    '& *::-webkit-scrollbar': {
      width: '0.4rem',
      height: '3px',
    },
    '& *::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 8px ${theme.palette.common.black}`,
    },
    '& *::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: 8,
    },
  },
  header: {
    gridArea: 'header',
  },
  content: {
    gridArea: 'content',
  },
}));

export default useStyles;
