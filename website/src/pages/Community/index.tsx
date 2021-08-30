import {
  Button, Grid, Link, Paper, Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import useStyles from './styles';
import Footer from '../../components/Footer';
import JoinCommunity from '../../components/JoinCommunity';
import { EXTERNAL_LINKS, VIEW_PORT } from '../../constants';
import useViewport from '../../hooks/viewportWidth';
import EventSlider from '../../components/EventSlider';
import events from '../../resources/events.json';
import 'react-lazy-load-image-component/src/effects/blur.css';
import SeoJson from '../../resources/seo.json';
import { useCurrentHost } from '../../hooks/useCurrentHost';
import { Metadata } from '../../components/Metadata';

const Community: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { width } = useViewport();
  const { currentOrigin } = useCurrentHost();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  const dependentProjects = [
    {
      label: 'Longhorn',
      image_src: '../images/logos/longhorn.svg',
      alt: t('generic.longhorn'),
    },
    {
      label: 'intel',
      image_src: '../images/logos/intel.svg',
      alt: t('generic.intel'),
    },
    {
      label: 'gostor',
      image_src: '../images/logos/gostor.svg',
      alt: t('generic.gostor'),
    },
    {
      label: 'openzfs',
      image_src: '../images/logos/openzfs.svg',
      alt: t('generic.openzfs'),
    },
  ];

  return (
    <>
      <Metadata title={SeoJson.pages.community.title} description={SeoJson.pages.community.description} url={`${currentOrigin}${SeoJson.pages.community.url}`} image={`${currentOrigin}${SeoJson.pages.community.image}`} isPost={false} />
      <div className={classes.root}>
        <div className={classes.communityBackground}>
          <div className={classes.sectionDiv}>
            {/* Commercial support intro section  */}
            {!(width < mobileBreakpoint) ? (
            /* Commercial support Desktop view  */
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item xs={12} sm={6}>
                  <Typography variant="h1" className={classes.pageHeader}>
                    {t('community.title')}
                  </Typography>
                  <Typography className={classes.supportDescription}>
                    {t('community.description')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} className={classes.supportImage}>
                  <span className={classes.introImage}>
                    <LazyLoadImage
                      effect="blur"
                      src="/images/svg/community.svg"
                      alt={t('community.mule')}
                    />
                  </span>
                </Grid>
              </Grid>
            ) : (
            /* Commercial support mobile view  */
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <Typography variant="h1" className={classes.pageHeader}>
                    {t('community.title')}
                  </Typography>
                </Grid>
                <Grid item xs={12} className={classes.supportImage}>
                  <span className={classes.introImage}>
                    <LazyLoadImage
                      effect="blur"
                      src="/images/svg/community.svg"
                      alt={t('community.mule')}
                    />
                  </span>
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.supportDescription}>
                    {t('community.description')}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </div>

          {/* Join our community section */}
          <section>
            <JoinCommunity />
          </section>
        </div>
        {/* Community events slider section */}
        <section>
          <Typography variant="h2" className={classes.sectionTitle}>
            {t('community.communityEvents.title')}
          </Typography>
          <div className={`${classes.sectionDiv} ${classes.sliderFullWidth}`}>
            {events.length ? (
              <EventSlider />
            ) : (
              <Typography variant="h4" className={classes.noEventText}>
                <Link target="_blank" className={classes.noEventLink} href={EXTERNAL_LINKS.CNCF_EVENTS}>{t('community.communityEvents.noEvent.message')}</Link>
              </Typography>
            )}
          </div>
        </section>

        {/* Contribution section */}
        <div className={classes.installationDiv}>
          <section>
            <div className={classes.sectionDiv}>
              <Typography variant="h2" className={classes.sectionTitle}>
                {t('contributing.title')}
              </Typography>
              <Grid container justify="space-between">
                <Grid item lg={5} md={6} sm={12}>
                  <Paper className={classes.paper}>
                    <div className={classes.iconHolder}>
                      <img
                        loading="lazy"
                        src="../images/svg/openebs_hacker.svg"
                        alt={t('contributing.openEBSHackerTitle')}
                      />
                    </div>
                    <h3 className={classes.contributionSubTitle}>
                      {t('contributing.openEBSHackerTitle')}
                    </h3>
                    <Typography className={classes.description}>
                      {t('contributing.openEBSHackerDescription')}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      className={classes.solidButton}
                      onClick={() => {
                        window.open(EXTERNAL_LINKS.CONTRIBUTE_LINK, '_blank');
                      }}
                    >
                      {t('community.contributeBtnLabel')}
                    </Button>
                  </Paper>
                </Grid>
                <Grid item lg={5} md={6} sm={12}>
                  <Paper className={classes.paper}>
                    <div className={classes.iconHolder}>
                      <img
                        loading="lazy"
                        src="../images/svg/governance.svg"
                        alt={t('contributing.governanceTitle')}
                      />
                    </div>
                    <h3 className={classes.contributionSubTitle}>
                      {t('contributing.governanceTitle')}
                    </h3>
                    <Typography className={classes.description}>
                      {t('contributing.governanceDescription')}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      className={classes.solidButton}
                      onClick={() => {
                        window.open(EXTERNAL_LINKS.GOVERNANCE_LINK, '_blank');
                      }}
                    >
                      {t('community.checkItOutBtnLabel')}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          </section>

          {/* Sponsor and Dependent Projects */}
          <div className={classes.sectionDiv}>
            <Grid
              container
              justify="space-evenly"
              className={classes.sponsorAndDependentProjectsWrapper}
            >
              <Grid item xs={12} md={5}>
                <div className={classes.sponsorAndDependentProjectsDiv}>
                  <Typography
                    className={classes.sponsorAndDependentProjectsDescription}
                  >
                    {t('community.sponsor.mainSponsor')}
                  </Typography>
                  <img
                    loading="lazy"
                    src="../images/logos/mayadata_logo.svg"
                    alt={t('generic.mayadata')}
                    className={classes.mayaDataLogo}
                  />
                </div>
              </Grid>
              <Grid item xs={12} md={7}>
                <div className={classes.sponsorAndDependentProjectsDiv}>
                  <Typography
                    className={classes.sponsorAndDependentProjectsDescription}
                  >
                    {t('community.sponsor.dependentProjects')}
                  </Typography>
                  <div>
                    {dependentProjects.map(({ label, image_src, alt }) => (
                      <img
                        loading="lazy"
                        src={image_src}
                        alt={alt}
                        className={[
                          classes.company,
                          label === 'rancher' ? classes.rancher : '',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>

          {/* Display footer */}
          <footer className={classes.footer}>
            <Footer />
          </footer>
        </div>
      </div>
    </>
  );
};
export default React.memo(Community);
