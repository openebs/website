import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    textAlign: "center",
    padding: theme.spacing(5, 5, 0),
  },
  tabLayout: {
    orientation: "vertical",
  },
  tabs: {
    maxWidth: "auto",
    margin: `${theme.spacing(1)}px auto`,
    padding: theme.spacing(0.3),
    backgroundColor: "transparent",
    flexGrow: 1,
    fontWeight: 700,
    boxShadow: "2px 0px 33px 5px rgba(70, 68, 151, 0)",
  },
  mainText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    margin: theme.spacing(8, 0),
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    gridArea: "footer",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
  cardWrapper: {
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(4, 18),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 4),
    },
  },
  cardRoot: {
    maxWidth: "480px",
    boxShadow: 'none',
    background: 'transparent'
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
    borderRadius: '24px 24px 24px 0px'
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
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
    marginRight: theme.spacing(2),
  },
  linkBtn: {
    textDecoration: "none !important",
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
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  actionWrapper: {
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
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
  rightSpacing: {
    border: "none",
    background: "none",
    marginRight: theme.spacing(1),
    cursor: "pointer",
  },
}));

export default useStyles;
