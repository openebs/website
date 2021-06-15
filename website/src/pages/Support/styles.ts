import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
    width: "100%",
  },
  introSection: {
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(8, 20),
    },
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(8, 6),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 3),
    },
  },
  pageHeader: {
    fontSize: "2.625rem",
    fontWeight: 700,
    textAlign: "start",
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.5rem",
      textAlign: 'center',
    },
  },
  introImage: {
    [theme.breakpoints.down("xl")]: {
      width: "auto",
    },
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(0),
      width: "100%",
    },
  },
  supportDescription: {
    [theme.breakpoints.down("xl")]: {
      paddingLeft: theme.spacing(16),
      paddingTop: theme.spacing(0),
    },
    [theme.breakpoints.down("md")]: {
      paddingLeft: theme.spacing(0),
      paddingTop: theme.spacing(6),
    },
  },
  supportImage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  //Supported companies card styles
  cardWrapper: {
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(6, 20),
    },
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(6, 6),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 3),
    },
  },
  cardSection: {
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(0, 2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 0),
    },
  },
  cardProps: {
    padding: theme.spacing(2),
    position: "relative",
    height: "95%",
    borderRadius: "20px 60px 20px 0px",
    boxShadow: "0px 11px 33px 29px rgba(193, 192, 243, 0.06)",
    "&:hover $cardAction": {
      visibility: "visible",
      bottom: '10px'
    },
    "&:hover": {
      height: "120%",
      boxShadow: "0px 4px 34px 21px rgba(70, 68, 151, 0.04)",
      borderRadius: "20px 20px 60px 0px",
    },
  },
  cardAction: {
    visibility: "hidden",
    position: "absolute",
    paddingTop: theme.spacing(2),
  },
  cardText: {
    padding: theme.spacing(1, 0),
    fontSize: "1rem",
  },
  cardImage: {
    height: "3.75rem",
    [theme.breakpoints.down("xl")]: {
      width: "10rem",
    },
    [theme.breakpoints.down("lg")]: {
      width: "7.5rem",
    },
  },
  cardActionButton: {
    textTransform: "none",
    color: theme.palette.warning.main,
    fontWeight: 700,
    marginRight: theme.spacing(2),
  },
  linkBtn: {
    textDecoration: 'none !important',
  },
  arrow: {
    marginLeft: theme.spacing(1),
  },
  footer: {
    gridArea: "footer",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
}));

export default useStyles;
