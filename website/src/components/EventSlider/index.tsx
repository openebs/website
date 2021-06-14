import React from "react";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";
import { Typography, Link, Box } from "@material-ui/core";
import useStyles from "./style";
import { events } from "./events";

const EventSlider: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const NextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <img
          src="../Images/svg/right_arrow.svg"
          alt={t("home.adaptorsTestimonials.nextArrowAlt")}
        />
      </div>
    );
  };

  const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <img
          src="../Images/svg/left_arrow.svg"
          alt={t("home.adaptorsTestimonials.previousArrowAlt")}
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
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          infinite: false,
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

  return (
    <Slider {...settings}>
      {events.map((event: any) => {
        return (
          <div>
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
              {event.buttonText && (
                <Box mt={2}>
                  <Link className={classes.linkText} href={event.buttonLink}>
                    <Box display="flex">
                      {event.buttonText}
                      <img src="../Images/svg/arrow_orange.svg" alt="" />
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
