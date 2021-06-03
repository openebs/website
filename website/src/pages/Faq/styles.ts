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
  mainSection: {
    position: "relative",
    textAlign: "center",
    display: "flex",
    zIndex: 100,
  },
  mainText: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "center",
    margin: theme.spacing(8, 0),
    justifyContent: "center",
    alignItems: "center",
  },
  tabLayout: {
    orientation: "vertical",
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
  heading: {
    fontSize: "pxToRem(15)",
    fontWeight: 400,
  },
  headingSelected: {
    fontSize: "pxToRem(15)",
    fontWeight: 700,
  },
  accordionRoot: {
    width: "100%",
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(5, 32, 0),
    },
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2, 8),
    },
  },
  buttonIcon: {
    color: theme.palette.warning.main,
  },
  accordion: {
    width: "100%",
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2),
    boxShadow: "2px 5px 31px 4px rgba(70, 68, 151, 0.07)",
  },
  details: {
    borderTop: "2px solid",
    borderColor: theme.palette.grayishGreen.light,
    paddingTop: theme.spacing(2),
  },
  footer: {
    gridArea: "footer",
    width: '100%',
    position: 'relative',
    bottom: 0,
  },
  MuiAccordionroot: {
    "&.MuiAccordion-root:before": {
      backgroundColor: theme.palette.common.white,
    }
  }
}));

export default useStyles;
