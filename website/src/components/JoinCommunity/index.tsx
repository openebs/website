import { Button, Typography } from "@material-ui/core";
import React, {useState} from "react";
import useStyles from './style';
import { useTranslation } from "react-i18next";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { EXTERNAL_LINKS } from "../../constants";

const JoinCommunity: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    const [slackFlip, setSlackFlip] = useState<boolean>(false);
    const [gitHubFlip, setGitHubFlip] = useState<boolean>(false);

    const handleSlackFlip = () => {
        setSlackFlip(!slackFlip);
        setGitHubFlip(false);
    };

    const handleGitHubFlip = () => {
        setGitHubFlip(!gitHubFlip);
        setSlackFlip(false);
    };
      
    return (
        <div className={classes.root}>
            <Typography variant="h2" className={classes.title}>
                {t('joinCommunity.title')}
            </Typography>
            <Grid container spacing={5}>
                <Grid item md={6} xs={12}>
                    <Paper className={[classes.paper, classes.leftPaper, slackFlip ? classes.flip : ''].join(' ')} onClick={()=> handleSlackFlip()}>
                        <div className={classes.front}>
                            <img loading="lazy" src="../images/logos/slack_full.svg" alt={t('joinCommunity.slackAlt')}></img>
                        </div>
                        <div className={classes.back}>
                            <div className={classes.flippedCard}>
                                <iframe src="https://slack.k8s.io/" title={t('joinCommunity.slackIframeTitle')} height="480" frameBorder="0" scrolling="no"></iframe>
                            </div> 
                        </div> 
                    </Paper>
                </Grid>
                <Grid item md={6} xs={12}>
                    <Paper className={[classes.paper, classes.rightPaper, gitHubFlip ? classes.flip : ''].join(' ')} onClick={()=> handleGitHubFlip()}>
                        <div className={classes.front}>
                            <img loading="lazy" src="../images/logos/github_full.svg" alt={t('joinCommunity.gitHubAlt')}></img>
                        </div>
                        <div className={classes.back}>
                            <div className={classes.flippedCard}>
                                <img loading="lazy" src="../images/logos/github_full.svg" alt={t('joinCommunity.gitHubAlt')} className={classes.flippedLogo}></img>
                                <div>
                                    <Typography variant='h4' className={classes.cardTitle}>
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
                        </div>
                    </Paper>
                </Grid>
            </Grid>

        </div>
    );
  };
  
  export default JoinCommunity;
  