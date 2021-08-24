import React from 'react';
import { Typography } from '@material-ui/core';
import GithubAvatar from '../GithubAvatar';
import Carousel from '../Carousel';
import useStyles from './styles';
import { Testimonials, Testimonial } from './interface';

const TestimonialSlider: React.FC<Testimonials> = ({ testimonials }) => {
  const classes = useStyles();
  const testimonialSliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    cssEase: 'linear',
    arrows: true,
    centerMode: true,
    className: classes.testimonialCarousel,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          arrows: false,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Carousel settings={testimonialSliderSettings}>
      {testimonials
        && testimonials.map((testimonial: Testimonial) => (
          <div key={testimonial.organizationName}>
            <div className={classes.testimonialWrapper}>
              {testimonial.organizationName && (
              <Typography className={classes.testimonialTitle}>
                {testimonial.organizationName}
              </Typography>
              )}
              <Typography className={classes.testimonialText}>
                {testimonial.message}
              </Typography>
              <div className={classes.testimonialWriterWrapper}>
                {testimonial.githubUsername && (
                <GithubAvatar userName={testimonial.githubUsername} />
                )}
                {testimonial.name && (
                <Typography className={classes.testimonialWriter}>
                  {testimonial.name}
                </Typography>
                )}
              </div>
            </div>
          </div>
        ))}
    </Carousel>
  );
};

export default TestimonialSlider;
