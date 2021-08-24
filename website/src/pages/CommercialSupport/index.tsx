import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import useStyles from './styles';
import SupportData from './supportData';
import Footer from '../../components/Footer';
import Newsletter from '../../components/Newsletter';
import { VIEW_PORT } from '../../constants';
import useViewport from '../../hooks/viewportWidth';
import Sponsor from '../../components/Sponsor';
import 'react-lazy-load-image-component/src/effects/blur.css';
import SeoJson from '../../resources/seo.json';
import { useCurrentHost } from '../../hooks/useCurrentHost';
import { Metadata } from '../../components/Metadata';

const Support: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentOrigin } = useCurrentHost();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;

  return (
    <>
      <Metadata title={SeoJson.pages.commericalsupport.title} description={SeoJson.pages.commericalsupport.description} url={`${currentOrigin}${SeoJson.pages.commericalsupport.url}`} image={`${currentOrigin}${SeoJson.pages.commericalsupport.image}`} isPost={false} />
      <div className={classes.root}>
        <div className={classes.introSection}>
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
                    {t('commercialSupport.title')}
                  </Typography>
                  <Typography className={classes.supportDescription}>
                    {t('commercialSupport.description')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} className={classes.supportImage}>
                  <span>
                    <LazyLoadImage
                      effect="blur"
                      src="/images/png/support_mule.png"
                      alt={t('commercialSupport.mule')}
                      className={classes.introImage}
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
                    {t('commercialSupport.title')}
                  </Typography>
                </Grid>
                <Grid item xs={12} className={classes.supportImage}>
                  <span>
                    <LazyLoadImage
                      effect="blur"
                      src="/images/png/support_mule.png"
                      alt={t('commercialSupport.mule')}
                      className={classes.introImage}
                    />
                  </span>
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.supportDescription}>
                    {t('commercialSupport.description')}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </div>
        </div>

        {/* Commercial supported companies and website links */}
        <Grid container className={classes.cardWrapper}>
          {SupportData
            ? SupportData.map((elm: any) => (
              <Grid
                container
                item
                xs={12}
                md={3}
                sm={6}
                key={elm.name}
                direction="row"
                alignItems="center"
                className={classes.cardSection}
              >
                <Card className={classes.cardProps} key={elm.id}>
                  <CardContent>
                    <div className={classes.cardImageWrapper}>
                      <Link
                        href={elm.website}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          loading="lazy"
                          src={elm.image}
                          alt={elm.name}
                        />
                      </Link>
                    </div>
                    <Typography className={classes.cardText}>
                      {elm.desc}
                    </Typography>
                  </CardContent>
                  <CardActions className={classes.cardAction}>
                    <a
                      href={elm.website}
                      rel="noopener noreferrer"
                      target="_blank"
                      className={classes.linkBtn}
                    >
                      <Button
                        size="large"
                        disableRipple
                        variant="text"
                        className={classes.cardActionButton}
                      >
                        {t('commercialSupport.visitWebsite')}
                        <img
                          loading="lazy"
                          src="../images/svg/arrow_orange.svg"
                          alt={t('header.submitAlt')}
                          className={classes.arrow}
                        />
                      </Button>
                    </a>
                  </CardActions>
                </Card>
              </Grid>
            ))
            : ''}
        </Grid>
        {/* Newsletter section  */}
        <Newsletter newsletterTitle={t('commercialSupport.newsletter')} />
        {/* Sponsor section  */}
        <Sponsor />
        {/* Display footer */}
        <footer className={classes.footer}>
          <Footer />
        </footer>
      </div>
    </>
  );
};
export default React.memo(Support);
