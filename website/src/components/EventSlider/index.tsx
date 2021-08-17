import React, { useState, useEffect } from "react";
import Carousel from "../Carousel";
import { useTranslation } from "react-i18next";
import { Typography, Link, Box } from "@material-ui/core";
import useStyles from "./style";
import eventsList from "../../resources/events.json";
import { EXTERNAL_LINKS } from "../../constants";

interface Events {
  id: number;
  title: string;
  date: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  isDateAvailable?: boolean
}

interface EventsProps {
  sortEvents?: boolean;
  filterEvents?: boolean;
  sortOrder?: "asc" | "desc";
}

const EventSlider: React.FC<EventsProps> = ({
  sortEvents = true,
  filterEvents = true,
  sortOrder = "desc",
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [events, setEvents] = useState<Events[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Events[]>([]);
  useEffect(() => {
    setEvents(eventsList);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    /*
     * 1. Using current date to filter the events
     * 2. @filterEvents default true, the events will always show current or future events
     * 3. @sortEvents default true, events will be sorted using the date
     * 4. @sortOrder default asc, events will be sorted in ascending order
     */
    const currentDate = new Date();
    let eventsData: Events[] = [];
    let eventsWithDate: Events[] = [];
    let recurringEvents: Events[] = [];
    events.forEach((item) => {
      let givenDate = new Date(item?.date).getMonth();
      if (isNaN(givenDate)) {
        item.isDateAvailable = false;
        recurringEvents.push(item);
      }else {
        item.isDateAvailable = true;
        eventsWithDate.push(item);
      }
    });
    if (eventsWithDate.length) {
      eventsData = filterEvents
        ? eventsWithDate?.filter((event: Events) => new Date(event?.date) >= currentDate)
        : eventsWithDate;
      
      eventsData = sortEvents
        ? eventsData?.sort((eventA: Events, eventB: Events) => {
            const dateA: any = new Date(eventB?.date);
            const dateB: any = new Date(eventA?.date);
            return sortOrder === "asc" ? dateB - dateA : dateB + dateA;
          })
        : eventsData;   
    }
    const allEvents = [...eventsData, ...recurringEvents];
    setFilteredEvents([...allEvents]); 
  }, [events]); // eslint-disable-line react-hooks/exhaustive-deps
  const sliderSettings = {
    autoplay: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: filteredEvents.length > 2,
    className: `${classes.slidewrap} center`,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          swipeToSlide: true,
          infinite: filteredEvents.length > 1,
        },
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "30px",
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
 // Kept for future reference
  // function checkPastDate(date: any) {
  //   const givenDate = new Date(date);
  //   const currentDate = new Date();
  //   return givenDate > currentDate;
  // }

  return filteredEvents?.length ? (
    <>
      <Carousel settings={sliderSettings}>
        {filteredEvents?.map((event: any) => {
          return (
            <>
              <div key={event.id}>
                <div className={classes.slide}>
                  <Box mb={2}>
                    {event.isDateAvailable
                    ? <FetchDate date={event.date} /> 
                    :
                    <p>{event.date}</p>}
                  </Box>
                  <Typography variant="h4" className={classes.titleText}>
                    {event.title}
                  </Typography>
                  <Typography className={classes.subText}>
                    {event.description}
                  </Typography>
                  {event.buttonLink && (
                    <Box mt={2} className={classes.actionLink}>
                      <Link
                        className={classes.linkText}
                        href={event.buttonLink}
                        target="_blank"
                      >
                        <Box display="flex" alignItems="center">
                          {event.buttonText
                            ? event.buttonText
                            : t("community.communityEvents.clickHere")}
                          <img
                            loading="lazy"
                            src="../images/svg/arrow_orange.svg"
                            alt=""
                          />
                        </Box>
                      </Link>
                    </Box>
                  )}
                </div>
              </div>
            </>
          );
        })}
      </Carousel>
    </>
  ) : (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Typography variant="h4" className={classes.noEventText}>
      <Link target="_blank" className={classes.noEventLink} href={EXTERNAL_LINKS.CNCF_EVENTS}>{t("community.communityEvents.noEvent.message")}</Link>
      </Typography>
    </Box>
  );
};

export default EventSlider;
