import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  readTime: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: theme.palette.primary.light,
    [theme.breakpoints.down("xl")]: {
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.down("sm")]: {
      paddingRight: theme.spacing(0),
    },
  },
  wrapperBlock: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardActionButton: {
    textTransform: "none",
    color: theme.palette.warning.main,
    fontWeight: 700,
    marginRight: theme.spacing(2),
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  rightSpacing: {
    marginRight: theme.spacing(1),
  },
  author: {
    display: "flex",
    alignItems: "center",
  },
}));

export default useStyles;
