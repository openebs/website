import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  imageFluid: {
    '& img': {
      width: '100%',
    },
  },
  slide: {
    background: theme.palette.background.paper,
    margin: '0',
    padding: theme.spacing(4),
    boxShadow: '0px 11px 33px rgba(193, 192, 243, 0.06)',
    borderRadius: '20px 40px 20px 0px',
    transition: 'all 0.3s ease-out',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  noEventLink: {
    color: theme.palette.text.primary,
  },
  actionLink: {
    display: 'inherit',
  },
  slidewrap: {
    '& .slick-next': {
      right: '30%',
    },
    '& .slick-slide:not(.slick-active)': {
      opacity: '.5',
    },
    margin: theme.spacing(2, 0, 2, 2),
    '& div.slick-active': {
      '& + .slick-active': {
        '& + .slick-slide:not(:last-child)': {
          '&  > div': {
            opacity: '.3',
            pointerEvents: 'none',
          },
        },
      },
    },
    '& .slick-track': {
      margin: 'auto',
    },
    [theme.breakpoints.down('sm')]: {
      '& div.slick-active': {
        '& + .slick-active:not(:last-child)': {
          '&  > div': {
            opacity: '.3',
          },
        },
      },
    },
    [theme.breakpoints.down('md')]: {
      margin: '0 40px',
      '& .slick-next': {
        right: '-25px',
      },
      '& .slick-slide:not(.slick-active):not(:first-child)': {
        opacity: '.5',
      },
    },
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0, 0, 2, 1.2),
    },
    '&  div.slick-slide': {
      '&  > div': {
        padding: theme.spacing(2.5),
        [theme.breakpoints.down('xs')]: {
          padding: theme.spacing(1.25),
        },
      },
    },
    '& .slick-disabled': {
      opacity: 0.5,
    },
    '& .slick-arrow': {
      '&:before': {
        display: 'none',
      },
    },
    '& .slick-list': {
      [theme.breakpoints.down('xs')]: {
        padding: `${theme.spacing(0)} !important`,
      },
    },
    '& .slick-center': {
      '& $actionLink': {
        [theme.breakpoints.down('xs')]: {
          display: 'inherit',
        },
      },
    },
  },
  titleText: {
    fontSize: '22px',
    fontWeight: 700,
    color: theme.palette.primary.main,
    [theme.breakpoints.down('sm')]: {
      fontSize: '16px',
    },
  },
  subText: {
    fontSize: '16px',
    color: theme.palette.primary.dark,
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
    },
  },
  linkText: {
    color: theme.palette.secondary.main,
    fontWeight: 700,
    '& img': {
      marginLeft: '1rem',
    },
  },

  noEventText: {
    fontSize: '30px',
    textAlign: 'center',
    minHeight: '150px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '19px',
    },
  },
}));

export default useStyles;
