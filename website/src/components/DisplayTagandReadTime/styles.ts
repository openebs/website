import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    readTime: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: theme.palette.primary.light
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
