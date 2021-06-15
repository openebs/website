import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  imageFluid: {
    "& img": {
      width: "100%",
    },
  },
  slide: {
    background: "#fff",
    margin: "0",
    padding: "32px",
    boxShadow: "0px 11px 33px rgba(193, 192, 243, 0.06)",
    borderRadius: "20px 40px 20px 0px",
    transition: "all 0.3s ease-out",
    '&:hover $actionLInk':{
      display:'inherit'
    }
  },
  actionLInk:{
    display: 'none',
  },
  slidewrap: {
    margin: "20px 0 20px 20px",
    "& div.slick-active": {
      "& + .slick-active": {
        "& + .slick-slide": {
          "&  > div": {
            opacity: ".3",
          },
        },
      },
    },
    [theme.breakpoints.down("sm")]: {
      "& div.slick-active": {
        "& + .slick-active": {
          "&  > div": {
            opacity: ".3",
          },
        },
      },
    },
    "&  div.slick-slide": {
      "&  > div": {
        padding: "20px",
      },
    },
    "& .slick-next": {
      right: "30%",
    },
    "& .slick-disabled": {
      opacity: 0.5,
    },
    '& .slick-arrow':{
        '&:before':{
            display:'none'
        }
    }
  },
  titleText: {
    fontSize: "22px",
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  subText: {
    fontSize: "16px",
    color: theme.palette.primary.dark,
  },
  linkText: {
    color: theme.palette.secondary.main,
    fontWeight: 700,
    "& img": {
      marginLeft: "1rem",
    },
  },
  slickButtons: {
    display: 'block'
  },
}));

export default useStyles;
