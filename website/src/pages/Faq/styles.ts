import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    backgroundImage: 'url(/images/png/faq_background.png)',
    textAlign: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'cover',
    padding: theme.spacing(12, 5, 0),
  },
  mainSection: {
    position: 'relative',
    textAlign: 'center',
    display: 'flex',
    zIndex: 100,
  },
  mainText: {
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
    margin: theme.spacing(8, 0),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    margin: `${theme.spacing(1)}px auto`,
    background: 'transparent',
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: 'none',
    position: 'relative',
    top: '25px',
  },
  tabRoot: {
    justifyContent: 'center',
    '& .Mui-selected': {
      color: theme.palette.text.hint,
      padding: theme.spacing(2, 1),
    },
  },
  scroller: {
    flexGrow: 0,
    background: theme.palette.background.paper,
    boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
    borderRadius: '12px 12px 12px 0px',
    width: 'fit-content',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  heading: {
    fontSize: '16px',
    fontWeight: 400,
    color: theme.palette.text.secondary,
  },
  headingSelected: {
    fontSize: '16px',
    fontWeight: 700,
  },
  accordionRoot: {
    marginTop: theme.spacing(15),
    width: '58%',
    margin: 'auto',
    [theme.breakpoints.down('md')]: {
      width: '65%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '75%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  buttonIcon: {
    color: theme.palette.warning.main,
  },
  accordion: {
    width: '100%',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(1, 2.5),
    boxShadow: '2px 5px 31px 4px rgba(70, 68, 151, 0.07)',
  },
  details: {
    borderTop: '2px solid',
    borderColor: theme.palette.grayishGreen.light,
    paddingTop: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: '16px',
  },
  footer: {
    gridArea: 'footer',
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
  faqFooter: {
    background: 'url(/images/png/blog_index_background.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    [theme.breakpoints.down('xs')]: {
      background: 'url(/images/png/blog_index_background_mobile.png)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  },
  MuiAccordionroot: {
    '&.MuiAccordion-root:before': {
      backgroundColor: theme.palette.common.white,
    },
  },
}));

export default useStyles;
