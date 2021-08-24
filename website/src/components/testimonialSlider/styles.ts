import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  testimonialCarousel: {
    '& .slick-slide:not(.slick-active)': {
      opacity: '.3',
    },
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
      paddingLeft: `${theme.spacing(16)}px !important`,
    },
    [theme.breakpoints.down('sm')]: {
      '& .slick-list': {
        paddingLeft: `${theme.spacing(13)}px !important`,
      },
    },
    [theme.breakpoints.down('xs')]: {
      '& .slick-list': {
        paddingLeft: '0 !important',
        paddingRight: `${theme.spacing(6.25)}px important`,
      },
    },
    '& .slick-arrow': {
      '&:before': {
        display: 'none',
      },
    },
    '& .slick-track': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  testimonialWrapper: {
    padding: theme.spacing(6),
    boxShadow: '0px 11px 33px rgba(193, 192, 243, 0.07)',
    borderRadius: '20px 60px 20px 0px',
    background: theme.palette.background.paper,
    margin: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4, 2),
      margin: theme.spacing(2, 1.5),
    },
  },
  testimonialTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    wordBreak: 'break-word',
  },
  testimonialText: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
    },
  },
  testimonialWriter: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.disabled,
  },
  testimonialWriterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: theme.spacing(3),
  },
}));

export default useStyles;
