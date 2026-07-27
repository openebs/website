import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import TagManager from 'react-gtm-module';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as JssThemeProvider } from '@mui/styles';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import Loader from './components/Loader';
import theme from './theme/theme';

const tagManagerArgs = {
  gtmId: 'GTM-WKVV7F3N',
};

window.onload = () => {
  // When page loading is complete we call the google analytics method optimizing load time
  TagManager.initialize(tagManagerArgs);
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <JssThemeProvider theme={theme}>
          <HelmetProvider>
            <CssBaseline />
            <Suspense fallback={<Loader />}>
              <App />
            </Suspense>
          </HelmetProvider>
        </JssThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
