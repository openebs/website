/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container } from '@theme-ui/components'
import mdxPageQuery from 'utils/mdx-pagequery'
import { MDXRenderer } from 'gatsby-plugin-mdx'
const CommunityMeet = () => {
  const { allMdx } = mdxPageQuery()
  const page = allMdx.edges.find((edge) => {
    return edge.node.frontmatter.title === `community-meet`
  })

  return (
    <>
      <div sx={{ height: ['200px'], pt: '60px', pb: '20px', bg: 'primary' }}>
        <Styled.h2 sx={{ textAlign: 'center' }}>Making the OpenEBS Community bigger & better</Styled.h2>
      </div>
      <div sx={{ maxWidth: ['100%', '560px', '800px'], margin: 'auto', mt: '-100px', bg: 'white', padding: '16px', borderRadius: ['0px', '8px'] }}>
        <Container sx={{ p: 4 }}>
          <MDXRenderer>{page.node.body}</MDXRenderer>
        </Container>
      </div>
    </>
  )
}

export default CommunityMeet
