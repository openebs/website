import React, { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import { useViewport } from "@site/src/hooks/useViewport";

const FooterLogo = () => {
  const { siteConfig } = useDocusaurusContext();
  const openebsLogo = siteConfig?.customFields?.openebsLogo;

  return (
    <div className="footer_logo">
      <img src={openebsLogo} alt="OpenEBS" />
    </div>
  );
};
const EmailSubscription = () => {
  return (
    <>
      <span className="footer__title">
        Stay in the know with our newsletter
      </span>
      <div className="margin-vert--md">
        <a
          className="doc-button doc-button-primary doc-button-curved  doc-button-lg"
          href="https://lists.cncf.io/g/cncf-openebs-announcements"
          target="_blank"
        >
          Subscribe
        </a>
      </div>
    </>
  );
};
const LinksGettingStarted = () => {
  const { siteConfig } = useDocusaurusContext();
  const gettingStarted = siteConfig?.customFields?.footbarLinks?.gettingStarted;
  return (
    <div className="col">
      <span className="footer__title">Getting started</span>
      <ul className="footer__items">
        {gettingStarted?.map((link) => {
          return (
            <li className="footer__item" key={link.label}>
              <Link
                className="footer__link-item"
                to={link?.link}
                target={link?.isExternal ? "_blank" : "_self"}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
const LinksContactUs = () => {
  const { siteConfig } = useDocusaurusContext();
  const contactUs = siteConfig?.customFields?.footbarLinks?.contactUs;

  return (
    <div className="col footer__col">
      <span className="footer__title">Contact us</span>
      <ul className="footer__items">
        {contactUs?.map((link) => {
          return (
            <li className="footer__item" key={link.label}>
              <Link
                className="footer__link-item"
                to={link?.link}
                target={link?.isExternal ? "_blank" : "_self"}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
const Contributors = () => {
  const { siteConfig } = useDocusaurusContext();
  const githubApiContributors = siteConfig?.customFields?.githubApiContributors;
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  //getting the top contributors from github by sending the api order as desc
  useEffect(() => {
    fetch(githubApiContributors)
      .then((res) => res?.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        (error) => {
          setIsLoaded(true);
          console.error(error);
        }
      );
    return () => {
      setItems([]);
    };
  }, []);
  return (
    <div className="col">
      {isLoaded && items.length && (
        <>
          <span className="footer__title">Top contributors</span>
          <ul className="footer__items">
            {items?.slice(0, 3).map((item) => {
              return (
                <li className="footer__item" key={item.login}>
                  <Link
                    className="footer__link-item"
                    to={item.html_url}
                    target="_blank"
                  >
                    {item.login}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

const SocialMedia = () => {
  const items = [
    {
      name: "facebook",
      icon: require("@site/static/img/social_media/facebook.svg").default,
      link: "https://www.facebook.com/openebs",
    },
    {
      name: "github",
      icon: require("@site/static/img/social_media/github.svg").default,
      link: "https://github.com/openebs/openebs-docs",
    },
    {
      name: "slack",
      icon: require("@site/static/img/social_media/slack.svg").default,
      link: "https://openebs.io/community",
    },
    {
      name: "linkedin",
      icon: require("@site/static/img/social_media/linkedin.svg").default,
      link: "https://www.linkedin.com/company/openebs",
    },
    {
      name: "youtube",
      icon: require("@site/static/img/social_media/youtube.svg").default,
      link: "https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g",
    },
    {
      name: "twitter",
      icon: require("@site/static/img/social_media/twitter.svg").default,
      link: "https://twitter.com/openebs",
    },
  ];
  return (
    <div className="row col col--12">
      {items?.map((item) => {
        return (
          <Link className="link_icon" key={item?.name} to={item?.link}>
            <item.icon />
          </Link>
        );
      })}
    </div>
  );
};

const FooterBottom = () => {
  const { siteConfig } = useDocusaurusContext();
  const copyRight = siteConfig?.themeConfig?.footer?.copyright;
  const privacyPolicy = siteConfig?.customFields?.footbarLinks?.privacyPolicy;

  return (
    <div className="footer__bottom row margin-top--md col col--12">
      <div className="margin-right--lg">
        <span>{copyRight && copyRight}</span>
      </div>
      <Link
        to={privacyPolicy?.link}
        className="footer__link-item"
        target="_blank"
      >
        {privacyPolicy?.label}
      </Link>
    </div>
  );
};

const FooterMobile = () => {
  return (
    <footer className="footer">
      <div className="container container--fluid">
        <div className="row">
          <div className="row col col--12 footer__links">
            <div className="col col--4">
              <FooterLogo />
            </div>
          </div>
          <div className="col col-wrap">
            <div className="col col-6">
              <LinksGettingStarted />
            </div>
            <div className="col col-6">
              <Contributors />
            </div>
          </div>
          <div className="margin-vert--md">
            <EmailSubscription />
          </div>
          <div className="col col--12 align-center">
            <SocialMedia />
          </div>
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
};

const FooterWeb = () => {
  return (
    <footer className="footer">
      <div className="container container--fluid">
        <div className="row">
          <div className="row col col--12 footer__links">
            <div className="col col--4">
              <FooterLogo />
              <EmailSubscription />
              <SocialMedia />
            </div>
            <LinksGettingStarted />
            <Contributors />
            <FooterBottom />
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = () => {
  const { width } = useViewport() || 0;
  
  return width < 996 ? <FooterMobile /> : <FooterWeb />;
};