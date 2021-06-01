import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './theme/theme';
import './fonts'
import Scaffold from './containers/Scaffold';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Faq from './pages/Faq';
import Support from './pages/Support';
import Community from './pages/Community';
import BlogPage from './pages/BlogPage';

const Routes: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Scaffold>
          {/* ---All routes should be wrapped within scaffold--- */}
          <Switch>
            {/* ---Routes to come beneath--- */}

            <Route exact path='/' component={Home} />
            <Route exact path='/privacy-policy' component={PrivacyPolicy} />
            <Route exact path='/faq' component={Faq} />
            <Route exact path='/community' component={Community} />
            <Route exact path='/commercial-support' component={Support} />
            <Route exact path='/blog/:blogName' component={BlogPage} />
          </Switch>
        </Scaffold>
      </div>
    </ThemeProvider>
  );
};

function App() {
  const history = createBrowserHistory();

  return (
    <Router history={history}>
      <Routes />
    </Router>
  );
}

export default App;