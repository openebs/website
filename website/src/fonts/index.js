// Import the required fonts in this file
// For example, if you want to import 900 font weight of Italic variant
// You import it with
// import "@fontsource/montserrat/900-italic.css".

import '@fontsource/montserrat'; // Defaults to weight 400
import '@fontsource/montserrat/700.css'; // Weight 700.
import '@fontsource/montserrat/500.css'; // Weight 500.

// A helper function to generate a special StyledComponent that handles global styles. Normally, styled components are automatically scoped to a local CSS class and therefore isolated from other components.
// https://styled-components.com/docs/api#createglobalstyle

import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    @font-face {
        font-family: 'Menlo';
        src: local('Menlo'),
        url('/Menlo-Regular.ttf') format('ttf');
        font-weight: 300;
        font-style: normal;
    }
`;
