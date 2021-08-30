import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Link, Typography } from '@material-ui/core';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import useStyles from './styles';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { EXTERNAL_LINKS } from '../../constants';

const Sponsor: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Grid container justify="space-evenly" alignItems="center">
        <Grid item xs={12} md={4}>
          <LazyLoadImage
            effect="blur"
            src="/images/png/sponsor_mule.png"
            alt={t('generic.sponsorMule')}
            className={classes.sponsorCompany}
          />
        </Grid>
        <Grid item xs={12} md={8} sm={12} className={classes.gridContainer}>
          <Grid container>
            <Grid item xs={12} md={6} sm={6}>
              <Typography className={classes.paragraph}>{t('sponsors.mayadata')}</Typography>
              <Link href={EXTERNAL_LINKS.MAYADATA_WEBSITE} rel="noreferrer" target="_blank">
                <img
                  src="/images/logos/mayadata_logo.svg"
                  alt={t('generic.mayadata')}
                  className={classes.sponsorCompany}
                />
              </Link>
            </Grid>
            <Grid item xs={12} md={6} sm={6}>
              <Typography className={classes.paragraph}>{t('sponsors.cncf')}</Typography>
              <Link href={EXTERNAL_LINKS.CNCF_WEBSITE} rel="noreferrer" target="_blank">
                <img
                  src="/images/logos/cncf_logo.svg"
                  alt={t('generic.cncf')}
                  className={classes.sponsorCompany}
                />
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Sponsor;
