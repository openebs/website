/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import ImageQuery from 'utils/image-query'
/*
 * This component is built using `gatsby-image` to automatically serve optimized
 * images with lazy loading and reduced file sizes. The image is loaded using a
 * `useStaticQuery`, which allows us to load the image from directly within this
 * component, rather than having to pass the image data down from pages.
 *
 * For more information, see the docs:
 * - `gatsby-image`: https://gatsby.dev/gatsby-image
 * - `useStaticQuery`: https://www.gatsbyjs.org/docs/use-static-query/
 */
const getRelativeDir = (src) => {
  return (
    (src &&
      src
        .split('/')
        .slice(0, -1)
        .join('/')) ||
    ''
  )
}

// It takes style as a prop and uses its value to assign to sx props.
// All the properties which are valid to sx, will be valid to style props
const Image = (props) => {
  const { src, style } = props
  const relDir = getRelativeDir(src)
  const image = ImageQuery().allImages.edges.find((edge) => {
    return (
      edge.node.relativePath === src && edge.node.relativeDirectory === relDir
    )
  })

  if (image === undefined || typeof image === undefined) {
    throw new Error('Image not found')
    return ''
  }
  if (image.node.extension === 'svg') {
    return (
      <img src={image.node.publicURL} alt={image.node.name} sx={{ ...style }} />
    )
  }
  return <Img fluid={image.node.childImageSharp.fluid} sx={{ ...style }} />
}

export default Image
