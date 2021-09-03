import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@material-ui/core';
import notification from '../../resources/notification.json';
import { dateValidator } from '../../utils/dateValidator';
import useStyles from './styles';

interface Notification {
  message: string;
  url?: string;
  linkText?: string;
  hideAfter?: string;
}

const NotificationBanner: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [bannerNotification, setBannerNotification] = useState<
    Notification[] | null
  >([]);
  useEffect(() => {
    setBannerNotification(notification);
  }, []);

  return (
    <>
      {bannerNotification?.length
        && dateValidator(bannerNotification[0]?.hideAfter!) && (
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
