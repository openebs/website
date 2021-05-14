import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  newsletter: {
    marginTop: theme.spacing(8),
    width: "100%",
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.light,
    padding: theme.spacing(5, 1),
    position: "relative",
    textAlign: "center",
  },
  textField: {
    textAlign: "center",
    [theme.breakpoints.down("xl")]: {
      padding: theme.spacing(3.5, 2),
    },
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(3.5, 2),
    },
  },
  newsWrapper: {
    display: "grid",
    justifyContent: "center",
  },
  newsletterInput: {
    color: theme.palette.common.white,
    fontSize: "14px",
    "&&&:before": {
      borderBottom: "none",
    },
    "&&:after": {
      borderBottom: "none",
    },
    borderBottom: `1px solid ${theme.palette.common.white}`,
    padding: theme.spacing(0.5, 0),
  },
  newsletterLabel: {
    color: theme.palette.common.white,
    fontSize: "0.875rem",
  },
  newsletterFormWrapper: {
    display: "flex",
  },
  solidButton: {
    marginRight: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
