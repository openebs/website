import { Button, IconButton, TextField, Typography } from "@material-ui/core";
import React, {useEffect, useState} from "react";
import useStyles from './style';
import { useTranslation } from "react-i18next";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { validateEmail } from "../../utils/emailValidation";
import { EXTERNAL_LINKS } from "../../constants";

const JoinCommunity: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    const [slackFlip, setSlackFlip] = useState<boolean>(false);
    const [gitHubFlip, setGitHubFlip] = useState<boolean>(false);
    const [emailValue, setEmailValue] = useState<string>('');
    const [disableContinueButton, setDisableContinueButton] = useState<boolean>(true);

    useEffect(() => {
        // Enable continue button when email is valid
        validateEmail(emailValue) ? setDisableContinueButton(false) : setDisableContinueButton(true);
    },[emailValue]);

    const handleSlackInvite = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Need to write logic to send slack invite
    };

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
                <Grid item sm={6} xs={12}>
                    <Paper className={[classes.paper, classes.leftPaper, slackFlip ? classes.flip : ''].join(' ')} onClick={()=> handleSlackFlip()}>
                        <div className={classes.front}>
                            <img src="../Images/logos/slack_full.svg" alt={t('joinCommunity.slackAlt')}></img>
                        </div>
                        <div className={classes.back}>
                            <div className={classes.flippedCard}>
                                <img src="../Images/logos/slack_full.svg" alt={t('joinCommunity.slackAlt')} className={classes.flippedLogo}></img>
                                <Typography variant='h4' className={classes.cardTitle}>
                                    {t('joinCommunity.slackTitle')}
                                </Typography>
                                <form noValidate autoComplete="on" onSubmit={handleSlackInvite}>
                                    <div className={classes.formWrapper}>
                                        <TextField
                                        label={t('joinCommunity.emailLabel')}
                                        fullWidth
                                        name="email"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                            setEmailValue(e.target.value)
                                        }
                                        InputProps={{
                                            className: classes.input,
                                        }}
                                        InputLabelProps={{
                                            className: classes.label,
                                        }}
                                        />
                                        <IconButton aria-label="submit" className={classes.iconButton} disabled={disableContinueButton} type="submit">
                                            <img src="../Images/svg/arrow_orange.svg" alt={t('joinCommunity.submitAlt')}/>
                                        </IconButton>
                                    </div>
                                </form>
                            </div> 
                        </div> 
                    </Paper>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Paper className={[classes.paper, classes.rightPaper, gitHubFlip ? classes.flip : ''].join(' ')} onClick={()=> handleGitHubFlip()}>
                        <div className={classes.front}>
                            <img src="../Images/logos/github_full.svg" alt={t('joinCommunity.gitHubAlt')}></img>
                        </div>
                        <div className={classes.back}>
                            <div className={classes.flippedCard}>
                                <img src="../Images/logos/github_full_small.svg" alt={t('joinCommunity.gitHubAlt')} className={classes.flippedLogo}></img>
                                <Typography variant='h4' className={classes.cardTitle}>
                                    {t('joinCommunity.gitHubTitle')}
                                </Typography>
                                <Typography className={classes.cardBodyText}>
                                    {t('joinCommunity.gitHubDescription')}
                                </Typography>
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
  