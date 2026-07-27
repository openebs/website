import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStyles from './styles';
import Header from '../../components/Header';

const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return children;
};

const Scaffold: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ScrollToTop>
        <header className={classes.header}>
          <Header />
        </header>
        <main className={classes.content}>{children}</main>
      </ScrollToTop>
    </div>
  );
};

export default Scaffold;
