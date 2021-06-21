import {
    AppBar,
    Toolbar,
    Button,
    Link,
    IconButton,
    Drawer,
    MenuItem
  } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import useStyles from './style';
import { Link as RouterLink, useLocation } from "react-router-dom";
import navbarItems from './navbar'
import GitHubButton from 'react-github-btn'
import { useTranslation } from "react-i18next";
import {EXTERNAL_LINKS, EXTERNAL_LINK_LABELS, VIEW_PORT} from "../../constants"
import { useViewport } from "../../hooks/viewportWidth";

const Header: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { width } = useViewport();
    const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const openEBSLogo = (
        <img loading="lazy" src="../images/logos/logo.svg" className={classes.logo} alt={t('generic.openEBS')}></img>
    );

    var currentPathName = useLocation().pathname;

    // This block of code is used to display social links: GitHub and Slack
    const displaySocialLinks = () => {
          return (
              <div className={classes.socialIconsWrapper}>
                    <Link href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO}>
                        <img loading="lazy" src="../images/logos/githubLogo.svg" className={classes.socialIcon} alt={t('generic.github')}></img>
                    </Link>
                    <Link href="/community">
                        <img loading="lazy" src="../images/logos/slackLogo.svg" className={classes.socialIcon} alt={t('generic.slack')}></img>
                    </Link>
              </div>
          );
      };

    const [scrolled, setScrolled] = useState<boolean>(false);

    // This function handles adding background color to header on scroll past header height
    const handleScroll=() => {
        const offset = window.scrollY;
        (offset > 64) ? setScrolled(true) :setScrolled(false);
    }

    useEffect(() => {
        window.addEventListener('scroll',handleScroll)
    }, []);

    const displayMobileHeader = () => {
        const handleDrawerOpen = () => setIsDrawerOpen(true);
        const handleDrawerClose = () => setIsDrawerOpen(false);

        return (
            <Toolbar className={classes.toolbar}>
                <div className={classes.leftContent}>
                    <Link href="/">
                        {openEBSLogo}
                    </Link>
                    <div className={classes.starButton}>
                        <GitHubButton href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} data-size="large" data-show-count="true" aria-label="Star ntkme/github-buttons on GitHub">{t('generic.githubStar')}</GitHubButton>
                    </div>
                </div>
                <div className={classes.rightContent}>
                    <IconButton
                    {...{
                        edge: "start",
                        color: "inherit",
                        "aria-label": "menu",
                        "aria-haspopup": "true",
                        onClick: handleDrawerOpen,
                    }}
                    >
                    <img loading="lazy" src="../images/svg/hamburger.svg" alt={t('header.menuAlt')}></img>
                    </IconButton>
                </div>
                <Drawer elevation={0}
                    {...{
                        anchor: "right",
                        open: isDrawerOpen,
                        onClose: handleDrawerClose,
                    }}
                    >
                    <div className={classes.drawerPaper}>
                        <div className={classes.closeIcon}>
                            <IconButton aria-label="close drawer" onClick={() => handleDrawerClose()}>
                                <img loading="lazy" src="../images/svg/x-circle.svg" alt={t('header.closeMenuAlt')}></img>
                            </IconButton>
                        </div>
                        <div className={classes.mobileNavWrapper}>
                            {navbarItems.map(({ label, href }) => {
                                return (
                                (label === EXTERNAL_LINK_LABELS.DOCS) ? 
                                <Link
                                    {...{
                                        key: label,
                                        to: href,
                                        href: href,
                                        target: "_self",
                                        className: classes.navbarItem,
                                        onClick: () => handleDrawerClose()
                                    }}
                                >
                                
                                <MenuItem className={classes.menuItemMobile}>{label}</MenuItem>

                                {/* Hiding divider for last item in the navbar items */}
                                 {(label !== navbarItems[navbarItems.length - 1].label) &&
                                    <hr className={classes.mobileDivider}/>
                                }
                                </Link>
                                :
                                <Link
                                    {...{
                                        key: label,
                                        to: href,
                                        component: RouterLink,
                                        className: [classes.navbarItem,(href === currentPathName) ? classes.activeNavbarItem : ''].join(' '),
                                        onClick: () => handleDrawerClose()
                                    }}
                                >
                                
                                <MenuItem className={classes.menuItemMobile}>{label}</MenuItem>

                                {/* Hiding divider for last item in the navbar items */}
                                 {(label !== navbarItems[navbarItems.length - 1].label) &&
                                    <hr className={classes.mobileDivider}/>
                                }
                                </Link>
                                );
                            })}
                        <div className={classes.socialIconsMobile}>
                            {displaySocialLinks()}
                        </div>
                        </div>
                        
                    </div> 
                </Drawer>
            </Toolbar>
        );
      };

    const displayDesktopHeader = () => {
        return (
            <Toolbar className={classes.toolbar}>
                <div className={classes.leftContent}>
                    <Link href="/">
                        {openEBSLogo}
                    </Link>
                    <div className={classes.starButton}>
                        <GitHubButton href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} data-size="large" data-show-count="true" aria-label="Star ntkme/github-buttons on GitHub">{t('generic.githubStar')}</GitHubButton>
                    </div>
                </div>
                <div className={classes.rightContent}>
                {navbarItems.map(({ label, href }) => {
                    return (    
                        (label === EXTERNAL_LINK_LABELS.DOCS) ? 
                        <Button
                            {...{
                                key: label,
                                href: href,
                                target: "_self",
                                className: classes.navbarItem
                            }}
                        >
                        {label}
                        </Button>
                        :
                        <Button
                            {...{
                                key: label,
                                to: href,
                                component: RouterLink,
                                className: [classes.navbarItem,(href === currentPathName) ? classes.activeNavbarItem : ''].join(' ')
                            }}
                        >
                        {label}
                        </Button>
                    );
                })}
                <div>
                    {displaySocialLinks()}
                </div>
                </div> 
            </Toolbar>
        )
    };

    return (
        <AppBar className={[classes.header, scrolled ? classes.scrolledHeader : ''].join(' ')}>
            {width < mobileBreakpoint ? displayMobileHeader(): displayDesktopHeader()}{}</AppBar>
    );
  };
  
  export default Header;
  