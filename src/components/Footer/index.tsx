import {
    Toolbar,
    IconButton,
    Paper,
    Typography,
    TextField,
    Link
  } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import useStyles from './style';
import {socialLinks, getStarted} from './footerLinks'
import { useTranslation } from "react-i18next";
import Grid from '@material-ui/core/Grid';
import { validateEmail } from "../../utils/emailValidation";
import { EXTERNAL_LINK_LABELS, VIEW_PORT} from "../../constants"
import { useViewport } from "../../hooks/viewportWidth";

const Footer: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { width } = useViewport();
    const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
    const [emailValue, setEmailValue] = useState<string>('');
    const [disableContinueButton, setDisableContinueButton] = useState<boolean>(true);

    const openEBSLogo = (
        <img src="../Images/logos/logo.svg" className={classes.logo} alt={t('generic.openEBS')}></img>
    );

    useEffect(() => {
        // Enable continue button when email is valid
        validateEmail(emailValue) ? setDisableContinueButton(false) : setDisableContinueButton(true);
    },[emailValue]);

    const handleNewsLetterEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Need to write logic to save email
      };

    // This block of code is used to display social links
    const displaySocialLinks = () => {
          return (
            <div className={classes.socialIconsWrapper}>
                {socialLinks.map(({ label, href, imgURL }) => {
                    return (   
                        <Link href={href} target="_blank" className={classes.socialIconButton} key={label}>
                            <img src={imgURL} alt={label}/>
                        </Link>
                    );
                })}
            </div>   
          );
    };

    // This block of code is used to display newsletter
    const displayNewsLetter = () => {
        return (
            <div>
                <Typography variant='h6' className={classes.columnTitle}>
                    {t('footer.newsLetterTitle')}
                </Typography>
                <form noValidate autoComplete="on" onSubmit={handleNewsLetterEmailSubmit}>
                    <div className={classes.newsletterFormWrapper}>
                        <TextField
                        label={t('footer.emailLabel')}
                        fullWidth
                        name="email"
                        onChange={(e) =>
                            setEmailValue(e.target.value)
                        }
                        InputProps={{
                            className: classes.newsletterInput,
                        }}
                        InputLabelProps={{
                            className: classes.newsletterLabel,
                        }}
                        />
                        <IconButton aria-label="submit" className={classes.iconButton} disabled={disableContinueButton} type="submit">
                            <img src="../Images/svg/arrow_orange.svg" alt={t('header.submitAlt')}/>
                        </IconButton>
                    </div>
                </form>
            </div> 
        );
    };

    // This block of code is used to display get started links
    const displayGetStarted = () => {
        return (
            <div>
                <Typography variant='h6' className={classes.columnTitle}>
                    {t('footer.getStarted')}
                </Typography>
                <Typography className={classes.columnListWrapper}>
                    {getStarted.map(({ label, href }) => {
                        return (   
                            <Link href={href} className={classes.columnListItem} key={label} 
                            target={((label === EXTERNAL_LINK_LABELS.DOCS ) || (label === EXTERNAL_LINK_LABELS.GITHUB) || (label === EXTERNAL_LINK_LABELS.BLOG)) ? '_blank' : '_parent'}>
                                {label}
                            </Link>
                        );
                    })}
                </Typography>
            </div> 
        );
    };

    /* To be uncommented later */
    // This block of code is used to display contact links
    // const displayContactUs = () => {
    //     return (
    //         <div>
    //             <Typography variant='h6' className={classes.columnTitle}>
    //                 {t('footer.contactUs')}
    //             </Typography>
    //             <Typography className={classes.columnListWrapper}>
    //             {contactUs.map(({ label, href }) => {
    //                 return (   
    //                     <Link href={href} className={classes.columnListItem} key={label}>
    //                         {label}
    //                     </Link>
    //                 );
    //             })}
    //             </Typography>
    //         </div> 
    //     );
    // };

    /* To be uncommented later once we get top contributors from GitHub */
    // This block of code is used to display top contributors
    // const displayTopContributors = () => {
    //     return (
    //         <div>
    //             <Typography variant='h6' className={classes.columnTitle}>
    //                 {t('footer.topContributors')}
    //             </Typography>
    //             <Typography className={classes.columnListWrapper}>
    //             {topContributors.map(({ label, href }) => {
    //                 return (   
    //                     <Link href={href} className={classes.columnListItem} key={label}>
    //                         {label}
    //                     </Link>
    //                 );
    //             })}
    //             </Typography>
    //         </div> 
    //     );
    // };

    const displayMobileFooter = () => {
        return (
            <Toolbar className={classes.toolbar}>
                <Grid container spacing={3}>
                    <Grid item xs={12} >
                        <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
                            <div>
                            <Link href="/">
                                {openEBSLogo}
                            </Link>
                            </div>
                            <div>
                                <Link className={classes.contributeButton}>
                                    <img src="../Images/logos/githubLogo.svg" className={classes.githubMobileIcon} alt={t('generic.github')}></img> 
                                    {t('footer.contribute')}
                                </Link>
                            </div>
                        </Paper>
                    </Grid>
                    {/* make it 6 once contact us and top contributors is uncommented */}
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            {displayGetStarted()}
                        </Paper>
                    </Grid>
                    {/* To be uncommented later */}
                    {/* <Grid item xs={6}>
                        <Paper className={classes.paper}>
                            {displayContactUs()}
                            <div className={classes.contributorsMobile}>
                                {displayTopContributors()}
                            </div>
                        </Paper>
                    </Grid> */}
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            {displayNewsLetter()}
                            {displaySocialLinks()}
                        </Paper>
                    </Grid>
                </Grid>
            </Toolbar>
        );
      };

    const displayDesktopFooter = () => {
        return (
            <Toolbar className={classes.toolbar}>
                <Grid container spacing={0} justify={'center'}>
                    <Grid item sm={5} >
                        <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
                            <div>
                                <Link href="/">
                                    {openEBSLogo}
                                </Link>
                            </div>
                            <div>
                                {displayNewsLetter()}
                            </div>
                            <div>
                                {displaySocialLinks()}
                            </div>
                        </Paper>
                    </Grid>
                    {/* Make it just sm when other footer part is uncommneted */}
                    <Grid item sm={3}>
                        <Paper className={classes.paper}>
                            {displayGetStarted()}
                        </Paper>
                    </Grid>
                    {/* To be uncommented later */}
                    {/* <Grid item sm>
                        <Paper className={classes.paper}>
                            {displayContactUs()}
                        </Paper>
                    </Grid> */}
                    {/* To be uncommented later once we get top contributors from GitHub */}
                    {/* <Grid item sm>
                        <Paper className={classes.paper}>
                            {displayTopContributors()}
                        </Paper>
                    </Grid> */}
                </Grid>
            </Toolbar>
        )
    };

    return (
        <div className={classes.footer}>
            <hr className={classes.topDivider}/>
            {width < mobileBreakpoint ? displayMobileFooter(): displayDesktopFooter()}

            {!(width < mobileBreakpoint) &&
                <hr className={classes.bottomDivider}/>
            }
            
            <div className={classes.copyrightsWrapper}>
                <Typography className={classes.copyrights}>
                    {t('footer.copyrights')}
                </Typography>
                <Link href="/privacy-policy" className={[classes.copyrights, classes.privacyPolicyLink].join(' ')}>
                    {t('footer.privacyPolicy')}
                </Link>
            </div>
        </div>
    );
  };
  
  export default Footer;