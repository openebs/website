import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Carousal{
    children: React.ReactNode;
    settings?: any;
    className?: string;
}

const useStyles = makeStyles({
  slickButtons: {
    display: 'block',
    '&:before': {
      display: 'none',
    },
  },
});

const Carousel: React.FC<Carousal> = ({ children, settings, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NextArrow = (props: any) => {
    const { className, onClick } = props;
    return (
      <span role="button" tabIndex={0} className={`${className} ${classes.slickButtons}`} onClick={onClick} onKeyPress={onClick}>
        <img
          loading="lazy"
          src="../images/svg/right_arrow.svg"
          alt={t('generic.next')}
        />
      </span>
    );
  };

  const PrevArrow = (props: any) => {
    const { className, onClick } = props;
    return (
      <span role="button" tabIndex={-1} className={`${className} ${classes.slickButtons}`} onClick={onClick} onKeyPress={onClick}>
        <img
          loading="lazy"
          src="../images/svg/left_arrow.svg"
          alt={t('generic.prev')}
        />
      </span>
    );
  };

  const defaultSettings = {
    dots: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    cssEase: 'linear',
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };
  const sliderSettings = { ...defaultSettings, ...settings };
  return (
    <Slider {...sliderSettings} {...props}>
      {children}
    </Slider>
  );
};

export default Carousel;
