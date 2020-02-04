import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
const RecentUpdatesQuery = () => {
  const data = useStaticQuery(graphql`
    query {
      recentUpdates: allGhostPost(
        sort: { fields: published_at, order: DESC }
        limit: 6
      ) {
        edges {
          node {
            slug
            title
            feature_image
            custom_excerpt
          }
        }
      }
    }
  `)
  return data
}

export default RecentUpdatesQuery
