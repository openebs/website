import React from "react";
import GitHubButton from 'react-github-btn'
import styles from "./styles.module.scss"
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from "@docusaurus/Link";
import { useViewport } from "@site/src/hooks/useViewport";
import { MobileNav } from "./mobile-nav";
import Translate, { translate } from '@docusaurus/Translate';

export const Header = () => {
    const { siteConfig } = useDocusaurusContext();
    const socials = siteConfig?.customFields?.socials;
    const navLinks = siteConfig?.customFields?.navLinks;
    const repoUrl = siteConfig?.customFields?.externalLinks?.repoUrl;
    const websiteUrl = siteConfig?.url;
    const { width } = useViewport();
    return(
        <div className={styles.headerOuterWrapper}>
            <div className={styles.headerInnerWrapper}>
                <div className={styles.header}>
                    <div className={width > 480 ? styles.logoWrapper : styles.logoWrapperSmallView }>
                        <a href={websiteUrl} target="_self">
                            <img src={useBaseUrl('/img/openebs-logo.svg')} alt={translate({
                                id: "component.Header.logo",
                                description: "Header Logo",
                                message: 'OpenEBS logo'
                            })} />
                        </a>
                        <div className={styles.buttonWrapper}>
                            <GitHubButton href={repoUrl} data-size="large" data-show-count="true" aria-label="Star OpenEBS">
                                <Translate
                                    id="component.Header.star"
                                    description="Star button"
                                >Star</Translate>
                            </GitHubButton>
                        </div>
                    </div>
                
                    <div className={styles.navLinksWrapper}>
                    {(width < 997) ? <MobileNav />  : (
                        <ul className={styles.navLinks}>
                        {navLinks?.map(res => {
                            return(
                                <li key={res.label} className={styles.navItem}>
                                    <Link to={res.link} target="_self" className={styles.navLink} >{res.label}</Link>
                                </li>
                            )
                        })}                    
                        <li className={styles.navItem}>
                            {socials?.map(res => {
                                return(
                                    <Link to={res.link} key={res.label} className={styles.socials} target={res.isExternal ? '_blank' : '_self'}>
                                        <img src={res.src} alt={res.label} />
                                    </Link>
                                )
                            })}
                        </li>
                    </ul>
                        ) }
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
  