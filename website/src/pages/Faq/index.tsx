import React from "react";
import { useTranslation } from "react-i18next";
import useStyles from "./styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  Container,
  createStyles,
  Paper,
  Theme,
  useMediaQuery,
  withStyles,
} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Newsletter from "../../components/Newsletter";
import Footer from "../../components/Footer";
import FaqDetails from "./faqData";
import ReactMarkdown from "react-markdown";
import Sponsor from "../../components/Sponsor";

interface FaqDataProps {
  id: number;
  title: string;
  desc: string;
  topic: string;
  topic_id: number;
}
interface StyledTabProps {
  label: string;
}

const Faq: React.FC<FaqDataProps> = () => {
  const StyledTab = withStyles((theme: Theme) =>
    createStyles({
      root: {
        textTransform: "none",
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightBold,
        fontSize: "16px",
        opacity: 1,
        marginRight: theme.spacing(1),
        "&:focus": {
          opacity: 1,
          color: theme.palette.warning.dark,
        },
        "&:active": {
          opacity: 1,
          color: theme.palette.warning.dark,
        },
      },
    })
  )((props: StyledTabProps) => <Tab disableRipple {...props} />);

  const { t } = useTranslation();
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [expanded, setExpanded] = React.useState<number | false>(0);
  const mediumViewport = useMediaQuery("(min-width:600px)");

  const handleChangeAccordion = (query: number) => (
    _event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? query : false);
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const nodeRef = React.useRef(null);
  const filteredData = FaqDetails().filter((e: any) => e.topic_id === value);
  return (
    <>
      {/* Heading section for desktop and mobile views */}
      <div className={classes.root}>
        <Container maxWidth="lg">
          <h1 className={classes.mainText}>{t("faq.mainText")}</h1>
          <p>{t("faq.subText")}</p>
          <Paper className={classes.tabs}>
            <Tabs
              value={value}
              classes={{ 
                root: classes.tabRoot, scroller: classes.scroller }}
              onChange={handleChange}
              textColor="secondary"
              variant="standard"
              TabIndicatorProps={{
                style: {
                  display: "none",
                },
              }}
              orientation={mediumViewport ? "horizontal" : "vertical"}
              centered
            >
              <StyledTab label={t("faq.usage")} />
              <StyledTab label={t("faq.architecture")} />
              <StyledTab label={t("faq.gettingStarted")} />
              <StyledTab label={t("faq.performance")} />
            </Tabs>
          </Paper>
        </Container>
      </div>

      {/* Accorion list for faqs section */}
      <div className={classes.accordionRoot}>
        {filteredData ? (
          filteredData.map((query: FaqDataProps) => {
            return (
              <Accordion
                key={query.id}
                ref={nodeRef}
                className={classes.accordion}
                classes={{
                  root: classes.MuiAccordionroot,
                }}
                expanded={expanded === query.id}
                onChange={handleChangeAccordion(query.id)}
              >
                <AccordionSummary
                  expandIcon={
                    expanded !== query.id ? (
                      <AddIcon className={classes.buttonIcon} />
                    ) : (
                      <RemoveIcon className={classes.buttonIcon} />
                    )
                  }
                  aria-controls="panel1a-content"
                >
                  <Typography
                    className={
                      expanded !== query.id
                        ? classes.heading
                        : classes.headingSelected
                    }
                  >
                    {query.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                    <span>
                      <ReactMarkdown children={query.desc} />
                    </span>
                </AccordionDetails>
              </Accordion>
            );
          })
        ) : (
          <p>{t("faq.noData")}</p>
        )}
      </div>
      <div className={classes.faqFooter}>
      {/* Newsletter section just need to pass the text accordingly */}
      <Newsletter newsletterTitle={t("newsletter.title")} />

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

export default React.memo(Faq);
