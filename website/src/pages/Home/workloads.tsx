import React, { useState, useEffect } from "react";
import { Typography, Link, Box, Button, Paper, withStyles, Tooltip } from '@material-ui/core';
import { useTranslation } from "react-i18next";
import useStyles from './styles';
import { EXTERNAL_LINKS, VIEW_PORT } from "../../constants";
import Asciinema from '../../components/Asciinema';
import { useViewport } from "../../hooks/viewportWidth";
import { useExternalStyles } from "../../hooks/useExternalStyles";
import { useScript } from '../../hooks/useScript';

export const Workloads: React.FC = () => {

    useExternalStyles('css/asciinema-player.css');
    useExternalStyles('css/custom-asciinema-player.css');
    const asciinemaScript = useScript('js/asciinema-player.js');

     const { t } = useTranslation();
     const classes = useStyles();

     const [copyCommand, setCopyCommand] = useState({
        text: 'helm install stable/openebs --name openebs --namespace openebs',
        status: 'Copy to clipboard'
    });

    const [isTabletView, setIsTabletView] = useState<boolean>(false);
    const { width } = useViewport();

    useEffect( () => {
        window.innerWidth <= VIEW_PORT.LAPTOP_BREAKPOINT ? setIsTabletView(true) : setIsTabletView(false);
    },[width])

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
            logo: "../images/logos/redis.svg",
            white_logo: "../images/logos/redis_white.svg"
        },
        Minio : {
            logo: "../images/logos/minio.svg",
            white_logo: "../images/logos/minio_white.svg"
        },
        Percona : {
            logo: "../images/logos/percona.svg",
            white_logo: "../images/logos/percona_white.svg"
        },
        MongoDB : {
            logo: "../images/logos/mongodb.svg",
            white_logo: "../images/logos/mongodb_white.svg"
        },
        Prometheus : {
            logo: "../images/logos/prometheus.svg",
            white_logo: "../images/logos/prometheus_white.svg"
        },
        MySQL : {
            logo: "../images/logos/mysql.svg",
            white_logo: "../images/logos/mysql_white.svg"
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

    return(
        <div className={classes.installationDiv}>
            <Typography variant="h2" className={classes.sectionTitle}>
                {t('home.installation.title')}
            </Typography>
            <Typography variant="h5" className={classes.sectionSubTitle}>
                {t('home.installation.description')} 
            </Typography>
            <Box className={classes.codeWrapper} mt={2}>
                <Box className={classes.codeBlock} paddingX={2}>
                    <Typography variant="h5" className={classes.codeText}>
                        {copyCommand.text}
                    </Typography>
                    <LightTooltip title={copyCommand.status}>
                        <Link onClick={copyToClipboard} className={`${classes.copyIcon} ${classes.imageFluid}`}>
                            <img loading="lazy" src="../images/svg/copy.svg" alt={copyCommand.status} />
                        </Link>
                    </LightTooltip>
                </Box >
            </Box>
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
                {isTabletView ? 
                    <div className={classes.installationCodeWrapper}>

                        <Paper className={[classes.paper, classes.desktopCommandWrapper].join(' ')}>
                            <img loading="lazy" src="../images/png/homepage_desktop.png" alt={t('home.installation.desktopImgAlt')} className={classes.desktopImage}></img>
                            <div className={classes.installationProviderCommandWrapper}>
                                <Typography className={classes.installationProvider}>
                                    {asciinemaTitle}
                                </Typography>
                                {
                                    (asciinemaScript === 'ready') &&  <Asciinema  src={asciinemaFileSrc} />
                                }
                            </div>
                        </Paper>

                        <div className={classes.installationButtonDiv}>
                            <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Redis.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.Redis.status ? storageProviders.Redis.white_logo : storageProviders.Redis.logo} alt={t('home.installation.redis')}></img>}
                                    onClick={() => displayProviderInstallation('Redis')}>
                                    {t('home.installation.redis')}
                                </Button>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Minio.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.Minio.status ? storageProviders.Minio.white_logo :storageProviders.Minio.logo} alt={t('home.installation.minio')}></img>}
                                    onClick={() => displayProviderInstallation('Minio')}>
                                    {t('home.installation.minio')}
                                </Button>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Percona.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.Percona.status ? storageProviders.Percona.white_logo : storageProviders.Percona.logo} alt={t('home.installation.percona')}></img>}
                                    onClick={() => displayProviderInstallation('Percona')}>
                                    {t('home.installation.percona')}
                                </Button>
                            </Paper>

                            <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MongoDB.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.MongoDB.status ? storageProviders.MongoDB.white_logo : storageProviders.MongoDB.logo} alt={t('home.installation.mongodb')}></img>}
                                    onClick={() => displayProviderInstallation('MongoDB')}>
                                    {t('home.installation.mongodb')}
                                </Button>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.Prometheus.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.Prometheus.status ? storageProviders.Prometheus.white_logo : storageProviders.Prometheus.logo} alt={t('home.installation.prometheus')}></img>}
                                    onClick={() => displayProviderInstallation('Prometheus')}>
                                    {t('home.installation.prometheus')}
                                </Button>
                                <Button variant="contained" 
                                    className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MySQL.status ? classes.installationButtonActive : ''].join(' ')}
                                    startIcon={<img loading="lazy" src={installationButtonStatus.MySQL.status ? storageProviders.MySQL.white_logo : storageProviders.MySQL.logo} alt={t('home.installation.mysql')}></img>}
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
                                startIcon={<img loading="lazy" src={installationButtonStatus.Redis.status ? storageProviders.Redis.white_logo : storageProviders.Redis.logo} alt={t('home.installation.redis')}></img>}
                                onClick={() => displayProviderInstallation('Redis')}>
                                {t('home.installation.redis')}
                            </Button>
                            <Button variant="contained" 
                                className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Minio.status ? classes.installationButtonActive : ''].join(' ')}
                                startIcon={<img loading="lazy" src={installationButtonStatus.Minio.status ? storageProviders.Minio.white_logo :storageProviders.Minio.logo} alt={t('home.installation.minio')}></img>}
                                onClick={() => displayProviderInstallation('Minio')}>
                                {t('home.installation.minio')}
                            </Button>
                            <Button variant="contained" 
                                className={[classes.installationButton, classes.installationLeftButton, installationButtonStatus.Percona.status ? classes.installationButtonActive : ''].join(' ')}
                                startIcon={<img loading="lazy" src={installationButtonStatus.Percona.status ? storageProviders.Percona.white_logo : storageProviders.Percona.logo} alt={t('home.installation.percona')}></img>}
                                onClick={() => displayProviderInstallation('Percona')}>
                                {t('home.installation.percona')}
                            </Button>
                        </Paper>

                        <Paper className={[classes.paper, classes.desktopCommandWrapper].join(' ')}>
                            <img loading="lazy" src="../images/png/homepage_desktop.png" alt={t('home.installation.desktopImgAlt')} className={classes.desktopImage}></img>
                            <div className={classes.installationProviderCommandWrapper}>
                                <Typography className={classes.installationProvider}>
                                    {asciinemaTitle}
                                </Typography>
                                {
                                    (asciinemaScript === 'ready') &&  <Asciinema  src={asciinemaFileSrc} />
                                }
                            </div>
                        </Paper>

                        <Paper className={[classes.paper, classes.installationButtonsWrapper].join(' ')}>
                            <Button variant="contained" 
                                className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MongoDB.status ? classes.installationButtonActive : ''].join(' ')}
                                startIcon={<img loading="lazy" src={installationButtonStatus.MongoDB.status ? storageProviders.MongoDB.white_logo : storageProviders.MongoDB.logo} alt={t('home.installation.mongodb')}></img>}
                                onClick={() => displayProviderInstallation('MongoDB')}>
                                {t('home.installation.mongodb')}
                            </Button>
                            <Button variant="contained" 
                                className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.Prometheus.status ? classes.installationButtonActive : ''].join(' ')}
                                startIcon={<img loading="lazy" src={installationButtonStatus.Prometheus.status ? storageProviders.Prometheus.white_logo : storageProviders.Prometheus.logo} alt={t('home.installation.prometheus')}></img>}
                                onClick={() => displayProviderInstallation('Prometheus')}>
                                {t('home.installation.prometheus')}
                            </Button>
                            <Button variant="contained" 
                                className={[classes.installationButton, classes.installationRightButton, installationButtonStatus.MySQL.status ? classes.installationButtonActive : ''].join(' ')}
                                startIcon={<img loading="lazy" src={installationButtonStatus.MySQL.status ? storageProviders.MySQL.white_logo : storageProviders.MySQL.logo} alt={t('home.installation.mysql')}></img>}
                                onClick={() => displayProviderInstallation('MySQL')}>
                                {t('home.installation.mysql')}
                            </Button>
                        </Paper>
                    </div>
                }
            </div>
        </div>
    )
}