import { createMuiTheme, ThemeOptions } from '@material-ui/core';

declare module '@material-ui/core/styles/createPalette' {
  export interface Palette {
    // Base Theme Palette
    primary: {
      main: string,
      light: string,
      dark: string,
      contrastText: string
    },
    secondary: {
        light: string,
        main: string,
        dark: string,
        contrastText: string
    },
    text: {
        primary: string,
        secondary: string,
        disabled: string,
        hint: string
    },
    success: {
        main: string,
        light: string,
        dark: string,
        contrastText: string
    },
    info: {
        main: string,
        light: string,
        dark: string,
        contrastText: string
    },
    warning: {
        main: string,
        light: string,
        dark: string,
        contrastText: string,
    },
    error: {
        main: string,
        light: string,
        dark: string,
        contrastText: string,
    },
    background: {
        paper: string,
        default: string
    },
    divider: string,
    blue: Palette['primary'],
    purple: Palette['primary'],
    rawUmber: Palette['primary'],
    brown: Palette['primary'],
    grayishGreen: Palette['primary'],
  }
  interface PaletteOptions {
    blue: PaletteOptions['primary'];
    purple: PaletteOptions['primary'];
    rawUmber: PaletteOptions['primary'];
    brown: PaletteOptions['primary'];
    grayishGreen: PaletteOptions['primary'];
  }
}

// Function for creating custom themes

function createTheme(themeOptions?: ThemeOptions) {
  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    typography: {
      fontSize: 16,
      fontFamily: ['Montserrat',
        'sans-serif'].join(','),
    },
    ...themeOptions,
  });
}

export { createTheme };
