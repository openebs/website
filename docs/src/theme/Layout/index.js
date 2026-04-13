import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import './styles.scss';

export default function Layout(props) {
  const { children, noFooter, wrapperClassName, title, description } = props;
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.main, wrapperClassName)}>
      <LayoutProvider>
        <PageMetadata title={title} description={description} />

        <SkipToContent />

        <AnnouncementBar />

        <Header />

        <div
          className={clsx(
            ThemeClassNames.wrapper.main,
            wrapperClassName,
          )}>
          <ErrorBoundary
            fallback={(params) => <ErrorPageContent {...params} />}>
            {children}
          </ErrorBoundary>
        </div>

        {!noFooter && <Footer />}
      </LayoutProvider>
    </HtmlClassNameProvider>
  );
}
