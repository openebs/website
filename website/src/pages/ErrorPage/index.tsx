import { Button, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';
import Footer from '../../components/Footer';

interface NotFound {
  blogStatus: Boolean | undefined;
}

const ErrorPage: React.FC<NotFound> = ({ blogStatus }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={12}>
            <img
              loading="lazy"
              className={classes.errorImage}
              src="/images/svg/404_Image.svg"
              alt={t('errorPage.errorAltText')}
            />
            <Typography variant="h3" className={classes.pageHeader}>
              {t('errorPage.description')}
            </Typography>
            {/* Blog status check if true then show the button to route back to blog */}
            {blogStatus ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                className={classes.solidButton}
                onClick={() => {
                  history.push('/blog');
                }}
              >
                {t('errorPage.blogBtnLabel')}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                className={classes.solidButton}
                onClick={() => {
                  history.push('/');
                }}
              >
                {t('errorPage.homeBtnLabel')}
              </Button>
            )}
          </Grid>
        </Grid>
        <img
          loading="lazy"
          width="100%"
          src="/images/svg/background_illustration.svg"
          alt={t('errorPage.backgroundAltText')}
        />
      </div>
      {/* Blog status check if true then hide the footer */}
      {!blogStatus && (
        <footer className={classes.footer}>
          <Footer />
        </footer>
      )}
    </div>
  );
};
export default React.memo(ErrorPage);
