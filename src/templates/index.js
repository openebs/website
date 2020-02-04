/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import PostCard from 'components/post-card'
import Pagination from 'components/pagination'
import Layout from 'components/layout'

import { MetaData } from 'components/common/meta'
import { Grid, Container } from '@theme-ui/components'
import TagsList from 'components/tags-list'
/**
 * Main index page (home page)
 *
 * Loads all posts from Ghost and uses pagination to navigate through them.
 * The number of posts that should appear per page can be setup
 * in /utils/siteConfig.js under `postsPerPage`.
 *
 */
const Index = ({ data, location, pageContext }) => {
  const posts = data.allGhostPost.edges

  return (
    <>
      <MetaData location={location} />
      <Layout isHome={false}>
        <Container sx={{ maxWidth: '1048px', margin: 'auto' }}>
          <div sx={{ pb: '3' }}>
            <div sx={{ py: '4' }}>
              <hr />
            </div>
            <section>
              <div
                sx={{
                  display: 'grid',
                  gridGap: 4,
                  gridTemplateColumns: [
                    'auto',
                    'minmax(256px, 1fr) minmax(256px, 1fr)',
                    'minmax(256px, 1fr) minmax(256px, 1fr) minmax(256px, 1fr)',
                  ],
                }}
              >
                {posts.map(({ node }) => (
                  // The tag below includes the markup for each post - components/common/PostCard.js
                  <PostCard key={node.id} post={node} />
                ))}
              </div>
            </section>
          </div>
          <Pagination pageContext={pageContext} />
        </Container>
      </Layout>
    </>
  )
}

Index.propTypes = {
  data: PropTypes.shape({
    allGhostPost: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.object,
}

export default Index

// This page query loads all posts sorted descending by published date
// The `limit` and `skip` values are used for pagination
export const pageQuery = graphql`
  query GhostPostQuery($limit: Int!, $skip: Int!) {
    allGhostPost(
      sort: { order: DESC, fields: [published_at] }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          ...GhostPostFields
        }
      }
    }
  }
`
