import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

const mdxPageQuery = () => {
  const data = useStaticQuery(graphql`
    query markdownPageQuery {
      allMdx {
        edges {
          node {
            body
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)
  return data
}

export default mdxPageQuery
