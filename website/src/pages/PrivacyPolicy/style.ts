import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(14),
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.spacing(10)
        },
    },
    pageSpacing: {
        padding: theme.spacing(0,39),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(0,15),
        },
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0,10),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0,5),
        },
    },
    pageHeader: {
        fontSize: '2.625rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: theme.spacing(5),
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.5rem',
        },
    },
    sectionHeader: {
        fontSize: '2rem',
        fontWeight: 700,
        marginTop: theme.spacing(7),
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.25rem',
        },
    },
    sectionSubHeader: {
        fontSize: '1.125rem',
        fontWeight: 700,
        marginTop: theme.spacing(3),
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.875rem',
        },
    },
    bodyText: {
        fontSize: '1rem',
        fontWeight: 400,
        color: theme.palette.text.secondary,
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.875rem',
        },
    },
    link: {
        color: theme.palette.warning.main
    },
    listItem: {
        '&::marker': {
            color: theme.palette.info.light,
            fontSize: '1.5rem'
        },
        marginBottom: theme.spacing(1.5)
    },
    background: {
        background:  'url(/Images/png/privacy_policy_background.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        [theme.breakpoints.down('md')]: {
            backgroundSize: 'cover',
        },
        [theme.breakpoints.down('xs')]: {
            background:  'url(/Images/png/privacy_policy_mobile_background.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPositionY: 'bottom',
            backgroundPositionX: 'left'
        },
    },
    lastDiv: {
        marginBottom: theme.spacing(8)
    },
    footer: {
        gridArea: "footer",
        width: '100%',
        position: 'relative',
        bottom: 0
      },
}))
export default useStyles;
  