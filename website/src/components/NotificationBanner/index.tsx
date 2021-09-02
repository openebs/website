import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, makeStyles } from '@material-ui/core';
import notification from '../../resources/notification.json';

interface Notification {
  message: string;
  url?: string;
  linkText?: string;
}

const useStyles = makeStyles((theme) => ({
  alertBanner: {
    background: theme.palette.pattensBlue.main,
    padding: theme.spacing(1.5),
    textAlign: 'center',
    color: theme.palette.primary.main,
    '& a': {
      marginLeft: theme.spacing(0.5),
      color: theme.palette.secondary.main,
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        textDecoration: 'none',
      },
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '12px',
    },
  },
}));

const NotificationBanner: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [bannerNotification, setNotification] = useState<Notification[] | null>([]);
  useEffect(() => {
    setNotification(notification);
  }, []);

  return (
    <>
      {bannerNotification?.length && (
        <div className={classes.alertBanner}>
          {bannerNotification[0]?.message}
          {bannerNotification[0]?.url && (
            <Link href={bannerNotification[0]?.url}>
              {bannerNotification[0]?.linkText
                ? bannerNotification[0]?.linkText
                : t('generic.clickHere')}
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationBanner;
