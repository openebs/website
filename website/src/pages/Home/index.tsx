import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import useStyles from './styles';
import Paper from '@material-ui/core/Paper';
import { Typography, Link, Tabs, Tab, Box, Button, Tooltip, IconButton, withStyles } from '@material-ui/core';
import Footer from '../../components/Footer';
import JoinCommunity from '../../components/JoinCommunity';
import Newsletter from "../../components/Newsletter";
import Sponsor from "../../components/Sponsor";
import { EXTERNAL_LINKS, VIEW_PORT } from '../../constants';
import MiniBlog from '../../components/MiniBlog';
import EventSlider from '../../components/EventSlider';
import adopters from '../../resources/adopters.json';
import events from '../../resources/events.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useViewport } from "../../hooks/viewportWidth";
import { Workloads } from "./workloads";
import { Metadata } from "../../components/Metadata";
import SeoJson from "../../resources/seo.json";
import TestimonialSlider from '../../components/testimonialSlider';
import { Testimonial } from "../../components//testimonialSlider/interface";
import { useCurrentHost } from "../../hooks/useCurrentHost";
import AdopterSlider from '../../components/AdoptersSlider';

const Home: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { currentOrigin } = useCurrentHost();
    const [tabValue, setTabValue] = useState<number>(0);
    const [copyCommand, setCopyCommand] = useState({
        text: 'helm install openebs --namespace openebs openebs/openebs --create-namespace',
        status: 'Copy to clipboard'
    });
    const [adopterTestimonials, setAdopterTestimonials] = useState<Testimonial[]>([]);
    useEffect(()=>{
        setAdopterTestimonials(adopters);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps
    const handleTabChange = (_event: React.ChangeEvent<{}>, newTabValue: number) => {
        setTabValue(newTabValue);
    };

    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    const { width } = useViewport();
    useEffect(()=>{
        window.innerWidth <= VIEW_PORT.MOBILE_BREAKPOINT ? setIsMobileView(true) : setIsMobileView(false);
    },[width])

    interface TabPanelProps {
        children?: React.ReactNode;
        index: any;
        value: any;
    }
      
    function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    
    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box p={0}>
            <div>{children}</div>
            </Box>
        )}
        </div>
    );
    }
      
    function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
    }

    

    // function to override tooltip component default style
    const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: theme.palette.success.dark,
        color: theme.palette.background.paper,
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 400
    },
    }))(Tooltip);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(copyCommand.text)
        setCopyCommand({
            text: 'helm install openebs --namespace openebs openebs/openebs --create-namespace',
            status: 'Copied to clipboard'})
        setTimeout(() => {
            setCopyCommand({
                text: 'helm install openebs --namespace openebs openebs/openebs --create-namespace',
                status:'Copy to clipboard'})
        }, 2000);
    };
    
    return (
        <div>
            <Metadata title={SeoJson.pages.home.title} description={SeoJson.pages.home.description} url={`${currentOrigin}${SeoJson.pages.home.url}`} image={`${currentOrigin}${SeoJson.pages.home.image}`} isPost={false}  />
            <section>
                {isMobileView ? 
                    <Grid container spacing={0}>
                        <Grid item sm={8} xs={11} className={classes.firstGrid}>
                            <Paper className={[classes.paper,classes.firstPaper].join(' ')}>
                                <Typography variant='h1' className={classes.firstSectionTitle}>
                                    {t('home.landingScreenTitle')}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item sm={4} xs={1}>
                            <Paper className={[classes.paper, classes.secondGrid].join(' ')}>
                                <img loading="lazy" placeholder={"../images/png/homepage_main.png?q=20"} src="../images/png/homepage_main.png?q=20" alt={t('home.landingScreenImageAlt')} className={classes.landingImage}></img>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={[classes.paper,classes.tabsWrapper].join(' ')}>
                                    <Tabs value={tabValue} onChange={handleTabChange} TabIndicatorProps={{style: {display: "none"}}}>
                                        <Tab label={t('home.openebs.label')} {...a11yProps(0)} className={classes.tabButton}/>
                                        <Tab label={t('home.concepts.label')} {...a11yProps(1)} className={classes.tabButton}/>
                                        <Tab label={t('home.community.label')} {...a11yProps(2)} className={classes.tabButton}/>
                                    </Tabs>
                                    <TabPanel value={tabValue} index={0} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.openebs.description')} 
                                        </Typography>
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href={EXTERNAL_LINKS.OPENEBS_GET_STARTED} target="_blank">
                                            {t('home.openebs.runOpenEBS')} 
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img loading="lazy" src="../images/svg/play.svg" alt={t('home.openebs.watchDemo')}></img>}
                                            className={classes.outlineButton}
                                            href={EXTERNAL_LINKS.OPENEBS_YOUTUBE_INTRO} target="_blank"
                                        >
                                        {t('home.openebs.watchDemo')}
                                        </Button>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={1} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.concepts.description')}
                                        </Typography>
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href="/docs">
                                            {t('home.concepts.checkConcepts')}
                                        </Button>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={2} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.community.description')}
                                        </Typography>
                                        <Button variant="contained" 
                                        color="secondary" 
                                        className={classes.solidButton}
                                        endIcon={<img loading="lazy" src="../images/logos/slack_white.svg" alt={t('home.community.joinOnSlack')}></img>}
                                        href="/community">
                                            {t('home.community.joinOnSlack')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img loading="lazy" src="../images/logos/github_orange.svg" alt={t('home.community.joinOnGitHub')}></img>}
                                            className={classes.outlineButton}
                                            href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} target="_blank"
                                        >
                                        {t('home.community.joinOnGitHub')}
                                        </Button>
                                    </TabPanel>
                            </Paper>
                        </Grid>
                    </Grid> 

                :

                    <Grid container spacing={0}>
                            <Grid item lg={6} md={7} sm={8} className={classes.firstGrid}>
                                <Paper className={[classes.paper,classes.firstPaper].join(' ')}>
                                    <Typography variant='h1' className={classes.firstSectionTitle}>
                                        {t('home.landingScreenTitle')}
                                    </Typography>

                                    <Tabs value={tabValue} onChange={handleTabChange} TabIndicatorProps={{style: {display: "none"}}}>
                                        <Tab label={t('home.openebs.label')} {...a11yProps(0)} className={classes.tabButton}/>
                                        <Tab label={t('home.concepts.label')} {...a11yProps(1)} className={classes.tabButton}/>
                                        <Tab label={t('home.community.label')} {...a11yProps(2)} className={classes.tabButton}/>
                                    </Tabs>
                                    <TabPanel value={tabValue} index={0} >
                                        <Typography className={classes.tabBodyText}>
                                        <Trans i18nKey="home.openebs.description">OpenEBS helps Developers and Platform SREs easily deploy Kubernetes Stateful Workloads that require fast and highly reliable<Link href="/docs/concepts/cas" className={classes.link}>Container attached storage</Link> OpenEBS turns any storage available on the Kubernetes worker nodes into local or distributed Kubernetes Persistent Volumes.</Trans>
                                        </Typography>
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href= "/docs" target="_blank">
                                            {t('home.openebs.runOpenEBS')} 
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img loading="lazy" src="../images/svg/play.svg" alt={t('home.openebs.watchDemo')}></img>}
                                            href={EXTERNAL_LINKS.OPENEBS_YOUTUBE_INTRO} target="_blank"
                                        >
                                        {t('home.openebs.watchDemo')}
                                        </Button>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={1} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.concepts.description')}
                                        </Typography>
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href="/docs">
                                            {t('home.concepts.checkConcepts')}
                                        </Button>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={2} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.community.description')}
                                        </Typography>
                                        <Button variant="contained" 
                                        color="secondary" 
                                        className={classes.solidButton}
                                        endIcon={<img loading="lazy" src="../images/logos/slack_white.svg" alt={t('home.community.joinOnSlack')}></img>}
                                        href="/community">
                                            {t('home.community.joinOnSlack')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img loading="lazy" src="../images/logos/github_orange.svg" alt={t('home.community.joinOnGitHub')}></img>}
                                            href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} target="_blank"
                                        >
                                        {t('home.community.joinOnGitHub')}
                                        </Button>
                                    </TabPanel>
                                </Paper>
                            </Grid>
                            <Grid item lg={6} md={5} sm={4}>
                                <Paper className={classes.paper}>
                                    <span className={classes.landingImage}>
                                        <LazyLoadImage effect="blur" src={"../images/png/homepage_main.png"} alt={t('home.landingScreenImageAlt')}  />                                 
                                    </span>
                                </Paper>
                            </Grid>
                        </Grid>
                }
            </section>


            <section>
                <AdopterSlider />
            </section>

            <section>
                <Sponsor/>
            </section>

            <section>
                <Typography variant="h2" className={classes.sectionTitle}>
                    {t('home.whatsInItForYou.title')}
                </Typography>
                <Grid container spacing={3} className={classes.sectionDiv}>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/money_bag.svg" alt={t('home.whatsInItForYou.saveMoney')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.saveMoney'>
                            <strong>Save money, improve the resilience of your cloud storage </strong> – thanks to thin provisioning and the ability to span availability zones and to spin up and down easily in some cases users are saving 30% or more on their cloud storage via the use of container attached storage.
                            </Trans>
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/box.svg" alt={t('home.whatsInItForYou.flexibility')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.flexibility'>
                            <strong>Run anywhere the same way</strong> – especially with a solution like OpenEBS that is in the user space, you can abstract away from the various flavors of storage; this is consistent with the mission of Kubernetes itself of course!
                            </Trans>
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/wheel.svg" alt={t('home.whatsInItForYou.resilience')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.resilience'>
                            <strong>Kubernetes is becoming ubiquitous</strong> – providing for the first time a means to scale solutions like Container Attached Storage software. OpenEBS with CAS pattern extends the benefits of Kubernetes patterns and benefits to storage.
                            </Trans>
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/cloud.svg" alt={t('home.whatsInItForYou.restoreData')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.restoreData'>
                            <strong>Cloud-native data protection</strong> - The backup and restore of OpenEBS volumes works with Kubernetes backup and restore solutions such as Velero. Data backup to object storage targets such as AWS S3, GCP Object Storage, or MinIO are frequently deployed using the OpenEBS.
                            </Trans>  
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/lock.svg" alt={t('home.whatsInItForYou.openSource')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.openSource'>
                                <strong>Avoid vendor lock-in</strong> - Using OpenEBS as a data abstraction layer, data can be much more easily moved amongst Kubernetes environments, whether they are on-premise and attached to traditional storage systems or in the cloud.
                            </Trans> 
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img loading="lazy" src="../images/svg/settings.svg" alt={t('home.whatsInItForYou.granularControl')}></img>
                            </div>
                            <Typography className={classes.description}>
                            <Trans i18nKey='home.whatsInItForYou.granularControl'>
                            <strong>Applications have changed</strong> – applications and the teams that build them now have very different requirements; OpenEBS allows for providing volumes to applications with just enough features ranging from local to distributed persistent volumes.
                            </Trans>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </section>

            {/* Section: Workloads */}    
            <section>
                <Workloads />
            </section>
            {/* Section: Join our community */}
            <section>
                <JoinCommunity/>
            </section>
            {/* Section: Community events */}
                <section>
                    {!isMobileView && 
                    <Typography variant="h2" className={classes.sectionTitle}>
                        {t("community.communityEvents.title")}
                    </Typography>
                    }
                    <Grid container spacing={3} className={events.length ? '' : classes.noEvents}>
                        <Grid item xs={12} sm={!isMobileView ? 3 : 12} xl={3} className={`${classes.imageFluid}`}>
                        <LazyLoadImage effect="blur" loading="lazy" src="../images/svg/community.svg" alt={t("community.communityEvents.communityImageAlt")} />
                            {isMobileView && 
                            <Typography variant="h2" className={classes.sectionTitle}>
                                {t("community.communityEvents.title")}
                            </Typography>
                        }
                        </Grid>
                        {events.length ? (
                            <Grid item xs={12} sm={!isMobileView ? 9 : 12} xl={9}>
                                <EventSlider />
                            </Grid>
                        ) : (
                            <Typography variant="h4" className={classes.noEventText}>
                                 <Link target="_blank" className={classes.noEventLink} href={EXTERNAL_LINKS.CNCF_EVENTS}>{t("community.communityEvents.noEvent.message")}</Link>
                            </Typography>
                        )}
                    </Grid>
                </section>
            {/* Section: Our adopters say about us */}
            <section>
                {isMobileView && 
                    <Grid item xs={12} className={classes.testimonialMuleWrapper}>
                        <Paper className={[classes.paper, classes.testimonialMule].join(' ')}>
                            <LazyLoadImage effect="blur" loading="lazy" src="../images/png/testimonials_mule.png" alt="" />
                        </Paper>
                    </Grid>
                }
                <Typography variant="h2" className={classes.sectionTitle}>
                    {t('home.adaptorsTestimonials.title')}
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item sm={isMobileView ? 12 : 7} xs={12}>
                        <Paper className={[classes.paper, classes.testimonialPaper].join(' ')}>
                            {adopterTestimonials && (
                                <TestimonialSlider testimonials={adopterTestimonials} />
                                )
                            }
                            <div className={classes.adopterButtonWrapper}>
                               <Button
                                    variant="contained"
                                    color="secondary"
                                    className={classes.solidButton}
                                    onClick={() => { window.open(EXTERNAL_LINKS.BECOME_ADOPTER, '_blank') }}
                                >
                                    {t("adoptersTestimonials.becomeAdopter")}
                               </Button>
                            </div>
                        </Paper>
                    </Grid>
                    {!isMobileView && 
                        <Grid item sm={5} className={classes.testimonialMuleWrapper}>
                            <Paper className={[classes.paper, classes.testimonialMule].join(' ')}>
                                <LazyLoadImage effect="blur" src="../images/png/testimonials_mule.png" alt="" />
                            </Paper>
                        </Grid>
                    }
                </Grid>
            </section>

            {/* Section: Newsletter */}
            <section>
                <Newsletter newsletterTitle={t("home.newsLetterTitle")} />
            </section>

            {/* Section: Blogs  */}
            <section>
                <MiniBlog />
            </section>

            <div className={classes.footerBackground}>
            {/* Section: You are ready to start */}
            <section>
                <div className={classes.readyToStartSection}>
                    <Typography variant="h2" className={classes.sectionTitle}>
                        {t('home.youAreReadyToStart.title')}
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item md={4} sm={12}>
                            <Paper className={[classes.paper, classes.flyingMuleWrapper].join(' ')}>
                                <span className={`${classes.flyingMule} ${classes.imageFluid}`}>
                                    <LazyLoadImage effect="blur" src="../images/png/flying_mule.png" alt={t('home.youAreReadyToStart.flyingMuleAlt')} />
                                </span>
                            </Paper>
                        </Grid>
                        <Grid item md={8} sm={12} className={classes.maxWidth}>
                            <Grid container spacing={3} alignItems="flex-start" justify="space-between">
                                <Grid item lg={7} sm={6} xs={12}>
                                    <Paper className={[classes.paper, classes.centerContent].join(' ')}>
                                        <div className={[classes.codeWrapper, classes.codeTextHalfWidth].join(' ')}>
                                            <div className={classes.codeBlock}>
                                                <Typography noWrap variant="h5" className={[classes.codeText, classes.codeTextHalfWidthText].join(' ')}>
                                                    {copyCommand.text}
                                                </Typography>

                                                <LightTooltip title={copyCommand.status}>
                                                    <Link onClick={copyToClipboard} className={`${classes.copyIcon} ${classes.imageFluid}`}>
                                                        <img loading="lazy" src="../images/svg/copy_orange.svg" alt="" />
                                                    </Link>
                                                </LightTooltip>
                                            </div>
                                            <Typography className={classes.codeTextDescription}>
                                                {t('home.youAreReadyToStart.copyCodeDescription')}
                                            </Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                                <Grid item lg={4} sm={6} xs={12}>
                                    <Paper className={[classes.paper, classes.centerContent].join(' ')}>
                                        <div>
                                            <div className={classes.readGuideDiv}>
                                                <Link href="/docs" className={classes.readGuideLink}>
                                                    <Typography className={classes.readGuideTitle}>
                                                        {t('home.youAreReadyToStart.readTheGuide.title')}
                                                    </Typography>
                                                    <IconButton className={classes.iconButton}>
                                                        <img loading="lazy" src="../images/svg/arrow_orange.svg" alt={t('header.submitAlt')}/>
                                                    </IconButton>
                                                </Link>
                                            </div>
                                            <Typography className={classes.readGuideDescription}>
                                                {t('home.youAreReadyToStart.readTheGuide.description')}
                                            </Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </section>

            {/* Display footer */}
            <footer className={classes.footer}>
                <Footer />
            </footer> 
        </div>
    </div>
    );
};

export default React.memo(Home);
