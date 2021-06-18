import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import { Grid, Typography } from "@material-ui/core";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

const Sponsor: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Grid container justify="space-evenly" alignItems="center">
        <Grid item xs={12} md={4}>
        <LazyLoadImage effect="blur"
            src="../Images/svg/sponsor_mule.svg"
            alt={t("newsletter.email")}
            className={classes.sponsorCompany}
          />
        </Grid>
        <Grid container xs={12} md={8} sm={12} className={classes.gridContainer}>
          <Grid item xs={12} md={6} sm={6}>
            <Typography className={classes.paragraph}>{t("sponsors.mayadata")}</Typography>
            <img
              src="../Images/logos/mayadata_logo.svg"
              alt={t("newsletter.email")}
              className={classes.sponsorCompany}
            />
          </Grid>
          <Grid item xs={12} md={6} sm={6}>
            <Typography className={classes.paragraph}>{t("sponsors.cncf")}</Typography>
            <img
              src="../Images/logos/cncf_logo.svg"
              alt={t("newsletter.email")}
              className={classes.sponsorCompany}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Sponsor;
