import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(8,30),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(8),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(3),
        },
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: theme.spacing(5.5),
        color: theme.palette.text.primary,
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.25rem',
            padding: theme.spacing(0,5),
        },
    },
    paper: {
        padding: theme.spacing(6),
        color: theme.palette.text.secondary,
        height: '320px',
        boxShadow: '0px 11px 33px 29px rgba(193, 192, 243, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        transition: '150ms',
        WebkitTransition: '150ms',
        transform: 'perspective(1000px) rotateY(0deg)',
        WebkitTransform: 'perspective(1000px) rotateY(0deg)',

        '& div': {
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',    
        }
    },
    leftPaper: {
        borderRadius: '60px 20px 0px'
    },
    rightPaper: {
        borderRadius: '20px 20px 60px 0px'
    },
    flippedCard: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between'
    },
    flippedLogo: {
        width: '34%'
    },
    formWrapper: {
        display: "flex",
    },
    input: {
        fontSize: '0.875rem',
        "&&&:before": {
        borderBottom: "none"
        },
        "&&:after": {
        borderBottom: "none"
        },
        borderBottom: `1px solid ${theme.palette.primary.main}`,
        padding: theme.spacing(0.5,0)
    },
    label: {
        color: theme.palette.text.secondary,
        fontSize: '0.875rem'
    },
    iconButton: {
        borderBottom: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 0
    },
    cardTitle: {
        fontSize: '1.375rem',
        fontWeight: 700,
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(2)
    },
    cardBodyText: {
        fontSize: '1rem',
        fontWeight: 400
    },
    cardButton: {
        width: '168px',
        padding: theme.spacing(1.5),
    },
    front: {
        position: 'absolute',
        transform: 'rotateY(0)',
        WebkitTransform: 'rotateY(0)'
    },
    back: {
        position: 'relative',
        height: '100%',
        transform: 'rotateY(180deg)',
        WebkitTransform: 'rotateY(180deg) translateZ(1px)',
    },
    flip: {
        transform: 'rotateY(180deg)',
        WebkitTransform: 'rotateY(180deg)',
    }
}))
export default useStyles;
  