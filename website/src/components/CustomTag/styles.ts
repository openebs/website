import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tag: {
    fontSize: 16,
    width: "fit-content",
    padding: theme.spacing(0.1, 4),
    borderRadius: "8px",
    lineHeight: "8px",
    cursor: "pointer",
  },
}));

export default useStyles;
