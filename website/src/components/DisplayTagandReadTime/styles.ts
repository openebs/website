import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    readTime: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: theme.palette.primary.light,
        // [theme.breakpoints.down("xl")]: {
        //   paddingRight: theme.spacing(4),
        // },
        // [theme.breakpoints.down("sm")]: {
        //   paddingRight: theme.spacing(0),
        // },
      },
      wrapperBlock: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      rightSpacing: {
        marginRight: theme.spacing(1),
      },
}));

export default useStyles;
