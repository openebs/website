import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import { Grid, Typography } from "@material-ui/core";

const Sponsor: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Grid container justify="space-evenly" alignItems="center">
        <Grid item xs={12} md={4}>
          <img
            src="../Images/svg/sponsor_mule.svg"
            alt={t("newsletter.email")}
            className={classes.sponsorCompany}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography>{t("sponsors.mayadata")}</Typography>
          <img
            src="../Images/logos/mayadata_logo.svg"
            alt={t("newsletter.email")}
            className={classes.sponsorCompany}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography>{t("sponsors.cncf")}</Typography>
          <img
            src="../Images/logos/cncf_logo.svg"
            alt={t("newsletter.email")}
            className={classes.sponsorCompany}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Sponsor;
