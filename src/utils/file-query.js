import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
const FileQuery = () => {
  const data = useStaticQuery(graphql`
    query {
      allPdf: allFile(filter: { extension: { regex: "/^(pdf)$/" } }) {
        edges {
          node {
            publicURL
            name
          }
        }
      }
    }
  `)
  return data
}

export default FileQuery
