import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    backgroundImage: `url(${"/assets/images/faq_background.png"})`,
    textAlign: "center",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    backgroundSize: "cover",
    padding: theme.spacing(12, 5, 0),
  },
  tabLayout: {
    orientation: "vertical",
  },
  authorWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  large: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    marginRight: theme.spacing(4),
  },
  tabs: {
    maxWidth: "auto",
    margin: `${theme.spacing(1)}px auto`,
    padding: theme.spacing(0.3),
    backgroundColor: theme.palette.common.white,
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: "2px 0px 33px 5px rgba(70, 68, 151, 0.04)",
  },
  mainText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    margin: theme.spacing(8, 50),
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(8, 30),
    },
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(8, 10),
    },
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(4, 0),
      fontSize: "24px",
    },
  },
  authorText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    margin: theme.spacing(3, 0),
    justifyContent: "center",
    alignItems: "center",
  },
  authorDesc: {
    paddingBottom: theme.spacing(3),
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
  cardWrapper: {
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(4, 16),
    },
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(4, 10),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 4),
    },
  },
  cardRoot: {
    maxWidth: "480px",
    boxShadow: "none",
    background: "transparent",
    margin: "auto",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      maxWidth: "380px",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "480px",
    },
  },
  rootBlogSection: {
    flexGrow: 1,
  },
  cardSize: {
    paddingTop: theme.spacing(4),
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
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
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
      backgroundColor: "transparent !important",
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
  tabWapper: {
    display: "flex",
    overflow: "scroll",
    width: "70%",
    [theme.breakpoints.down("sm")]: {
      display: "inlineBlock",
      width: "100%",
    },
  },
}));

export default useStyles;
