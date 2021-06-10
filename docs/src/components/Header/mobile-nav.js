import React, { useState } from "react"
import styles from "./styles.module.scss";
import { Menu, XCircle } from 'react-feather';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from "@docusaurus/Link";

export const MobileNav = () => {
    const { siteConfig } = useDocusaurusContext();
    const socials = siteConfig?.customFields?.socials;
    const navLinks = siteConfig?.customFields?.navLinks;
    const [show, setShow] = useState(false);

    const handleShow = () => {
        setShow(true);
    } 

    const handleHide = () => {
        setShow(false);
    }

    return(
        <div className={styles.mobileNavWrapper}>
            <div>
                <Menu className={styles.menuIcon} onClick={() => handleShow()} />
            </div>
            { show && (
                <div className={styles.navLinksMob}>
                    <div className={styles.navItemMob}>
                        <ul className={styles.navItemListMob}>
                            {navLinks?.map(res => {
                                return(
                                    <li key={res.label} className={`${styles.navItem} ${styles.navItemUnderline}`}>
                                        <Link to={res.link} target="_self" onClick={() => handleHide()} className={styles.navLink} >{res.label}</Link>
                                    </li>
                                )
                            })}                    
                            <li className={`${styles.navItem} ${styles.socialsMob}`}>
                                {socials?.map(res => {
                                    return(
                                        <Link to={res.link} key={res.label} onClick={() => handleHide()} className={styles.socials} target={res.isExternal ? '_blank' : '_self'}>
                                            <img src={res.src} alt={res.label} />
                                        </Link>
                                    )
                                })}
                            </li>
                        </ul>
                        <div className={styles.crossIconWrapper}>
                            <XCircle onClick={() => handleHide()} className={styles.xCircleIcon} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}