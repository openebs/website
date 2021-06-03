import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
    width: "100%",
  },
  introSection: {
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(10, 20),
    },
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(9, 6),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 3),
    },
  },
  pageHeader: {
    fontSize: "2.625rem",
    fontWeight: 700,
    textAlign: "start",
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.5rem",
      textAlign: "center",
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

  paper: {
    boxShadow: "none",
    backgroundColor: "transparent",
    padding: theme.spacing(4),
  },
  sectionDiv: {
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(3, 20),
    },
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(0),
    },
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  iconHolder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.75rem",
    height: "3.75rem",
    background: theme.palette.common.white,
    boxShadow: "0px 14.5357px 47px 14px rgb(119 116 232 / 10%)",
    borderRadius: "17.7478px 17.7478px 17.7478px 0px",
    marginBottom: theme.spacing(2),
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down("xl")]: {
      paddingRight: theme.spacing(8),
    },
    [theme.breakpoints.down("md")]: {
      paddingRight: theme.spacing(0),
    },
  },
  installationDiv: {
    zIndex: -1,
    [theme.breakpoints.down("xl")]: {
      background: "url(/Images/png/community_desktop.png)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
    [theme.breakpoints.down("sm")]: {
      background: "url(/Images/png/community_mobile.png)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
  },

  solidButton: {
    marginRight: theme.spacing(2.5),
  },

  sponsorRoot: {
    background: "transparent",
    width: "100%",
    fontSize: "0.875rem",
    fontWeight: 400,
    textAlign: "center",
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(10, 8),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1, 0),
    },
  },
  sponsorCompany: {
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
    },
  },
  sponsorDescription: {
    padding: theme.spacing(4),
  },

  footer: {
    gridArea: "footer",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
}));

export default useStyles;
