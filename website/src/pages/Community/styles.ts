import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
    width: "100%",
    marginTop: theme.spacing(6)
  },
  communityBackground: {
    background: "url(/Images/png/community_background.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    [theme.breakpoints.down("xs")]: {
      background: "transparent",
    },
  },
  pageHeader: {
    fontSize: "2.625rem",
    fontWeight: 700,
    textAlign: "start",
    marginBottom: theme.spacing(5),
    color: theme.palette.text.primary,
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.5rem",
      textAlign: "center",
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(4),
    },
  },
  introImage: {
      width: "auto",
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(0),
      width: "100%",
    },
  },
  supportDescription: {
    color: theme.palette.text.secondary,
    fontSize: '1rem',
    lineHeight: '22px',
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.875rem",
      textAlign: "20px"
    },
  },
  supportImage: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  paper: {
    boxShadow: "none",
    backgroundColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(4, 0)
    },
    
  },
  sectionDiv: {
    padding: theme.spacing(3, 20),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(3, 10),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3, 4),
    },
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.25rem",
    },
  },
  contributionSubTitle: {
    fontSize: '1.125rem',
    [theme.breakpoints.down("xs")]: {
      fontSize: "1rem",
    },
  },
  iconHolder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.75rem",
    height: "3.75rem",
    background: theme.palette.common.white,
    boxShadow: "0px 14.5357px 47px 14px rgb(119 116 232 / 10%)",
    borderRadius: "17.7478px 17.7478px 17.7478px 0px",
    marginBottom: theme.spacing(2),
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.875rem",
    },
  },
  installationDiv: {
    background: "url(/Images/png/community_desktop.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    [theme.breakpoints.down("xs")]: {
      background: "url(/Images/png/community_mobile.png)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
  },
  solidButton: {
    marginRight: theme.spacing(2.5),
    width: '168px',
    fontSize: '0.875rem',
    padding: theme.spacing(1.5)
  },
  sponsorWrapper:{
    marginTop: theme.spacing(12),
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(0),
    },
  },
  sponsorCompany: {
      padding: theme.spacing(0,2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
      width: '25%'
    },
  },
  rancher: {
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
      width: '40%'
    },
  },
  sponsorDescription: {
    fontSize: '1rem',
    lineHeight: '22px',
    width: '292px',
    margin: '0 auto 32px',
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.down("xs")]: {
      width: '95%',
      margin: '0 auto 0',
      fontSize: '14px',
    },
  },
  sponsorDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(6),
    },
    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(2),
    },
  },
  mayaDataLogo: {
    [theme.breakpoints.down("xs")]: {
      width: '60%',
      margin: theme.spacing(1.5,0)
    },
  },
  footer: {
    gridArea: "footer",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
  sliderFullWidth: {
    "& div.slick-active": {
      "& + .slick-active": {
        "& + .slick-slide": {
          "&  > div": {
            opacity: 1,
          },
        },
      },
    },
    "& .slick-next": {
      right: '-25px',
    },
  },
  noEventText: {
    textAlign: 'center',
    fontSize: '30px',
    margin: theme.spacing(4, 0),
    [theme.breakpoints.down('sm')]: {
        fontSize: '19px'
    }
}
}));

export default useStyles;
