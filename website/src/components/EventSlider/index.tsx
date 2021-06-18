import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import { Typography, Link, Box } from "@material-ui/core";
import useStyles from "./style";
import events from '../../resources/events.json';

const EventSlider: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const NextArrow = (props: any) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} ${classes.slickButtons}`}
        onClick={onClick}
      >
        <img
          loading="lazy"
          src="../Images/svg/right_arrow.svg"
          alt={t("community.communityEvents.nextArrowAlt")}
        />
      </div>
    );
  };

  const PrevArrow = (props: any) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} ${classes.slickButtons}`}
        onClick={onClick}
      >
        <img
          loading="lazy"
          src="../Images/svg/left_arrow.svg"
          alt={t("community.communityEvents.previousArrowAlt")}
        />
      </div>
    );
  };

  const settings = {
    infinite: true,
    autoplay: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    className: `${classes.slidewrap} center`,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          arrows: false,
        },
      },
    ],
  };

  const FetchDate = (date: any) => {
    const givenDate = new Date(date.date);
    const day = givenDate.getDate();
    const month = givenDate.toLocaleString("default", { month: "long" });
    return (
      <>
        <Typography className={classes.titleText} variant="h6">
          {day}
        </Typography>
        <Typography className={classes.subText}>{month}</Typography>
      </>
    );
  };

  function checkPastDate(date:any){
    const givenDate = new Date(date);
    const currentDate = new Date();
    return givenDate > currentDate;
  }

  return (
    <Slider {...settings}>
      {events.map((event: any) => {
        return (
          <div key={event.id}>
            <div className={classes.slide}>
              <Box mb={2}>
                <FetchDate date={event.date} />
              </Box>
              <Typography variant="h4" className={classes.titleText}>
                {event.title}
              </Typography>
              <Typography className={classes.subText}>
                {event.description}
              </Typography>
              {checkPastDate(event.date) && event.buttonLink && (
                <Box mt={2} className={classes.actionLInk}>
                  <Link className={classes.linkText} href={event.buttonLink} target="_blank">
                    <Box display="flex" alignItems="center">
                      {event.buttonText ? event.buttonText : t('community.communityEvents.clickHere')}
                      <img loading="lazy" src="../Images/svg/arrow_orange.svg" alt="" />
                    </Box>
                  </Link>
                </Box>
              )}
            </div>
          </div>
        );
      })}
    </Slider>
  );
};

export default EventSlider;
