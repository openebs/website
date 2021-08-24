import {
  Button,
  Grid,
  // IconButton,
  // TextField
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EXTERNAL_LINKS } from '../../constants';
import useStyles from './styles';

interface NewsletterTitleProps {
  newsletterTitle: string;
}

// Added a title props to recive the newsletter title dynamic way as it has different content at all the places.

const Newsletter: React.FC<NewsletterTitleProps> = ({ newsletterTitle }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  // const handleNewsLetterEmailSubmit = (
  //   event: React.FormEvent<HTMLFormElement>
  // ) => {
  //   event.preventDefault();
  // };

  return (
    <>
      {/* Newsletter section */}
      <Grid container>
        <div className={classes.newsletter}>
          <div className={classes.newsWrapper}>
            <Grid item lg={12}>
              <h1 className={classes.title}>{newsletterTitle}</h1>

              <Button
                variant="contained"
                color="secondary"
                className={classes.solidButton}
                onClick={() => { window.open(EXTERNAL_LINKS.SUBSCRIBE_NEWSLETTER, '_blank'); }}
              >
                {t('newsletter.subscribe')}
              </Button>
              {/* Below commented code will be used later  */}
              {/* <form
                className={classes.textField}
                autoComplete="on"
                onSubmit={handleNewsLetterEmailSubmit}
              >
                <TextField
                  label={t("newsletter.email")}
                  fullWidth
                  color="primary"
                  InputProps={{
                    className: classes.newsletterInput,
                    endAdornment: (
                      <IconButton aria-label="submit" type="submit">
                        <img
                          src="../images/svg/rightArrow_white.svg"
                          alt={t("newsletter.email")}
                        />
                      </IconButton>
                    ),
                  }}
                  InputLabelProps={{
                    className: classes.newsletterLabel,
                  }}
                />
              </form> */}
            </Grid>
          </div>
        </div>
      </Grid>
    </>
  );
};

export default Newsletter;
