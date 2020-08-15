import React from 'react'
import FlexBanner from "flex-banner";
import * as designToken from "../../gatsby-plugin-theme-ui/index"
import notificationQuery from "../../utils/notification-query";

export const Banner = () => {
  const notifications = notificationQuery().nodes.find(res => res.notification !== null).notification;
  const latestNotification = notifications.find(res => res.isLatest === true);
  return (
    <FlexBanner
      title={latestNotification.title}
      ctaLink={latestNotification.url}
      ctaTitle={latestNotification.ctaActionText}
      isCenter={true}
      animationTime={0}
      delayToShowBanner={0}
      daysToLive={0}
      wrapperStyle={{ backgroundColor: designToken.default.colors.primary }}
      mainStyleLink={{ color: designToken.default.colors.white }}
      crossIconSize={0}
    />
  )
}
