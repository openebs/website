import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Theme } from '@mui/material/styles';
import './fonts';

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

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

const AppRoutes: React.FC = () => (
  <div>
    <Scaffold>
      {/* ---All routes should be wrapped within scaffold--- */}
      <Routes>
        {/* ---Routes to come beneath--- */}
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/community" element={<Community />} />
        <Route path="/commercial-support" element={<CommercialSupport />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/author/:authorName" element={<AuthorBlogs />} />
        <Route path="/blog/tag/:tagName" element={<TagBlogs />} />
        <Route path="/blog/:blogName" element={<BlogPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Scaffold>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
