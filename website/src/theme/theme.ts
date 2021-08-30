import { createTheme } from './base';

const theme = createTheme({
  palette: {
    primary: {
      main: '#223288',
      light: '#969EC9',
      dark: '#3B4473',
    },
    secondary: {
      main: '#F26D00',
      light: '#FFE2D5',
    },
    text: {
      primary: '#223288',
      secondary: '#3B4473',
      disabled: '#969EC9',
      hint: '#A4451B',
    },
    success: {
      main: '#3D9086',
      light: '#B2EFE8',
      dark: '#073D47',
      contrastText: '#6A5711',
    },
    info: {
      main: '#DBF0F7',
      light: '#62A7BD',
      dark: '#A0B8BF',
    },
    warning: {
      main: '#F26D00',
      light: '#FFE2D5',
    },
    error: {
      main: '#FD3232',
      light: '#FFCDCD',
    },
    background: {
      default: '#FBFCFF',
      paper: '#fff',
    },
    divider: '#AECEE5',
    blue: {
      main: '#669DDD',
      light: '#EDF6FF',
    },
    purple: {
      main: '#DCDBF7',
    },
    rawUmber: {
      main: '#6A5711',
      light: '#FFEDAD',
    },
    brown: {
      main: '#963D16',
      dark: '#2A140B',
    },
    grayishGreen: {
      main: '#5A6F74',
      light: '#D3D7D8',
      dark: '#273239',
    },
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.73)',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        borderRadius: '154px',
        fontWeight: 700,
        padding: '15px',
      },
      contained: {
        boxShadow: '0px 11px 33px rgba(255, 220, 179, 0.62)',
        width: '212px',
      },
      containedSecondary: {
        '&:hover': {
          backgroundColor: '#F26D00',
        },
      },
      outlined: {
        padding: '13px',
        width: '212px',
      },
      outlinedSecondary: {
        border: '2px solid #F26D00',
        '&:hover': {
          borderWidth: '2px',
          backgroundColor: 'transparent',
        },
      },
    },
  },
});
export default theme;
