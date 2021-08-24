import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Carousel from '../Carousel';

const useStyles = makeStyles((theme) => ({
  adopterSlider: {
    marginTop: theme.spacing(6),
  },
  adopterSlide: {
    margin: theme.spacing(0, 2),
  },
}));

const AdopterSlider: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const settings = {
    dots: false,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 8000,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    arrows: false,
  };

  const adopters = [
    {
      logo: '../images/logos/bloomberg_blue.png',
      name: t('home.usedInProductionBy.bloomberg'),
    },
    {
      logo: '../images/logos/arista_blue.png',
      name: t('home.usedInProductionBy.arista'),
    },
    {
      logo: '../images/logos/orange_blue.png',
      name: t('home.usedInProductionBy.orange'),
    },
    {
      logo: '../images/logos/optoro_blue.png',
      name: t('home.usedInProductionBy.optoro'),
    },
    {
      logo: '../images/logos/comcast_blue.png',
      name: t('home.usedInProductionBy.comcast'),
    },
    {
      logo: '../images/logos/bloomberg_blue.png',
      name: t('home.usedInProductionBy.bloomberg'),
    },
    {
      logo: '../images/logos/arista_blue.png',
      name: t('home.usedInProductionBy.arista'),
    },
    {
      logo: '../images/logos/orange_blue.png',
      name: t('home.usedInProductionBy.orange'),
    },
    {
      logo: '../images/logos/optoro_blue.png',
      name: t('home.usedInProductionBy.optoro'),
    },
    {
      logo: '../images/logos/comcast_blue.png',
      name: t('home.usedInProductionBy.comcast'),
    },
    {
      logo: '../images/logos/agnes.png',
      name: t('home.usedInProductionBy.agnes'),
    },
    {
      logo: '../images/logos/bytedance.png',
      name: t('home.usedInProductionBy.byteDance'),
    },
    {
      logo: '../images/logos/clew.png',
      name: t('home.usedInProductionBy.clew'),
    },
    {
      logo: '../images/logos/cloud-native.png',
      name: t('home.usedInProductionBy.cloudNative'),
    },
    {
      logo: '../images/logos/codewave.png',
      name: t('home.usedInProductionBy.codewave'),
    },
    {
      logo: '../images/logos/cort.png',
      name: t('home.usedInProductionBy.cort'),
    },
    {
      logo: '../images/logos/d-rating.png',
      name: t('home.usedInProductionBy.dRating'),
    },
    {
      logo: '../images/logos/disid.png',
      name: t('home.usedInProductionBy.disid'),
    },
    {
      logo: '../images/logos/exact.png',
      name: t('home.usedInProductionBy.exact'),
    },
    {
      logo: '../images/logos/hamravesh.png',
      name: t('home.usedInProductionBy.hamravesh'),
    },
    {
      logo: '../images/logos/idnt.png',
      name: t('home.usedInProductionBy.idnt'),
    },
    {
      logo: '../images/logos/kpn.png',
      name: t('home.usedInProductionBy.kpn'),
    },
    {
      logo: '../images/logos/kubesphere.png',
      name: t('home.usedInProductionBy.kubesphere'),
    },
    {
      logo: '../images/logos/plaidcloud.png',
      name: t('home.usedInProductionBy.plaidCloud'),
    },
    {
      logo: '../images/logos/renthopper.png',
      name: t('home.usedInProductionBy.rentHopper'),
    },
    {
      logo: '../images/logos/sharecare.png',
      name: t('home.usedInProductionBy.SHARECARE'),
    },
    {
      logo: '../images/logos/stratus5.png',
      name: t('home.usedInProductionBy.stratus5'),
    },
    {
      logo: '../images/logos/tobg.png',
      name: t('home.usedInProductionBy.tobg'),
    },
    {
      logo: '../images/logos/verizon-media.png',
      name: t('home.usedInProductionBy.verzionMedia'),
    },
    {
      logo: '../images/logos/zeta-associates.png',
      name: t('home.usedInProductionBy.zetaAssociates'),
    },
  ];

  return (
    <Carousel settings={settings} className={classes.adopterSlider}>
      {adopters.map(({ logo, name }) => (
        <div key={name} className={classes.adopterSlide}>
          <img loading="lazy" src={logo} alt={name} />
        </div>
      ))}
    </Carousel>
  );
};

export default AdopterSlider;
