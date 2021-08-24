import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    padding: theme.spacing(2, 10),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 5),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 3),
    },
  },
  header: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: theme.palette.background.paper,
    },
  },
  scrolledHeader: {
    backgroundColor: theme.palette.background.paper, // This background gets applied to header on scroll
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    [theme.breakpoints.down('sm')]: {
      width: '130px',
    },
  },
  starButton: {
    marginLeft: theme.spacing(2),
    height: 'fit-content',
    marginTop: theme.spacing(1.4),
  },
  rightContent: {
    display: 'flex',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  navbarItem: {
    color: theme.palette.text.secondary,
    margin: theme.spacing(0, 1),
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '18px',
    textTransform: 'uppercase',
    padding: theme.spacing(0.75, 1),
    '&:hover': {
      color: theme.palette.warning.main,
      backgroundColor: 'transparent',
      textDecoration: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      margin: theme.spacing(0, 0),
      minWidth: 'unset',
    },
  },
  activeNavbarItem: {
    color: theme.palette.text.hint,
    backgroundColor: 'transparent',
    fontWeight: 700,
  },
  socialIconsWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    [theme.breakpoints.up('xs')]: {
      gap: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      gap: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      gap: theme.spacing(2),
    },
  },
  socialIcon: {
    [theme.breakpoints.up('xs')]: {
      width: '32px',
    },
    [theme.breakpoints.up('sm')]: {
      width: '25px',
    },
    [theme.breakpoints.up('md')]: {
      width: 'unset',
    },
  },
  drawerPaper: {
    width: '85vw',
    height: '100vh',
    background: 'url(/images/png/mobile_menu_background.png)',
    backgroundSize: 'cover',
    display: 'flex',
    flexDirection: 'column',
  },
  closeIcon: {
    margin: `${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(2)}px auto`,
  },
  mobileNavWrapper: {
    margin: 'auto',
  },
  socialIconsMobile: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
  },
  menuItemMobile: {
    fontSize: '1rem',
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(0),
  },
  mobileDivider: {
    border: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(0),
  },
}));
export default useStyles;
