import React, { useEffect } from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import useStyles from './styles';
import Header from '../../components/Header';

const Scaffold: React.FC = ({ children }) => {
  const classes = useStyles();

  const _ScrollToTop = (props: any) => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return props.children;
  };

  const ScrollToTop = withRouter(_ScrollToTop);

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
