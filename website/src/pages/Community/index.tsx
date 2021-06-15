import { Button, Grid, Paper, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import JoinCommunity from "../../components/JoinCommunity";
import { EXTERNAL_LINKS, VIEW_PORT } from "../../constants";
import { useViewport } from "../../hooks/viewportWidth";
import EventSlider from '../../components/EventSlider';
import { events } from '../../components/EventSlider/events';

const Community: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  return (
    <div className={classes.root}>
      <div className={classes.introSection}>
        {/* Commercial support intro section  */}
        {!(width < mobileBreakpoint) ? (
          /* Commercial support Desktop view  */
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} md={6} className={classes.supportDescription}>
              <Typography variant="h1" className={classes.pageHeader}>
                {t("community.title")}
              </Typography>
              <Typography>{t("community.description")}</Typography>
            </Grid>
            <Grid item xs={12} md={6} className={classes.supportImage}>
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
            <Grid item xs={12} className={classes.supportDescription}>
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
            <Grid item xs={12} className={classes.supportDescription}>
              <Typography>{t("community.description")}</Typography>
            </Grid>
          </Grid>
        )}
      </div>

      {/* Join our community section */}
      <section>
        <JoinCommunity />
      </section>
      {/* Community events slider section */}
      {events.length && (
        <section>
            <Typography variant="h2" className={classes.sectionTitle}>
              {t("community.communityEvents.title")}
            </Typography>
            <div className={`${classes.sectionDiv} ${classes.sliderFullWidth}`}>
              <EventSlider />
            </div>
        </section>
      )}

      {/* Contribution section */}
      <div className={classes.installationDiv}>
        <section>
          <Typography variant="h2" className={classes.sectionTitle}>
            {t("contributing.title")}
          </Typography>
          <Grid container className={classes.sectionDiv}>
            <Grid item md={6} sm={12}>
              <Paper className={classes.paper}>
                <div className={classes.iconHolder}>
                  <img
                    src="../Images/svg/openebs_hacker.svg"
                    alt={t("contributing.whatsInItForYou.saveMoney")}
                  ></img>
                </div>
                <h3>{t("contributing.openEBSHackerTitle")}</h3>
                <Typography className={classes.description}>
                  {t("contributing.openEBSHackerDescription")}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.solidButton}
                  onClick={() => { window.open(EXTERNAL_LINKS.CONTRIBUTE_LINK, '_blank') }}
                >
                  {t("community.contributeBtnLabel")}
                </Button>
              </Paper>
            </Grid>
            <Grid item md={6} sm={12}>
              <Paper className={classes.paper}>
                <div className={classes.iconHolder}>
                  <img
                    src="../Images/svg/governance.svg"
                    alt={t("contributing.governance")}
                  ></img>
                </div>
                <h3>{t("contributing.governanceTitle")}</h3>
                <Typography className={classes.description}>
                  {t("contributing.governanceDescription")}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.solidButton}
                  onClick={() => { window.open(EXTERNAL_LINKS.GOVERNANCE_LINK, '_blank') }}
                >
                  {t("community.checkItOutBtnLabel")}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </section>

        {/* Sponsor and contributing companies */}
        <div className={classes.sponsorRoot}>
          <Grid container justify="space-evenly" alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography className={classes.sponsorDescription}>
                {t("community.sponsor.mainSponsor")}
              </Typography>
              <img
                src="../Images/logos/mayadata_logo.svg"
                alt={t("newsletter.email")}
                className={classes.sponsorCompany}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography className={classes.sponsorDescription}>
                {t("community.sponsor.dependentProjects")}
              </Typography>
              <img
                src="../Images/logos/rancher.svg"
                alt={t("newsletter.email")}
                className={classes.sponsorCompany}
              />
              <img
                src="../Images/logos/intel.svg"
                alt={t("newsletter.email")}
                className={classes.sponsorCompany}
              />
              <img
                src="../Images/logos/gostor.svg"
                alt={t("newsletter.email")}
                className={classes.sponsorCompany}
              />
              <img
                src="../Images/logos/openzfs.svg"
                alt={t("newsletter.email")}
                className={classes.sponsorCompany}
              />
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
export default Community;
