import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import useStyles from './style';
import { EXTERNAL_LINKS } from '../../constants';

const JoinCommunity: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Typography variant="h2" className={classes.title}>
        {t('joinCommunity.title')}
      </Typography>
      <Grid container spacing={5}>
        <Grid item md={6} xs={12}>
          <Paper className={[classes.paper, classes.leftPaper].join(' ')}>
            <div className={classes.communityCard}>
              <iframe src="https://slack.k8s.io/" title={t('joinCommunity.slackIframeTitle')} height="480" frameBorder="0" scrolling="no" />
            </div>
          </Paper>
        </Grid>
        <Grid item md={6} xs={12}>
          <Paper className={[classes.paper, classes.rightPaper].join(' ')}>
            <div className={classes.communityCard}>
              <img loading="lazy" src="../images/logos/github_full.svg" alt={t('joinCommunity.gitHubAlt')} className={classes.gitHubLogo} />
              <div>
                <Typography variant="h4" className={classes.cardTitle}>
                  {t('joinCommunity.gitHubTitle')}
                </Typography>
                <Typography className={classes.cardBodyText}>
                  {t('joinCommunity.gitHubDescription')}
                </Typography>
              </div>
              <Button variant="contained" color="secondary" size="small" className={classes.cardButton} href={EXTERNAL_LINKS.OPENEBS_GITHUB_REPO} target="_blank">
                {t('joinCommunity.gitHubJoinButton')}
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>

    </div>
  );
};

export default JoinCommunity;
