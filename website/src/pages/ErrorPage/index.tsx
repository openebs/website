import { Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import { useHistory } from "react-router-dom";


const ErrorPage: React.FC = () => {
    const { t } = useTranslation();
    const classes = useStyles();
    const history = useHistory();
    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item xs={12} lg={12}>
                        <img
                            loading="lazy"
                            className={classes.errorImage}
                            src="../images/svg/404_Image.svg"
                            alt={t("errorPage.errorAltText")}
                        />
                        <Typography variant="h3" className={classes.pageHeader}>
                            {t("errorPage.description")}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            className={classes.solidButton}
                            onClick={() => {
                                history.push("/");
                            }}
                        >
                            {t("errorPage.homeBtnLable")}
                        </Button>
                    </Grid>
                </Grid>
                <img
                    loading="lazy"
                    width="100%"
                    src="../images/svg/background_illustration.svg"
                    alt={t("errorPage.backgroundAltText")}
                />
            </div>
            {/* Display footer */}
            <footer className={classes.footer}>
                <Footer />
            </footer>
        </div >
    );
};
export default React.memo(ErrorPage);
