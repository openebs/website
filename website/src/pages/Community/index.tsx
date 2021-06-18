import { Button, Grid, Paper, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import JoinCommunity from "../../components/JoinCommunity";
import { EXTERNAL_LINKS, VIEW_PORT } from "../../constants";
import { useViewport } from "../../hooks/viewportWidth";
import EventSlider from '../../components/EventSlider';
import events from '../../resources/events.json';

const Community: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  const dependentProjects = [
    {
      label: "rancher",
      image_src: "../Images/logos/rancher.svg",
      alt: t("generic.rancher"),
    },
    {
      label: "intel",
      image_src: "../Images/logos/intel.svg",
      alt: t("generic.intel"),
    },
    {
      label: "gostor",
      image_src: "../Images/logos/gostor.svg",
      alt: t("generic.gostor"),
    },
    {
      label: "openzfs",
      image_src: "../Images/logos/openzfs.svg",
      alt: t("generic.openzfs"),
    },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.communityBackground}>
      <div className={classes.sectionDiv}>
        {/* Commercial support intro section  */}
        {!(width < mobileBreakpoint) ? (
          /* Commercial support Desktop view  */
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h1" className={classes.pageHeader}>
                {t("community.title")}
              </Typography>
              <Typography className={classes.supportDescription}>{t("community.description")}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.supportImage}>
              <img
                src="/Images/svg/community.svg"
                alt={t("community.mule")}
                className={classes.introImage}
              />
            </Grid>
          </Grid>
        ) : (
          /* Commercial support mobile view  */
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h1" className={classes.pageHeader}>
                {t("community.title")}
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.supportImage}>
              <img
                src="/Images/svg/community.svg"
                alt={t("community.mule")}
                className={classes.introImage}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography className={classes.supportDescription}>{t("community.description")}</Typography>
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
            {t("community.communityEvents.title")}
          </Typography>
          <div className={`${classes.sectionDiv} ${classes.sliderFullWidth}`}>
          {events.length ? (
                <EventSlider />
            ) : (
                <Typography variant="h4" className={classes.noEventText}>
                    {t("community.communityEvents.noEvent.message")}
                </Typography>
            )}
          </div>
      </section>

      {/* Contribution section */}
      <div className={classes.installationDiv}>
        <section>
          <div className={classes.sectionDiv}>
          <Typography variant="h2" className={classes.sectionTitle}>
            {t("contributing.title")}
          </Typography>
          <Grid container justify="space-between">
            <Grid item lg={5} md={6} sm={12}>
              <Paper className={classes.paper}>
                <div className={classes.iconHolder}>
                  <img
                    src="../Images/svg/openebs_hacker.svg"
                    alt={t("contributing.openEBSHackerTitle")}
                  ></img>
                </div>
                <h3 className={classes.contributionSubTitle}>{t("contributing.openEBSHackerTitle")}</h3>
                <Typography className={classes.description}>
                  {t("contributing.openEBSHackerDescription")}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  className={classes.solidButton}
                  onClick={() => { window.open(EXTERNAL_LINKS.CONTRIBUTE_LINK, '_blank') }}
                >
                  {t("community.contributeBtnLabel")}
                </Button>
              </Paper>
            </Grid>
            <Grid item lg={5} md={6} sm={12}>
              <Paper className={classes.paper}>
                <div className={classes.iconHolder}>
                  <img
                    src="../Images/svg/governance.svg"
                    alt={t("contributing.governanceTitle")}
                  ></img>
                </div>
                <h3 className={classes.contributionSubTitle}>{t("contributing.governanceTitle")}</h3>
                <Typography className={classes.description}>
                  {t("contributing.governanceDescription")}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  className={classes.solidButton}
                  onClick={() => { window.open(EXTERNAL_LINKS.GOVERNANCE_LINK, '_blank') }}
                >
                  {t("community.checkItOutBtnLabel")}
                </Button>
              </Paper>
            </Grid>
          </Grid>
          </div>
        </section>

        {/* Sponsor and Dependent Projects */}
        <div className={classes.sectionDiv}>
          <Grid container justify="space-evenly" className={classes.sponsorAndDependentProjectsWrapper}>
            <Grid item xs={12} md={5}>
              <div className={classes.sponsorAndDependentProjectsDiv}>
                <Typography className={classes.sponsorAndDependentProjectsDescription}>
                  {t("community.sponsor.mainSponsor")}
                </Typography>
                <img
                  src="../Images/logos/mayadata_logo.svg"
                  alt={t("generic.mayadata")}
                  className={classes.mayaDataLogo}
                />
              </div>
              
            </Grid>
            <Grid item xs={12} md={7}>
            <div className={classes.sponsorAndDependentProjectsDiv}>
              <Typography className={classes.sponsorAndDependentProjectsDescription}>
                {t("community.sponsor.dependentProjects")}
              </Typography>
              <div>
                  {dependentProjects.map(({ label, image_src, alt }) => {
                      return (
                        <img
                        src={image_src}
                        alt={alt}
                        className={[classes.company, (label === 'rancher' ? classes.rancher : '')].join(' ')}
                      />
                      );
                  })}
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
  );
};
export default React.memo(Community);
