import React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import useStyles from './style';
import Footer from '../../components/Footer';

const PrivacyPolicy: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const doNotTrackSignalsPointers = [
    t('privacyPolicy.doNotTrackSignals.pointers.point1'),
    t('privacyPolicy.doNotTrackSignals.pointers.point2'),
    t('privacyPolicy.doNotTrackSignals.pointers.point3'),
    t('privacyPolicy.doNotTrackSignals.pointers.point4'),
    t('privacyPolicy.doNotTrackSignals.pointers.point5'),
    t('privacyPolicy.doNotTrackSignals.pointers.point6'),
    t('privacyPolicy.doNotTrackSignals.pointers.point7'),
  ];

  const rightWithPersonalInfo = [
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point1'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point2'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point3'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point4'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point5'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point6'),
    t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.point7'),
  ];

  return (
    <div className={classes.root}>
      <div className={classes.pageSpacing}>
        <Typography variant="h1" className={classes.pageHeader}>
          {t('privacyPolicy.pageTitle')}
        </Typography>

        <Typography className={classes.bodyText}>
          {/* <Trans> component in react-i18next allows us to add HTML in our translation texts */}
          <Trans i18nKey="privacyPolicy.intro">
            OpenEBS knows that you care about how your personal information is
            used and shared, and we take your privacy seriously. Please read the
            following to learn more about our privacy policy. By visiting
            {' '}
            <a href="/" className={classes.link}>
              {' '}
              openebs.io
              {' '}
            </a>
            {' '}
            (the `&quot;`Site`&quot;`), you acknowledge that you accept the practices and
            policies outlined in this Privacy Policy. For the purposes of the EU
            General Data Protection Regulation 2016 (the `&quot;`GDPR`&quot;`), the data
            controller is MayaData, Inc. whose registered office is at 4300
            Stevens Creek Boulevard, Suite 270, San Jose, CA 95129.
          </Trans>
          {/* {t('privacyPolicy.intro')} */}
        </Typography>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.informationCollection.title')}
        </Typography>

        <Typography variant="h6" className={classes.sectionSubHeader}>
          {t('privacyPolicy.informationCollection.infoProvidedByUserTitle')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t(
            'privacyPolicy.informationCollection.infoProvidedByUserDescription',
          )}
        </Typography>

        <Typography variant="h6" className={classes.sectionSubHeader}>
          {t('privacyPolicy.informationCollection.infoCollectedByUsTitle')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t(
            'privacyPolicy.informationCollection.infoCollectedByUsDescription',
          )}
        </Typography>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.cookies.title')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t('privacyPolicy.cookies.description')}
        </Typography>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.doNotTrackSignals.title')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t('privacyPolicy.doNotTrackSignals.decription')}
        </Typography>

        <ul className={classes.bodyText}>
          {doNotTrackSignalsPointers.map((item) => (
            <li key={item} className={classes.listItem}>
              {item}
            </li>
          ))}
        </ul>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.emailCommunication.title')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t('privacyPolicy.emailCommunication.description')}
        </Typography>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.childrenAndPolicy.title')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t('privacyPolicy.childrenAndPolicy.description')}
        </Typography>

        <Typography variant="h4" className={classes.sectionHeader}>
          {t('privacyPolicy.infoToOutsideParties.title')}
        </Typography>

        <Typography className={classes.bodyText}>
          {t('privacyPolicy.infoToOutsideParties.description')}
        </Typography>
      </div>
      <div className={classes.background}>
        <div className={classes.pageSpacing}>
          <Typography variant="h4" className={classes.sectionHeader}>
            {t('privacyPolicy.transferOfInfo.title')}
          </Typography>

          <Typography className={classes.bodyText}>
            {t('privacyPolicy.transferOfInfo.description')}
          </Typography>

          <Typography variant="h6" className={classes.sectionSubHeader}>
            {t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.title')}
            {' '}
            :
          </Typography>

          <ul className={classes.bodyText}>
            {rightWithPersonalInfo.map((item) => (
              <li key={item} className={classes.listItem}>
                {item}
              </li>
            ))}
          </ul>

          <Typography className={classes.bodyText}>
            {t('privacyPolicy.transferOfInfo.rightWithPersonalInfo.conclusion')}
          </Typography>

          <div className={classes.lastDiv}>
            <Typography variant="h4" className={classes.sectionHeader}>
              {t('privacyPolicy.changesToPrivacyPolicy.title')}
            </Typography>

            <Typography className={classes.bodyText}>
              {t('privacyPolicy.changesToPrivacyPolicy.description')}
            </Typography>
          </div>
        </div>

        {/* Display footer */}
        <footer className={classes.footer}>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicy);
