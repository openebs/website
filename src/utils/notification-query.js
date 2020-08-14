import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

const notificationQuery = () => {
  const { allDataJson } = useStaticQuery(graphql`
    query NotificationQuery {
      allDataJson {
        nodes {
          notification {
            title
            url
            isLatest
            ctaActionText
          }
        }
      }
    }
  `)
  return allDataJson
}

export default notificationQuery
