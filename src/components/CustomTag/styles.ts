import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tag: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
  },

  chaosengineering: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.rawUmber.light,
    color: theme.palette.success.contrastText,
  },
  devops: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.purple.main,
    color: theme.palette.primary.main,
  },
  tutorials: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.error.light,
    color: theme.palette.secondary.main,
  },
  openebs: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.info.main,
    color: theme.palette.info.light,
  },
  solutions: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.success.light,
    color: theme.palette.success.main,
  },
  secondary: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.main,
  },
}));

export default useStyles;
