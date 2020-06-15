/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container } from '@theme-ui/components'
import mdxPageQuery from 'utils/mdx-pagequery'
import { MDXRenderer } from 'gatsby-plugin-mdx'
const Support = () => {
  const { allMdx } = mdxPageQuery()
  const page = allMdx.edges.find((edge) => {
    return edge.node.frontmatter.title === 'support'
  })

  return (
    <>
      <Container sx={{ p: 4 }}>
        <MDXRenderer>{page.node.body}</MDXRenderer>
      </Container>
    </>
  )
}

export default Support
