import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme/theme';
import './fonts';

const Scaffold = React.lazy(() => import('./containers/Scaffold'));
const Home = React.lazy(() => import('./pages/Home'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Faq = React.lazy(() => import('./pages/Faq'));
const CommercialSupport = React.lazy(() => import('./pages/CommercialSupport'));
const Community = React.lazy(() => import('./pages/Community'));
const Blog = React.lazy(() => import('./pages/Blog'));
const AuthorBlogs = React.lazy(() => import('./pages/Blog/Author'));
const TagBlogs = React.lazy(() => import('./pages/Blog/Tag'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const ErrorPage = React.lazy(() => import('./pages/ErrorPage'));

const Routes: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <div>
      <Scaffold>
        {/* ---All routes should be wrapped within scaffold--- */}
        <Switch>
          {/* ---Routes to come beneath--- */}
          <Route exact path="/" component={Home} />
          <Route exact path="/privacy-policy" component={PrivacyPolicy} />
          <Route exact path="/faq" component={Faq} />
          <Route exact path="/community" component={Community} />
          <Route exact path="/commercial-support" component={CommercialSupport} />
          <Route exact path="/blog" component={Blog} />
          <Route exact path="/blog/author/:authorName" component={AuthorBlogs} />
          <Route exact path="/blog/tag/:tagName" component={TagBlogs} />
          <Route exact path="/blog/:blogName" component={BlogPage} />
          <Route path="*" component={ErrorPage} />
        </Switch>
      </Scaffold>
    </div>
  </ThemeProvider>
);

function App() {
  const history = createBrowserHistory();

  return (
    <Router history={history}>
      <Routes />
    </Router>
  );
}

export default App;
