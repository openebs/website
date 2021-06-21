import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    backgroundImage: "url(/Images/png/faq_background.png)",
    textAlign: "center",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    backgroundSize: "cover",
    padding: theme.spacing(16, 5, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(5, 5),
      marginTop: theme.spacing(10),
      backgroundImage: "url(/Images/png/faq_background_mobile.png)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
  },
  tabRoot: {
    justifyContent: "center",
    '& .Mui-selected': {
      color: theme.palette.text.hint,
      padding: theme.spacing(2, 1),
    }
  },
  scroller: {
    flexGrow: 0,
    background: theme.palette.background.paper,
    boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
    borderRadius: '12px 12px 12px 0px'
  },
  breadCrumbs: {
    '& .MuiBreadcrumbs-ol':{
      justifyContent: 'center',
      color: theme.palette.info.light,
      fontSize: '14px',
      fontWeight: 400
    }
  },
  authorWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: theme.spacing(3, 0, 2.5),
    [theme.breakpoints.down("xs")]: {
      flexDirection: 'column',
      margin: theme.spacing(0),
      gap: theme.spacing(1)
    },
  },
  large: {
    width: '60px',
    height: '60px',
    marginRight: theme.spacing(1.8),
    [theme.breakpoints.down("xs")]: {
      width: '32px',
      height: '32px',
    },
  },
  tabs: {
    margin: `${theme.spacing(1)}px auto`,
    background: 'transparent',
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: 'none',
    position: 'relative',
    top: '25px'
  },
  mainText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    maxWidth: '670px',
    margin: 'auto',
    justifyContent: "center",
    alignItems: "center",
    fontSize: '2.625rem',
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
  authorText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    margin: theme.spacing(0),
    justifyContent: "center",
    alignItems: "center",
    fontSize: '2.625rem',
    [theme.breakpoints.down("xs")]: {
      fontSize: '1.5rem',
    },
  },
  authorDesc: {
    paddingBottom: theme.spacing(3),
    fontSize: '16px',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.875rem',
      margin: theme.spacing(0),
      paddingBottom: theme.spacing(0),
    },
  },
  authorURL: {
    color: theme.palette.info.light,
  },
  footer: {
    gridArea: "footer",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
  sectionDiv: {
    padding: theme.spacing(3, 0),
    width: '75%',
    margin: 'auto',
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(3, 0),
      width: '80%'
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3, 0),
      width: '85%'
    }
  },
  blogTitle: {
    fontSize: '2.625rem',
    fontWeight: 700,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  blogsWrapper: {
    justifyContent: 'space-between',
    [theme.breakpoints.up("xl")]: {
      justifyContent: 'left',
    },
    [theme.breakpoints.down("sm")]: {
      justifyContent: 'center',
    },
  },
  card: {
    boxShadow: "none",
    background: "transparent",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardRoot: {
    padding: '0'
  },
  rootBlogSection: {
    flexGrow: 1,
  },
  cardSize: {
    maxWidth: "480px",
    paddingTop: theme.spacing(4),
    [theme.breakpoints.down("md")]: {
      maxWidth: "380px",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "480px",
    },
    [theme.breakpoints.down("xs")]: {
      maxWidth: "90%",
    },
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
    borderRadius: "24px 24px 24px 0px",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    cursor: "pointer",
    [theme.breakpoints.down("xs")]: {
      fontSize: '1rem'
    },
  },
  blogDescription: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("xs")]: {
      fontSize: '0.875rem'
    },
  },
  pos: {
    marginBottom: 12,
  },
  wrapper: {
    marginTop: theme.spacing(5),
    padding: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
  cardActionButton: {
    textTransform: "none",
    color: theme.palette.warning.main,
    fontWeight: 700,
    [theme.breakpoints.down("xs")]: {
      display: 'none'
    },
  },
  linkBtn: {
    textDecoration: "none !important",
  },
  arrow: {
    marginLeft: theme.spacing(1),
  },
  tag: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.warning.light,
    color: theme.palette.text.hint,
  },
  small: {
    width: "32px",
    height: "32px",
  },
  actionWrapper: {
    justifyContent: "space-between",
    marginTop: "auto",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    paddingTop: theme.spacing(2),
    "& .Mui-selected": {
      color: theme.palette.text.hint,
      background: `${theme.palette.background.paper} !important`,
      boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
      borderRadius: '8px 8px 8px 0px'
    },
    "& .MuiPaginationItem-root": {
      fontWeight: "bold",
    },
  },
  cardContent: {
    padding: theme.spacing(4, 0),
  },
  rightSpacing: {
    border: "none",
    background: "none",
    marginRight: theme.spacing(1),
    cursor: "pointer",
  },
  tabWrapper: {
    display: "flex",
    overflow: "scroll",
    paddingBottom: '2px',
    width: "70%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  blogFooter: {
    background:  'url(/Images/png/blog_index_background.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    [theme.breakpoints.down('xs')]: {
      background:  'url(/Images/png/blog_index_background_mobile.png)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  }
}));

export default useStyles;
