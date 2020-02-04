/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { Container } from '@theme-ui/components'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import mdxPageQuery from '../../utils/mdx-pagequery'

const PrivacyPolicy = () => {
  const { allMdx } = mdxPageQuery()
  const page = allMdx.edges.find((edge) => {
    return edge.node.frontmatter.title === 'privacy-policy'
  })
  return (
    <>
      <Container sx={{ p: 4 }}>
        <MDXRenderer>{page.node.body}</MDXRenderer>
      </Container>
    </>
  )
}

export default PrivacyPolicy
