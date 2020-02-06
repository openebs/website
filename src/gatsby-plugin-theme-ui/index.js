// import './custom.css'

export default {
  colors: {
    text: `#333`,
    background: `#EFEFF2`,
    primary: `#F26D00`,
    secondary: `#ff6347`,
    dark: `#212529`,
    bluesky: `#3eb0ef`,
    black: '#23232A',
    cyan: '#1BE0E6',
    aqua: '#006EAC',
    blue: '#0063FF',
    gray: '#D1D2D9',
    gray400: '#7D7E8D',
    darkGray: '#626372',
    darkOrange: '#CE5F00',
    extraDarkOrange: '#A95000',
    lightOrange: `#FFB78A`,
    light: `#EFEFF2`,
  },
  fonts: {
    body: '"Lato","Open Sans", sans-serif',
    heading: '"Lato","Open Sans", sans-serif',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 300,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 56, 64, 96],
  breakpoints: [`40em`, `56em`, `64em`, `78em`],
  sizes: {
    container: [`76em`],
  },
  radii: 2,
  buttons: {
    primary: {
      borderRadius: '40px',
      cursor: 'pointer',
      '&:focus': {
        outline: 'none',
        backgroundColor: 'darkOrange',
      },
    },
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  layout: {
    container: {
      paddingLeft: ['3', '4', '4', '3'],
      paddingRight: ['3', '4', '4', '3'],
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: [5, 6, 6, 7],
      margin: '0px',
    },
    h2: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: [5, 5, 6],
      margin: '0px',
    },
    h3: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: [4, 4, 5],
      margin: '0px',
    },
    h4: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: [3, 3, 4],
      margin: '0px',
    },
    h5: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 1,
      margin: '0px',
    },
    h6: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 0,
      margin: '0px',
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: [2, '18px'],
    },
    a: {
      color: 'primary',
    },
    navlink: {
      color: `blue`,
      textDecoration: `none`,
      textTransform: `uppercase`,
      fontSize: ['0'],
      ':focus': {
        color: `blue`,
      },
      ':visited': {
        color: `blue`,
      },
    },
    li: {
      mb: 2,
    },
    pre: {
      fontFamily: 'monospace',
      background: 'black',
      color: 'white',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
  },
}

// export default {
//   space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
//   fonts: {
//     body: 'system-ui, sans-serif',
//     heading: 'system-ui, sans-serif',
//     monospace: 'Menlo, monospace',
//   },
//   fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
//   breakpoints: [`40em`, `56em`, `64em`, `80em`],
//   sizes: {
//     container: [`38em`, `54em`, `62em`, `78em`],
//   },
//   fontWeights: {
//     body: 400,
//     heading: 700,
//     bold: 700,
//   },
//   lineHeights: {
//     body: 1.5,
//     heading: 1.125,
//   },
//   colors: {
//     text: '#000',
//     background: '#fff',
//     primary: '#07c',
//     secondary: '#30c',
//     muted: '#f6f6f6',
//   },
//   styles: {
//     root: {
//       fontFamily: 'body',
//       lineHeight: 'body',
//       fontWeight: 'body',
//     },
//     h1: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 7,
//     },
//     h2: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 4,
//     },
//     h3: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 3,
//     },
//     h4: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 2,
//     },
//     h5: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 1,
//     },
//     h6: {
//       color: 'text',
//       fontFamily: 'heading',
//       lineHeight: 'heading',
//       fontWeight: 'heading',
//       fontSize: 0,
//     },
//     p: {
//       color: 'text',
//       fontFamily: 'body',
//       fontWeight: 'body',
//       lineHeight: 'body',
//     },
//     a: {
//       color: 'primary',
//     },
//     pre: {
//       fontFamily: 'monospace',
//       overflowX: 'auto',
//       code: {
//         color: 'inherit',
//       },
//     },
//     code: {
//       fontFamily: 'monospace',
//       fontSize: 'inherit',
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'separate',
//       borderSpacing: 0,
//     },
//     th: {
//       textAlign: 'left',
//       borderBottomStyle: 'solid',
//     },
//     td: {
//       textAlign: 'left',
//       borderBottomStyle: 'solid',
//     },
//     img: {
//       maxWidth: '100%',
//     },
//   },
// }
