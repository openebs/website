import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import useStyles from './styles';
import Paper from '@material-ui/core/Paper';
import { Typography, Link } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import Footer from '../../components/Footer';
import JoinCommunity from '../../components/JoinCommunity';
import Newsletter from "../../components/Newsletter";
import {IconButton} from "@material-ui/core";
import Sponsor from "../../components/Sponsor";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { EXTERNAL_LINKS } from '../../constants';
import Asciinema from '../../components/Asciinema';
import MiniBlog from '../../components/MiniBlog';
import adopterData from "../../adopters.md";
import { events } from './events';

const Home: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    const [tabValue, setTabValue] = useState<number>(0);
    const [adopterTestimonials, setAdopterTestimonials] = useState<any>("");
    const [copyCommand, setCopyCommand] = useState({
        text: 'helm install stable/openebs --name openebs --namespace openebs',
        status: 'Copy to clipboard'
    });

    const handleTabChange = (_event: React.ChangeEvent<{}>, newTabValue: number) => {
        setTabValue(newTabValue);
    };

    const [isMobileView, setIsMobileView] = useState<boolean>(false);

    // const [logoSlidesPerScreen, setLogoSlidesPerScreen] = useState<number>(6);

    //function to fecth all the adoters testimonials
    const fetchAdoptersTestimonials = async () => {
        await fetch(adopterData).then((response) => {
         if (response.ok) {
             return response.text();
         }
         else {
             return Promise.reject(t('adoptersTestimonials.rejectDatainfo'));
         }
       }).then((text) => {
         const testimonials = require("mdtable2json").getTables(text);
         setAdopterTestimonials(testimonials[0].json);
       })
       .catch((err) => console.error(err));
     };

    useEffect(() => {
        // Function to set mobile/desktop view
        const setResponsiveness = () => {

        return window.innerWidth <= 768
            ? setIsMobileView(true)
            : setIsMobileView(false);
        };
        setResponsiveness();
        window.addEventListener("resize", () => {
            setResponsiveness();
        });
        fetchAdoptersTestimonials();
        //unregister the listerner on destroy of the hook
        return () => window.removeEventListener("resize", () => {
            setResponsiveness();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // logoSliderSettings for logos carousel
    var logoSliderSettings = {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 1000,
        speed: 500,
        slidesToShow: 7,
        slidesToScroll: 1,
        cssEase: "linear",
        arrows: false,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 5,
              }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 4,
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 2,
              }
            }
          ]
    };
    
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
            text: 'helm install stable/openebs --name openebs --namespace openebs',
            status: 'Copied to clipboard'})
        setTimeout(() => {
            setCopyCommand({
                text: 'helm install stable/openebs --name openebs --namespace openebs',
                status:'Copy to clipboard'})
        }, 2000);
    };

    // Installation
    const storageProviders = {
        Redis : {
            logo: "../Images/logos/redis.svg",
            white_logo: "../Images/logos/redis_white.svg"
        },
        Minio : {
            logo: "../Images/logos/minio.svg",
            white_logo: "../Images/logos/minio_white.svg"
        },
        Percona : {
            logo: "../Images/logos/percona.svg",
            white_logo: "../Images/logos/percona_white.svg"
        },
        MongoDB : {
            logo: "../Images/logos/mongodb.svg",
            white_logo: "../Images/logos/mongodb_white.svg"
        },
        Prometheus : {
            logo: "../Images/logos/prometheus.svg",
            white_logo: "../Images/logos/prometheus_white.svg"
        },
        MySQL : {
            logo: "../Images/logos/mysql.svg",
            white_logo: "../Images/logos/mysql_white.svg"
        }
    };

    const defaultInstallationButtonStatus: any = {
        Redis : {
            status: false,
            src: 'casts/redis.cast'
        },
        Minio : {
            status: false,
            src: 'casts/minio.cast'
        },
        Percona : {
            status: false,
            src: 'casts/percona.cast'
        },
        MongoDB : {
            status: false,
            src: 'casts/mongodb.cast'
        },
        Prometheus : {
            status: false,
            src: 'casts/prometheus.cast'
        },
        MySQL : {
            status: false,
            src: 'casts/mysql.cast'
        },
    };

    
    const [installationButtonStatus, setInstallationButtonStatus] = useState({
        ...defaultInstallationButtonStatus,
        MySQL : {
            ...defaultInstallationButtonStatus.MySQL,
            status: true
        }, // setting MySQL selected by default
    });

    const [asciinemaFileSrc, setAsciinemaFileSrc]= useState('casts/mysql.cast');  // setting MySQL selected by default
    const [asciinemaTitle, setAsciinemaTitle]= useState('MySQL');  // setting MySQL selected by default
    const displayProviderInstallation = (provider: string) => {
        setInstallationButtonStatus({
            ...defaultInstallationButtonStatus,
            [provider]: {
                ...defaultInstallationButtonStatus[provider],
                status: true
            }
        });
        setAsciinemaFileSrc(defaultInstallationButtonStatus[provider].src);
        setAsciinemaTitle(provider);
    };

    const SampleNextArrow = (props:any) => {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
          ><img src="../Images/svg/right_arrow.svg" alt={t('home.adaptorsTestimonials.nextArrowAlt')} /></div>
        );
      }
      
    const SamplePrevArrow = (props:any) => {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
          ><img src="../Images/svg/left_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} /></div>
        );
    }

    const settings = {
        infinite: true,
        autoplay: false,
        speed: 500,
        slidesToShow:3,
        slidesToScroll: 1,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />,
        className:`${classes.slidewrap} center`,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 2,
                swipeToSlide: true,
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
                infinite:false,
                arrows: false
              }
            }
          ]
    }

    const FetchDate = (date:any) => {
        const givenDate = new Date(date.date);
        const day = givenDate.getDate();
        const month = givenDate.toLocaleString('default', { month: 'long' });
        return (
        <>
            <Typography className={classes.titleText} variant="h6">{day}</Typography>
            <Typography className={classes.subText}>{month}</Typography>
          </>
        );
      }

    return (
        <div>
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
                                <img src="../Images/png/homepage_main.png" alt={t('home.landingScreenImageAlt')} className={classes.landingImage}></img>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={[classes.paper,classes.tabsWrapper].join(' ')}>
                                    <Tabs value={tabValue} onChange={handleTabChange} TabIndicatorProps={{className:classes.tabsIndicator}}>
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
                                            endIcon={<img src="../Images/svg/play.svg" alt={t('home.openebs.watchDemo')}></img>}
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
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href={EXTERNAL_LINKS.OPENEBS_CONCEPTS} target="_blank">
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
                                        endIcon={<img src="../Images/logos/slack_white.svg" alt={t('home.community.joinOnSlack')}></img>}
                                        href="/community">
                                            {t('home.community.joinOnSlack')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img src="../Images/logos/github_orange.svg" alt={t('home.community.joinOnGitHub')}></img>}
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

                                    <Tabs value={tabValue} onChange={handleTabChange} TabIndicatorProps={{className:classes.tabsIndicator}}>
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
                                            endIcon={<img src="../Images/svg/play.svg" alt={t('home.openebs.watchDemo')}></img>}
                                            href={EXTERNAL_LINKS.OPENEBS_YOUTUBE_INTRO} target="_blank"
                                        >
                                        {t('home.openebs.watchDemo')}
                                        </Button>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={1} >
                                        <Typography className={classes.tabBodyText}>
                                            {t('home.concepts.description')}
                                        </Typography>
                                        <Button variant="contained" color="secondary" className={classes.solidButton} href={EXTERNAL_LINKS.OPENEBS_CONCEPTS} target="_blank">
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
                                        endIcon={<img src="../Images/logos/slack_white.svg" alt={t('home.community.joinOnSlack')}></img>}
                                        href="/community">
                                            {t('home.community.joinOnSlack')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            endIcon={<img src="../Images/logos/github_orange.svg" alt={t('home.community.joinOnGitHub')}></img>}
                                            href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} target="_blank"
                                        >
                                        {t('home.community.joinOnGitHub')}
                                        </Button>
                                    </TabPanel>
                                </Paper>
                            </Grid>
                            <Grid item lg={6} md={5} sm={4}>
                                <Paper className={classes.paper}>
                                    <img src="../Images/png/homepage_main.png" alt={t('home.landingScreenImageAlt')} className={classes.landingImage}></img>
                                </Paper>
                            </Grid>
                        </Grid>
                }
            </section>


            <section>
                <Slider {...logoSliderSettings} className={classes.logoCarousel}>
                    <div>
                        <img src="../Images/logos/bloomberg_blue.png" alt={t('home.usedInProductionBy.bloomberg')} />
                    </div>
                    <div>
                        <img src="../Images/logos/arista_blue.png" alt={t('home.usedInProductionBy.arista')} />
                    </div>
                    <div>
                        <img src="../Images/logos/orange_blue.png" alt={t('home.usedInProductionBy.orange')} />
                    </div>
                    <div>
                        <img src="../Images/logos/optoro_blue.png" alt={t('home.usedInProductionBy.optoro')} />
                    </div>
                    <div>
                        <img src="../Images/logos/comcast_blue.png" alt={t('home.usedInProductionBy.comcast')} />
                    </div>
                    <div>
                        <img src="../Images/logos/bloomberg_blue.png" alt={t('home.usedInProductionBy.bloomberg')} />
                    </div>
                    <div>
                        <img src="../Images/logos/arista_blue.png" alt={t('home.usedInProductionBy.arista')} />
                    </div>
                    <div>
                        <img src="../Images/logos/orange_blue.png" alt={t('home.usedInProductionBy.orange')} />
                    </div>
                    <div>
                        <img src="../Images/logos/optoro_blue.png" alt={t('home.usedInProductionBy.optoro')} />
                    </div>
                    <div>
                        <img src="../Images/logos/comcast_blue.png" alt={t('home.usedInProductionBy.comcast')} />
                    </div>
                </Slider>
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
                                <img src="../Images/svg/money_bag.svg" alt={t('home.whatsInItForYou.saveMoney')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.saveMoney')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img src="../Images/svg/box.svg" alt={t('home.whatsInItForYou.flexibility')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.flexibility')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img src="../Images/svg/wheel.svg" alt={t('home.whatsInItForYou.resilience')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.resilience')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img src="../Images/svg/cloud.svg" alt={t('home.whatsInItForYou.restoreData')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.restoreData')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img src="../Images/svg/lock.svg" alt={t('home.whatsInItForYou.openSource')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.openSource')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={6}>
                        <Paper className={[classes.paper, classes.iconTextContainer].join(' ')}>
                            <div className={classes.iconHolder}>
                                <img src="../Images/svg/settings.svg" alt={t('home.whatsInItForYou.granularControl')}></img>
                            </div>
                            <Typography className={classes.description}>
                                {t('home.whatsInItForYou.granularControl')}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </section>


            <section>
                <div className={[classes.sectionDiv, classes.installationDiv].join(' ')}>
                    <Typography variant="h2" className={classes.sectionTitle}>
                        {t('home.installation.title')}
                    </Typography>
                    <Typography variant="h5" className={classes.sectionSubTitle}>
                        {t('home.installation.description')} 
                    </Typography>
                    <div className={classes.codeWrapper}>
                        <Typography variant="h5" className={classes.codeText}>
                            {copyCommand.text}
                        </Typography>
                        
                        <LightTooltip title={copyCommand.status}>
                            <Link onClick={copyToClipboard}><img src="../Images/svg/copy.svg" alt={copyCommand.status}></img></Link>
                        </LightTooltip>
                        <hr className={classes.divider}/>
                    </div>
                    <Typography className={classes.orSeparatorText}>
                        {t('home.installation.or')}
                    </Typography>
                    <Button variant="contained" color="secondary" className={[classes.solidButton,classes.middleButton].join(' ')} href={EXTERNAL_LINKS.OPENEBS_INSTALLATION_GUIDE} target="_blank">
                        {t('home.installation.readTheGuide.button')}
                    </Button>
                    <div className={classes.installationDescriptionWrapper}>
                        <Typography className={classes.installationDescription}>
                            {t('home.installation.readTheGuide.descriptionPart1')}
                        </Typography>
                        <Typography className={classes.installationDescription}>
                            {t('home.installation.readTheGuide.descriptionPart2')}
                        </Typography>
                    </div>
                    
                    <div>
                        {isMobileView ? 
                            <div className={classes.installationCodeWrapper}>

                                <Paper className={[classes.paper, classes.desktopCommandWrapper].join(' ')}>
                                    <img src="../Images/png/homepage_desktop.png" alt={t('home.installation.desktopImgAlt')} className={classes.desktopImage}></img>
                                    <div className={classes.installationProviderCommandWrapper}>
                                        <Typography className={classes.installationProvider}>
                                            {asciinemaTitle}
                                        </Typography>
                                        <Asciinema  src={asciinemaFileSrc} />
                                    </div>
                                    
                                </Paper>

                                <div className={classes.installationButtonDiv}>
                                    <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Redis.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.Redis.status ? storageProviders.Redis.white_logo : storageProviders.Redis.logo} alt={t('home.installation.redis')}></img>}
                                            onClick={() => displayProviderInstallation('Redis')}>
                                            {t('home.installation.redis')}
                                        </Button>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Minio.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.Minio.status ? storageProviders.Minio.white_logo :storageProviders.Minio.logo} alt={t('home.installation.minio')}></img>}
                                            onClick={() => displayProviderInstallation('Minio')}>
                                            {t('home.installation.minio')}
                                        </Button>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Percona.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.Percona.status ? storageProviders.Percona.white_logo : storageProviders.Percona.logo} alt={t('home.installation.percona')}></img>}
                                            onClick={() => displayProviderInstallation('Percona')}>
                                            {t('home.installation.percona')}
                                        </Button>
                                    </Paper>

                                    <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MongoDB.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.MongoDB.status ? storageProviders.MongoDB.white_logo : storageProviders.MongoDB.logo} alt={t('home.installation.mongodb')}></img>}
                                            onClick={() => displayProviderInstallation('MongoDB')}>
                                            {t('home.installation.mongodb')}
                                        </Button>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.Prometheus.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.Prometheus.status ? storageProviders.Prometheus.white_logo : storageProviders.Prometheus.logo} alt={t('home.installation.prometheus')}></img>}
                                            onClick={() => displayProviderInstallation('Prometheus')}>
                                            {t('home.installation.prometheus')}
                                        </Button>
                                        <Button variant="contained" 
                                            className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MySQL.status ? classes.installationButtonActive : ''].join(' ')}
                                            startIcon={<img src={installationButtonStatus.MySQL.status ? storageProviders.MySQL.white_logo : storageProviders.MySQL.logo} alt={t('home.installation.mysql')}></img>}
                                            onClick={() => displayProviderInstallation('MySQL')}>
                                            {t('home.installation.mysql')}
                                        </Button>
                                    </Paper>
                                </div>
                                
                            </div>
                        
                        :

                            <div className={classes.installationCodeWrapper}>
                                <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Redis.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.Redis.status ? storageProviders.Redis.white_logo : storageProviders.Redis.logo} alt={t('home.installation.redis')}></img>}
                                        onClick={() => displayProviderInstallation('Redis')}>
                                        {t('home.installation.redis')}
                                    </Button>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Minio.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.Minio.status ? storageProviders.Minio.white_logo :storageProviders.Minio.logo} alt={t('home.installation.minio')}></img>}
                                        onClick={() => displayProviderInstallation('Minio')}>
                                        {t('home.installation.minio')}
                                    </Button>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Percona.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.Percona.status ? storageProviders.Percona.white_logo : storageProviders.Percona.logo} alt={t('home.installation.percona')}></img>}
                                        onClick={() => displayProviderInstallation('Percona')}>
                                        {t('home.installation.percona')}
                                    </Button>
                                </Paper>
                            
                            
                                <Paper className={[classes.paper, classes.desktopCommandWrapper].join(' ')}>
                                    <img src="../Images/png/homepage_desktop.png" alt={t('home.installation.desktopImgAlt')} className={classes.desktopImage}></img>
                                    <div className={classes.installationProviderCommandWrapper}>
                                        <Typography className={classes.installationProvider}>
                                            {asciinemaTitle}
                                        </Typography>
                                        <Asciinema  src={asciinemaFileSrc} />
                                    </div>
                                </Paper>
                            
                            
                                <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MongoDB.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.MongoDB.status ? storageProviders.MongoDB.white_logo : storageProviders.MongoDB.logo} alt={t('home.installation.mongodb')}></img>}
                                        onClick={() => displayProviderInstallation('MongoDB')}>
                                        {t('home.installation.mongodb')}
                                    </Button>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.Prometheus.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.Prometheus.status ? storageProviders.Prometheus.white_logo : storageProviders.Prometheus.logo} alt={t('home.installation.prometheus')}></img>}
                                        onClick={() => displayProviderInstallation('Prometheus')}>
                                        {t('home.installation.prometheus')}
                                    </Button>
                                    <Button variant="contained" 
                                        className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MySQL.status ? classes.installationButtonActive : ''].join(' ')}
                                        startIcon={<img src={installationButtonStatus.MySQL.status ? storageProviders.MySQL.white_logo : storageProviders.MySQL.logo} alt={t('home.installation.mysql')}></img>}
                                        onClick={() => displayProviderInstallation('MySQL')}>
                                        {t('home.installation.mysql')}
                                    </Button>
                                </Paper>
                            </div>

                        }
                        
                    </div>
                </div>
            </section>


            {/* Section: Join our community */}
            <section>
                <JoinCommunity/>
            </section>
            {/* Section: Community events */}
            <section>
                <Typography variant="h2" className={classes.sectionTitle}>
                    {t("home.communityEvents.title")}
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} className={classes.imageFluid}>
                        <img src="../Images/svg/community.svg" alt={t("home.communityEvents.communityImageAlt")} />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Slider {...settings}>
                            {events.map((event : any)=>{
                                return (
                                    <div>
                                        <div className={classes.slide}>
                                            <Box mb={2}>
                                                <FetchDate date={event.date}/>
                                            </Box>
                                            <Typography variant="h4" className={classes.titleText}>{event.title}</Typography>
                                            <Typography className={classes.subText}>{event.description}</Typography>
                                            {event.buttonText && (
                                                <Box mt={2}>
                                                    <Link className={classes.linkText} href={event.buttonLink}>
                                                        <Box display="flex">
                                                            {event.buttonText} 
                                                            <img src="../Images/svg/arrow_orange.svg" alt=""/>
                                                        </Box>
                                                    </Link>
                                                </Box>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </Slider>
                    </Grid>
                </Grid>
            </section>
            {/* Section: Our adopters say about us */}
            <section>
                {isMobileView && 
                    <Grid item xs={12} className={classes.testimonialMuleWrapper}>
                        <Paper className={[classes.paper, classes.testimonialMule].join(' ')}>
                            <img src="../Images/png/testimonials_mule.png" alt=""></img>
                        </Paper>
                    </Grid>
                }
                <Typography variant="h2" className={classes.sectionTitle}>
                    {t('home.adaptorsTestimonials.title')}
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item sm={7}>
                        <Paper className={[classes.paper, classes.testimonialPaper].join(' ')}>
                            <Slider dots={false}
                                    infinite= {true}
                                    autoplay= {true}
                                    autoplaySpeed= {4000}
                                    speed={500}
                                    slidesToShow={1}
                                    slidesToScroll= {1}
                                    cssEase="linear"
                                    arrows={true}
                                    rtl={true}
                                    centerMode={true}
                                    prevArrow= {<SamplePrevArrow />}
                                    nextArrow= {<SampleNextArrow />}
                                    className={classes.testimonialCarousel}>
                                {adopterTestimonials && adopterTestimonials.map((elm: any ) => {
                                    return (  
                                        <div key={elm.id}>
                                            <div className={classes.testimonialWrapper}> 
                                                {/* <img src={elm.organization} alt={t('home.usedInProductionBy.bloomberg')} /> */}
                                                <Typography className={classes.testimonialTitle}>
                                                    {elm.organization}
                                                </Typography>
                                                <Typography className={classes.testimonialText}>
                                                    {elm.testimonial}
                                                </Typography>
                                                {/* commented code will be used for upcomming releases */}
                                                {/* <div className={classes.testimonialWriterWrapper}>
                                                    <img src={profileURL} alt={writer} />
                                                    <Typography className={classes.testimonialWriter}>{writer}</Typography>
                                                </div> */}
                                            </div>
                                        </div> 
                                        
                                    );
                                })} 
                            </Slider>
                        </Paper>
                    </Grid>
                    {!isMobileView && 
                        <Grid item sm={5} className={classes.testimonialMuleWrapper}>
                            <Paper className={[classes.paper, classes.testimonialMule].join(' ')}>
                                <img src="../Images/png/testimonials_mule.png" alt=""></img>
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
                    <Grid container spacing={3}>
                        <Grid item lg={4} md={4} sm={12}>
                            <Paper className={[classes.paper, classes.flyingMuleWrapper].join(' ')}>
                                <img src="../Images/png/flying_mule.png" alt={t('home.youAreReadyToStart.flyingMuleAlt')} className={classes.flyingMule}></img>
                            </Paper>
                        </Grid>
                        <Grid item lg={5} md={4} sm={6}>
                            <Paper className={[classes.paper, classes.centerContent].join(' ')}>
                                <div className={[classes.codeWrapper, classes.codeTextHalfWidth].join(' ')}>
                                    <Typography variant="h5" className={[classes.codeText, classes.codeTextHalfWidthText].join(' ')}>
                                        {copyCommand.text}
                                    </Typography>
                                    
                                    <LightTooltip title={copyCommand.status}>
                                        <Link onClick={copyToClipboard}><img src="../Images/svg/copy_orange.svg" alt=""></img></Link>
                                    </LightTooltip>
                                    <hr className={[classes.divider, classes.codeTextHalfWidthUnderline].join(' ')}/>

                                    <Typography className={classes.codeTextDescription}>
                                        {t('home.youAreReadyToStart.copyCodeDescription')}
                                    </Typography>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item lg={3} md={4} sm={6}>
                            <Paper className={[classes.paper, classes.centerContent].join(' ')}>
                                <div>
                                    <div className={classes.readGuideDiv}>
                                        <Link href={EXTERNAL_LINKS.OPENEBS_DOCS} className={classes.readGuideLink}>
                                            <Typography className={classes.readGuideTitle}>
                                                {t('home.youAreReadyToStart.readTheGuide.title')}
                                            </Typography>
                                            <IconButton className={classes.iconButton}>
                                                <img src="../Images/svg/arrow_orange.svg" alt={t('header.submitAlt')}/>
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

export default Home;
