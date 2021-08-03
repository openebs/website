import React, { useState, useCallback } from "react";
import { MDXProvider } from "@mdx-js/react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import renderRoutes from "@docusaurus/renderRoutes";
import Layout from "@theme/Layout";
import DocSidebar from "@theme/DocSidebar";
import MDXComponents from "@theme/MDXComponents";
import NotFound from "@theme/NotFound";
import IconArrow from "@theme/IconArrow";
import { matchPath } from "@docusaurus/router";
import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import styles from "./styles.module.scss";
import { ThemeClassNames, docVersionSearchTag } from "@docusaurus/theme-common";
import { Feedback } from "@site/src/components/Feedback";
import { Footer } from "@site/src/components/Footer";

function DocPageContent({ currentDocRoute, versionMetadata, children }) {
  const { siteConfig, isClient } = useDocusaurusContext();
  const { pluginId, permalinkToSidebar, docsSidebars, version } =
    versionMetadata;
  const sidebarName = permalinkToSidebar[currentDocRoute.path];
  const sidebar = docsSidebars[sidebarName];
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer(!hiddenSidebarContainer);
  }, [hiddenSidebar]);
  return (
    <Layout
      key={isClient}
      wrapperClassName={ThemeClassNames.wrapper.docPages}
      pageClassName={ThemeClassNames.page.docPage}
      searchMetadatas={{
        version,
        tag: docVersionSearchTag(pluginId, version),
      }}
    >
      <div className={`${styles.docPage} ${styles.docPageWithSearch}`}>
        {sidebar && (
          <div className={styles.sidebarWrapper}>
            <div className={styles.sidebar}>
            <div
              className={clsx(styles.docSidebarContainer, {
                [styles.docSidebarContainerHidden]: hiddenSidebarContainer,
              })}
              onTransitionEnd={(e) => {
                if (
                  !e.currentTarget.classList.contains(
                    styles.docSidebarContainer
                  )
                ) {
                  return;
                }

                  if (hiddenSidebarContainer) {
                    setHiddenSidebar(true);
                  }
                }}
                role="complementary"
              >
                <DocSidebar
                  key={
                    // Reset sidebar state on sidebar changes
                    // See https://github.com/facebook/docusaurus/issues/3414
                    sidebarName
                  }
                  sidebar={sidebar}
                  path={currentDocRoute.path}
                  sidebarCollapsible={
                    siteConfig.themeConfig?.sidebarCollapsible ?? true
                  }
                  onCollapse={toggleSidebar}
                  isHidden={hiddenSidebar}
                />

                {hiddenSidebar && (
                  <div
                    className={styles.collapsedDocSidebar}
                    title={translate({
                      id: "theme.docs.sidebar.expandButtonTitle",
                      message: "Expand sidebar",
                      description:
                        "The ARIA label and title attribute for expand button of doc sidebar",
                    })}
                    aria-label={translate({
                      id: "theme.docs.sidebar.expandButtonAriaLabel",
                      message: "Expand sidebar",
                      description:
                        "The ARIA label and title attribute for expand button of doc sidebar",
                    })}
                    tabIndex={0}
                    role="button"
                    onKeyDown={toggleSidebar}
                    onClick={toggleSidebar}
                  >
                    <IconArrow className={styles.expandSidebarButtonIcon} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={styles.colMainContent}>
          <main
            className={clsx(styles.docMainContainer, {
              [styles.docMainContainerEnhanced]:
                hiddenSidebarContainer || !sidebar,
            })}
          >
            <div className="col-fullWidth">
              <div
                className={clsx(
                  "container container--fluid padding-vert--lg",
                  styles.docItemWrapper,
                  {
                    [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
                  }
                )}
              >
                <MDXProvider components={MDXComponents}>{children}</MDXProvider>
              </div>

              <Feedback />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

function DocPage(props) {
  const {
    route: { routes: docRoutes },
    versionMetadata,
    location,
  } = props;
  const currentDocRoute = docRoutes.find((docRoute) =>
    matchPath(location.pathname, docRoute)
  );

  if (!currentDocRoute) {
    return <NotFound {...props} />;
  }

  return (
    <DocPageContent
      currentDocRoute={currentDocRoute}
      versionMetadata={versionMetadata}
    >
      {renderRoutes(docRoutes)}
    </DocPageContent>
  );
}

export default DocPage;
