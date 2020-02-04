import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
const ImageQuery = () => {
  const data = useStaticQuery(graphql`
    query {
      allImages: allFile(
        filter: { extension: { regex: "/^(png|svg|jpeg|jpg)$/" } }
      ) {
        edges {
          node {
            id
            publicURL
            extension
            name
            relativePath
            relativeDirectory
            childImageSharp {
              fluid(maxWidth: 300) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `)
  return data
}

export default ImageQuery
