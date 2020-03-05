import React, { useState, useEffect } from 'react'
import FlexBanner from 'flex-banner'
import designToken from 'gatsby-plugin-theme-ui'

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth

function useCurrentWitdh() {
  let [width, setWidth] = useState(getWidth())
  useEffect(() => {
    let timeoutId = null
    const resizeListener = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setWidth(getWidth()), 150)
    }
    window.addEventListener('resize', resizeListener)
    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [])
  return width
}

const Banner = () => {
  let width = useCurrentWitdh()
  return (
    <FlexBanner
      title="Meet us at KubeCon Amsterdam"
      ctaLink="https://go.mayadata.io/meet-us-at-kubecon-europe-2020"
      ctaTitle="Learn More"
      isCenter={true}
      crossIconSize={0}
      wrapperStyle={{
        backgroundColor: designToken.colors.primary,
        paddingTop: `${designToken.space[2]}px`,
        paddingBottom: `${designToken.space[2]}px`,
      }}
      mainStyleTitle={{
        margin: 'auto',
        fontSize: `${
          width < 640 ? designToken.fontSizes[0] : designToken.fontSizes[1]
        }px`,
      }}
      mainStyleLink={{ color: designToken.colors.light }}
      animationTime={0}
      delayToShowBanner={0}
    />
  )
}

export default Banner
