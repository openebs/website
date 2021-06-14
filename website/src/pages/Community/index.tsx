import { Button, Grid, Paper, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import JoinCommunity from "../../components/JoinCommunity";
import { EXTERNAL_LINKS, VIEW_PORT } from "../../constants";
import { useViewport } from "../../hooks/viewportWidth";

const Community: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

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

        {/* Sponsor and contributing companies */}
        <div className={classes.sectionDiv}>
          <Grid container justify="space-evenly" className={classes.sponsorWrapper}>
            <Grid item xs={12} md={5}>
              <div className={classes.sponsorDiv}>
                <Typography className={classes.sponsorDescription}>
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
            <div className={classes.sponsorDiv}>
              <Typography className={classes.sponsorDescription}>
                {t("community.sponsor.dependentProjects")}
              </Typography>
              <div>
                <img
                  src="../Images/logos/rancher.svg"
                  alt={t("generic.rancher")}
                  className={[classes.sponsorCompany, classes.rancher].join(' ')}
                />
                <img
                  src="../Images/logos/intel.svg"
                  alt={t("generic.intel")}
                  className={classes.sponsorCompany}
                />
                <img
                  src="../Images/logos/gostor.svg"
                  alt={t("generic.gostor")}
                  className={classes.sponsorCompany}
                />
                <img
                  src="../Images/logos/openzfs.svg"
                  alt={t("generic.openzfs")}
                  className={classes.sponsorCompany}
                />
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
export default Community;
