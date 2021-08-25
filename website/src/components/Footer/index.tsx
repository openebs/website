/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Toolbar,
  Paper,
  Typography,
  Link,
  Button,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import useStyles from './style';
import { socialLinks, getStarted } from './footerLinks';
import {
  EXTERNAL_LINKS, EXTERNAL_LINK_LABELS, VIEW_PORT, API,
} from '../../constants';
import useViewport from '../../hooks/viewportWidth';
import topContributors from '../../resources/topContributors.json';
import newContributors from '../../resources/newContributors.json';

const Footer: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  // const [emailValue, setEmailValue] = useState<string>('');
  // const [disableContinueButton, setDisableContinueButton] = useState<boolean>(true);

  const openEBSLogo = (
    <img loading="lazy" src="/images/logos/logo.svg" className={classes.logo} alt={t('generic.openEBS')} />
  );

  // useEffect(() => {
  //     // Enable continue button when email is valid
  //     validateEmail(emailValue) ? setDisableContinueButton(false) : setDisableContinueButton(true);
  // },[emailValue]);

  // const handleNewsLetterEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     // Need to write logic to save email
  //   };

  // This block of code is used to display social links
  const displaySocialLinks = () => (
    <div className={classes.socialIconsWrapper}>
      {socialLinks.map(({ label, href, imgURL }) => (
        <Link href={href} target="_blank" className={classes.socialIconButton} key={label}>
          <img loading="lazy" src={imgURL} alt={label} />
        </Link>
      ))}
    </div>
  );

  // This block of code is used to display newsletter
  const displayNewsLetter = () => (
    <div>
      <Typography variant="h6" className={classes.columnTitle}>
        {t('footer.newsLetterTitle')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        className={classes.solidButton}
        onClick={() => { window.open(EXTERNAL_LINKS.SUBSCRIBE_NEWSLETTER, '_blank'); }}
      >
        {t('newsletter.subscribe')}
      </Button>
      {/* Comment code will be used later */}
      {/* <form noValidate autoComplete="on" onSubmit={handleNewsLetterEmailSubmit}>
                  <div className={classes.newsletterFormWrapper}>
                      <TextField
                      label={t('footer.emailLabel')}
                      fullWidth
                      name="email"
                      onChange={(e) =>
                          setEmailValue(e.target.value)
                      }
                      InputProps={{
                          className: classes.newsletterInput,
                      }}
                      InputLabelProps={{
                          className: classes.newsletterLabel,
                      }}
                      />
                      <IconButton aria-label="submit" className={classes.iconButton} disabled={disableContinueButton} type="submit">
                          <img src="../images/svg/arrow_orange.svg" alt={t('header.submitAlt')}/>
                      </IconButton>
                  </div>
              </form> */}
    </div>
  );

  const formatName = (str:string) => {
    if (str.indexOf('(') > -1) {
      return str.substring(str.lastIndexOf('(') + 1, str.lastIndexOf(')')).trim();
    }
    return str;
  };

  // This block of code is used to display get started links
  const displayGetStarted = () => (
    <div>
      <Typography variant="h6" className={classes.columnTitle}>
        {t('footer.getStarted')}
      </Typography>
      <Typography className={classes.columnListWrapper}>
        {getStarted.map(({ label, href }) => (
          <Link
            href={href}
            className={classes.columnListItem}
            key={label}
            target={(label === EXTERNAL_LINK_LABELS.GITHUB) ? '_blank' : '_parent'}
          >
            {label}
          </Link>
        ))}
      </Typography>
    </div>
  );

  /* To be uncommented later */
  // This block of code is used to display contact links
  // const displayContactUs = () => {
  //     return (
  //         <div>
  //             <Typography variant='h6' className={classes.columnTitle}>
  //                 {t('footer.contactUs')}
  //             </Typography>
  //             <Typography className={classes.columnListWrapper}>
  //             {contactUs.map(({ label, href }) => {
  //                 return (
  //                     <Link href={href} className={classes.columnListItem} key={label}>
  //                         {label}
  //                     </Link>
  //                 );
  //             })}
  //             </Typography>
  //         </div>
  //     );
  // };

  const DisplayTopContributors: React.FC = () => (
    <div>
      {topContributors.length > 0 && (
      <>
        <Typography variant="h6" className={classes.columnTitle}>
          <Link
            href={EXTERNAL_LINKS.TOP_GITHUB_CONTRIBUTORS_URL}
            target="_blank"
          >
            {t('footer.topContributors')}
          </Link>
        </Typography>
        <Typography className={classes.columnListWrapper}>
          {topContributors?.slice(0, 6).map((contributor: string) => (
            <Link
              href={`${API.GITHUB_URL}${contributor}`}
              target="_blank"
              className={classes.columnListItem}
              key={contributor}
            >
              {contributor}
            </Link>
          ))}
        </Typography>
      </>
      )}
    </div>
  );

  const DisplayNewContributors: React.FC = () => (
    <div>
      {newContributors.length > 0 && (
      <>
        <Typography variant="h6" className={classes.columnTitle}>
          <Link
            href={EXTERNAL_LINKS.NEW_GITHUB_CONTRIBUTORS_URL}
            target="_blank"
          >
            {t('footer.newContributors')}
          </Link>
        </Typography>
        <Typography className={classes.columnListWrapper}>
          {newContributors?.slice(0, 6).map((contributor: string) => (
            <Link
              href={`${API.GITHUB_URL}${formatName(contributor)}`}
              target="_blank"
              className={classes.columnListItem}
              key={contributor}
            >
              {formatName(contributor)}
            </Link>
          ))}
        </Typography>
      </>
      )}
    </div>
  );

  const displayMobileFooter = () => (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
            <div>
              <Link href="/">
                {openEBSLogo}
              </Link>
            </div>
            <div>
              <Link className={classes.contributeButton}>
                <img loading="lazy" src="/images/logos/githubLogo.svg" className={classes.githubMobileIcon} alt={t('generic.github')} />
                {t('footer.contribute')}
              </Link>
            </div>
          </Paper>
        </Grid>
        {/* make it 6 once contact us and top contributors is uncommented */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {displayGetStarted()}
          </Paper>
        </Grid>
        {/* To be uncommented later */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {/* {displayContactUs()} */}
            <div className={classes.contributorsMobile}>
              <DisplayTopContributors />
            </div>
          </Paper>
        </Grid>
        {/* New contributors code block mobile */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div className={classes.contributorsMobile}>
              <DisplayNewContributors />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {displayNewsLetter()}
            {displaySocialLinks()}
          </Paper>
        </Grid>
      </Grid>
    </Toolbar>
  );

  const displayDesktopFooter = () => (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={0} justify="center">
        <Grid item sm={6}>
          <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
            <div>
              <Link href="/">
                {openEBSLogo}
              </Link>
            </div>
            <div>
              {displayNewsLetter()}
            </div>
            <div>
              {displaySocialLinks()}
            </div>
          </Paper>
        </Grid>
        {/* Make it just sm when other footer part is uncommneted */}
        <Grid item sm>
          <Paper className={classes.paper}>
            {displayGetStarted()}
          </Paper>
        </Grid>
        {/* To be uncommented later */}
        {/* <Grid item sm>
                      <Paper className={classes.paper}>
                          {displayContactUs()}
                      </Paper>
                  </Grid> */}
        <Grid item sm>
          <Paper className={classes.paper}>
            <DisplayTopContributors />
          </Paper>
        </Grid>
        {/* New contributors code block mobile */}
        <Grid item sm>
          <Paper className={classes.paper}>
            <DisplayNewContributors />
          </Paper>
        </Grid>
      </Grid>
    </Toolbar>
  );

  return (
    <div className={classes.footer}>
      <hr className={classes.topDivider} />
      {width < mobileBreakpoint ? displayMobileFooter() : displayDesktopFooter()}

      {!(width < mobileBreakpoint)
              && <hr className={classes.bottomDivider} />}

      <div className={classes.copyrightsWrapper}>
        <Typography className={classes.copyrights}>
          {t('footer.copyrights')}
        </Typography>
        <Link href="/privacy-policy" className={[classes.copyrights, classes.privacyPolicyLink].join(' ')}>
          {t('footer.privacyPolicy')}
        </Link>
      </div>
    </div>
  );
};

export default Footer;
