// [TODO] -- use scss module
import React, { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import { useViewport } from "@site/src/hooks/useViewport";
import Translate, { translate } from '@docusaurus/Translate';

const FooterLogo = () => {
  const { siteConfig } = useDocusaurusContext();
  const openebsLogo = siteConfig?.customFields?.openebsLogo;
  return (
    <div className="footer_logo">
      <img src={openebsLogo} alt={translate({
         id: 'component.Footer.logo', 
         description: 'Footer logo',
         message: 'OpenEBS logo'
      })} />
    </div>
  );
};

const EmailSubscription = () => {
  const { siteConfig } = useDocusaurusContext();
  const subscribeNewsletter = siteConfig?.customFields?.externalLinks?.subscribeNewsletter;
  return (
    <>
      <span className="footer__title">
        <Translate
          id="component.Footer.emailSubscription"
          description="Email subscription title in footer"
        >Stay in the know with our newsletter</Translate>
      </span>
      {
        subscribeNewsletter && (
          <div className="margin-vert--md">
            <a
            className="doc-button doc-button-primary doc-button-curved doc-button-lg"
            href={subscribeNewsletter}
            target="_blank"
            >
              <Translate
                id="component.Footer.subscribe"
                description="Email subscription action text"
              >Subscribe</Translate>
            </a>
        </div>
        )
      }

    </>
  );
};
const LinksGettingStarted = () => {
  const { siteConfig } = useDocusaurusContext();
  const gettingStarted = siteConfig?.customFields?.footbarLinks?.gettingStarted;
  return (
    <div className="col">
      <span className="footer__title">
      <Translate
        id="component.Footer.gettingStarted"
        description="Getting started label in footer"
      >Getting started</Translate></span>
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
      <span className="footer__title">
        <Translate
          id="component.Footer.contactUs"
          description="Contact us label in footer"
        >Contact us</Translate>
      </span>
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
          <span className="footer__title">
            <Translate
              id="component.Footer.topContributors"
              description="Top contributors label in footer"
            >Top contributors</Translate>
          </span>
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
  const { siteConfig } = useDocusaurusContext();
  const socialLinks = siteConfig?.customFields?.socialLinks;
  const items = [
    {
      name: translate({
        message: 'facebook',
        id: 'component.Footer.facebook',
        description: 'Facebook icon in footer'
      }),
      icon: require("@site/static/img/social_media/facebook.svg").default,
      link: socialLinks.facebook,
    },
    {
      name: translate({
        message: 'github',
        id: 'component.Footer.github',
        description: 'GitHub icon in footer'
      }),
      icon: require("@site/static/img/social_media/github.svg").default,
      link: socialLinks.github,
    },
    {
      name: translate({
        message: 'slack',
        id: 'component.Footer.slack',
        description: 'slack icon in footer'
      }),
      icon: require("@site/static/img/social_media/slack.svg").default,
      link: socialLinks.github,
    },
    {
      name: translate({
        message: 'linkedin',
        id: 'component.Footer.linkedin',
        description: 'Linkedin icon in footer'
      }),
      icon: require("@site/static/img/social_media/linkedin.svg").default,
      link: socialLinks.linkedin,
    },
    {
      name: translate({
        message: 'youtube',
        id: 'component.Footer.youtube',
        description: 'Youtube icon in footer'
      }),
      icon: require("@site/static/img/social_media/youtube.svg").default,
      link: socialLinks.youtube,
    },
    {
      name: translate({
        message: 'twitter',
        id: 'component.Footer.twitter',
        description: 'Twitter icon in footer'
      }),
      icon: require("@site/static/img/social_media/twitter.svg").default,
      link: socialLinks.twitter,
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
    <div className="footer__bottom row col col--12">
      {
        copyRight && (
          <div className="margin-right--lg">
            <span>{copyRight}</span>
          </div>
        )
      }
      {
        privacyPolicy && (
          <Link
          to={privacyPolicy?.link}
          className="footer__link-item"
          target="_blank"
          >
            {privacyPolicy?.label}
          </Link>
        )
      }
    </div>
  );
};

const FooterMobileView = () => {
  return (
    <footer className="footer">
      <div className="container container--fluid footer-wrapper-mob">
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

const FooterDesktopView = () => {
  return (
    <footer className="footer">
      <div className="container container--fluid footer-wrapper">
        <div className="row">
          <div className="row col col--12 footer__links">
            <div className="col col--5">
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
  const { siteConfig } = useDocusaurusContext();
  const breakpoints = siteConfig?.customFields?.breakpoints;
  const { width } = useViewport() || 0;
  
  return width < breakpoints?.md  ? <FooterMobileView /> : <FooterDesktopView />;
};