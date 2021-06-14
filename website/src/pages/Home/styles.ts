import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    landingImage: {
        position: 'absolute',
        right: 0,
        [theme.breakpoints.down('md')]: {
            width: '58%'
        },
        [theme.breakpoints.down('xs')]: {
            width: '95%'
        },
    },
    paper: {
        boxShadow: 'none',
        backgroundColor: 'transparent'
    },
    firstGrid: {
        zIndex: 1
    },
    firstPaper: {
        marginTop: theme.spacing(20),
        padding: theme.spacing(5, 3, 5, 11),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(5, 3, 5, 5),
            marginTop: theme.spacing(10),
        },
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.spacing(15),
        },
        [theme.breakpoints.down('xs')]: {
            marginTop: theme.spacing(10),
            padding: theme.spacing(2.5, 0, 5, 2.5),
        },
    },
    firstSectionTitle: {
        fontSize: '2.625rem',
        fontWeight: 700,
        color: theme.palette.primary.main,
        lineHeight: '3.375rem',
        [theme.breakpoints.down('md')]: {
            fontSize: '2rem',
            lineHeight: '2.375rem',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.5rem',
            lineHeight: '1.75rem',
        },
    },
    secondGrid: {
        marginTop: theme.spacing(10)
    },
    tabButton: {
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 700,
        color: theme.palette.text.secondary,
        opacity: 1,
        padding: theme.spacing(2),
        maxWidth: 'fit-content',
        minWidth: '124px',
        margin: theme.spacing(4, 0),
        '&.Mui-selected': {
            color: theme.palette.text.hint,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '2px 0px 33px 5px rgba(70, 68, 151, 0.04)',
            borderRadius: '12px 12px 12px 0px',
            '&:hover': {
                color: theme.palette.text.hint,
            }
        },
        '&:hover': {
            color: theme.palette.warning.main,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '14px',
            padding: theme.spacing(1),
            minWidth: '88px',
            margin: theme.spacing(4, 1)
        },
    },
    tabsIndicator: {
        backgroundColor: 'transparent'
    },
    tabBodyText: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.375rem',
        color: theme.palette.grayishGreen.main,
        marginBottom: theme.spacing(4),
        position: 'relative',
        zIndex: 1,
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.875rem',
        },
    },
    solidButton: {
        marginRight: theme.spacing(2.5),
        [theme.breakpoints.down('xs')]: {
            marginRight: theme.spacing(0),
            width: '100%',
            padding: theme.spacing(1.2)
        },
    },
    outlineButton: {
        [theme.breakpoints.down('xs')]: {
            marginTop: theme.spacing(2),
            width: '100%',
            padding: theme.spacing(1.2)
        },
    },
    tabsWrapper: {
        margin: theme.spacing(22, 3, 0)
    },
    logoCarousel: {
        marginTop: theme.spacing(6)
    },
    sectionDiv: {
        padding: theme.spacing(3,20),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(3,5),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(3),
        },
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: theme.spacing(3),
        color: theme.palette.text.primary,
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.25rem',
            maxWidth: '250px',
            margin: 'auto',
            marginBottom: theme.spacing(3)
        },
    },
    iconHolder: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px',
        background: 'white',
        boxShadow: '0px 14.5357px 47px 14px rgb(119 116 232 / 10%)',
        borderRadius: '17.7478px 17.7478px 17.7478px 0px',
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            minWidth: '52px',
            minHeight: '52px',
            maxHeight: '52px',
            marginRight: theme.spacing(1.2),
            '& img': {
                width: '45%'
            }
        },
    },
    description: {
        color: theme.palette.text.secondary,
        fontSize: '1rem'
    },
    iconTextContainer: {
        margin: theme.spacing(6),
        [theme.breakpoints.down('md')]: {
            margin: theme.spacing(3),
        },
        [theme.breakpoints.down('xs')]: {
            display: 'flex',
            margin: theme.spacing(0),
        },
    },
    installationDiv: {
        background:  'url(/Images/png/homepage_installation_background.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        padding: theme.spacing(9, 20, 0),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(9, 5, 0),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(4, 2, 0),
            background:  'url(/Images/png/homepage_installation_background_mobile.png)',
            backgroundSize: 'cover',
            // backgroundPositionX: '-300px' homepage_installation_background_mobile.png
        },
    },
    sectionSubTitle: {
        fontSize: '1.375rem',
        fontWeight: 700,
        color: theme.palette.text.secondary,
        textAlign: 'center',
        [theme.breakpoints.down('xs')]: {
            fontSize: '1rem',
            fontWeight: 400,
            maxWidth: '200px',
            margin: 'auto'
        },
    },
    codeText: {
        fontFamily: 'Menlo',
        fontSize: '1rem',
        marginRight: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            whiteSpace: 'nowrap',
            maxWidth: '285px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.875rem',
        },  
    },
    codeWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(2)
    },
    divider: {
        border: 0,
        borderBottom: `1px solid ${theme.palette.primary.main}`,
        margin: 'auto',
        flex: '100% 0 1',
        maxWidth: '58%',
        [theme.breakpoints.down('md')]: {
            maxWidth: '68%',
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: '95%',
        },
    },
    middleButton: {
        display: 'block',
        margin: 'auto',
        textAlign: 'center'
    },
    orSeparatorText: {
        fontSize: '0.875rem',
        fontWeight: 400,
        textAlign: 'center',
        margin: theme.spacing(2,0),
    },
    installationDescriptionWrapper: {
        margin: theme.spacing(4,26),
        [theme.breakpoints.down('md')]: {
            margin: theme.spacing(4,10),
        },
        [theme.breakpoints.down('xs')]: {
            margin: theme.spacing(4),
        },
    },
    installationDescription: {
        fontSize: '1rem',
        fontWeight: 400,
        textAlign: 'center',
    },
    installationCodeWrapper: {
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column'
        },
    },
    desktopImage: {
        minWidth: '650px',
        [theme.breakpoints.down('md')]: {
            width: '100%',
            minWidth: '580px',
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            minWidth: '400px',
        },
    },
    installationButton: {
        background: theme.palette.background.paper,
        boxShadow: '0px 4px 34px 12px #B3D8E5',
        borderRadius: '8px',
        width: '184px',
        marginBottom: theme.spacing(3),
        '&:hover':{
            background: theme.palette.info.light,
            color: theme.palette.background.paper,
            boxShadow: 'inherit'
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.875rem',
            width: '136px',
            padding: theme.spacing(1)
        },
    },
    installationButtonActive: {
        background: theme.palette.info.light,
        color: theme.palette.background.paper
    },
    installationButtonsWrapper: {
        margin: theme.spacing(8, 0),
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            flexDirection: 'column',
            margin: theme.spacing(2, 0),
        },
    },
    installationLeftButton: {
        float: 'right'
    },
    installationRightButton: {

    },
    installationButtonDiv: {
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            justifyContent: 'space-evenly'
        },
    },
    desktopCommandWrapper: {
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
    installationProviderCommandWrapper: {
        position: 'absolute',
        top: '0',
        padding: theme.spacing(6,10),
        width: '100%',
        color: theme.palette.success.dark,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(6,12),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(3,2),
        },
    },
    installationProvider: {
        fontSize: '1rem',
        fontWeight: 700,
        textAlign: 'center',
        [theme.breakpoints.down('xs')]: {
            fontSize: '8px',
        },
    },
    testimonialCarousel: {
        '& .slick-prev': {
            left: '120px',
            zIndex: 1,
            [theme.breakpoints.down('sm')]: {
                left: '90px',
            },
            [theme.breakpoints.down('xs')]: {
                left: '-20px',
            },
        },
        '& .slick-list': {
            paddingLeft: `${theme.spacing(16)}px !important`
        },
        [theme.breakpoints.down('sm')]: {
            '& .slick-list': {
                paddingLeft: `${theme.spacing(13)}px !important`
            },
        },
        [theme.breakpoints.down('xs')]: {
            '& .slick-list': {
                paddingLeft: `${theme.spacing(1.7)}px !important`
            },
        },
    },
    testimonialPaper: {
        width: '744px',
        [theme.breakpoints.down('md')]: {
            width: '600px',
        },
        [theme.breakpoints.down('sm')]: {
            width: '460px',
        },
        [theme.breakpoints.down('sm')]: {
            width: '410px',
        },
    },
    testimonialWrapper: {
        padding: theme.spacing(6),
        boxShadow: '0px 11px 33px rgba(193, 192, 243, 0.07)',
        borderRadius: '20px 60px 20px 0px',
        background: theme.palette.background.paper,
        margin: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(4),
            margin: theme.spacing(2),
        },
    },
    testimonialTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: theme.palette.text.secondary,
        marginTop: theme.spacing(2),
        wordBreak: 'break-word'
    },
    testimonialText: {
        fontSize: '1rem',
        fontWeight: 400,
        color: theme.palette.text.secondary,
        marginTop: theme.spacing(2),
        wordBreak: 'break-word'
    },
    testimonialWriter: {
        fontSize: '1rem',
        fontWeight: 400,
        color: theme.palette.text.disabled
    },
    testimonialWriterWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: theme.spacing(3)
    },
    testimonialMule: {
        margin: theme.spacing(0,4),
        '& img': {
            width: '100%'
        }
    },
    testimonialMuleWrapper: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down('xs')]: {
            marginBottom: theme.spacing(4),
        },
    },
    readyToStartSection: {
        padding: theme.spacing(8, 15, 0, 7.4),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(8, 5),
        },
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(6, 3),
        },
    },
    codeTextHalfWidth: {
        justifyContent: 'flex-start',
        marginLeft: theme.spacing(6),
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('md')]: {
            marginLeft: theme.spacing(0),
        },
    },
    codeTextHalfWidthText: {
        whiteSpace: 'nowrap',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        [theme.breakpoints.down('md')]: {
            maxWidth: '256px',
        },
        [theme.breakpoints.down('xs')]: {
            maxWidth: '280px',
        },
    },
    codeTextHalfWidthUnderline: {
        maxWidth: '75%',
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(0),
        [theme.breakpoints.down('md')]: {
            maxWidth: 'unset',
        },
    },
    codeTextDescription: {
        fontSize: '16px',
        fontWeight: 400,
        marginTop: theme.spacing(2),
        maxWidth: '60%',
        [theme.breakpoints.down('md')]: {
            maxWidth: 'unset',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.875rem',
        },
    },
    flyingMuleWrapper:{
        [theme.breakpoints.down('md')]: {
            margin: theme.spacing(0,20)
        },
        [theme.breakpoints.down('xs')]: {
            margin: theme.spacing(0)
        },
    },
    flyingMule: {
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
    },
    readGuideDiv: {
        borderBottom: `1px solid ${theme.palette.primary.main}`,
    },
    readGuideLink: {
        display: 'flex',
        justifyContent: 'space-between',
        "&:hover": {
            textDecoration: 'none'
        }
    },
    iconButton: {
        borderRadius: 0,
        paddingRight: theme.spacing(0)
    },
    readGuideTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem',
        },
    },
    readGuideDescription: {
        fontSize: '16px',
        fontWeight: 400,
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem',
        },
    },
    centerContent: {
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    footerBackground: {
        background:  'url(/Images/png/home_footer_background.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPositionX: 'left',
        [theme.breakpoints.down('md')]: {
            backgroundSize: 'contain',
        },
        [theme.breakpoints.down('sm')]: {
            backgroundSize: 'cover',
        },
        [theme.breakpoints.down('xs')]: {
            background:  'url(/Images/png/home_footer_background_mobile.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        },
    },
    footer: {
        gridArea: "footer",
        width: '100%',
        position: 'relative',
        bottom: 0
      },
}))
export default useStyles;
  