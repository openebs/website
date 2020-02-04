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
/**
 * Tag page (/tag/:slug)
 *
 * Loads all posts for the requested tag incl. pagination.
 *
 */
const Tag = ({ data, location, pageContext }) => {
  const tag = data.ghostTag
  const posts = data.allGhostPost.edges
  return (
    <>
      <MetaData data={data} location={location} type="series" />
      <Layout>
        <Container sx={{ maxWidth: '1048px', margin: 'auto' }}>
          <div
            sx={{
              pt: '3',
              pb: '3',
            }}
          >
            <header className="tag-header">
              <h1 sx={{ textAlign: ['center', 'left'] }}>{tag.name}</h1>
              {tag.description ? <p>{tag.description}</p> : null}
            </header>
            <section
              sx={{
                maxWidth: `1048px`,
              }}
            >
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

Tag.propTypes = {
  data: PropTypes.shape({
    ghostTag: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
    allGhostPost: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.object,
}

export default Tag

export const pageQuery = graphql`
  query GhostTagQuery($slug: String!, $limit: Int!, $skip: Int!) {
    ghostTag(slug: { eq: $slug }) {
      ...GhostTagFields
    }
    allGhostPost(
      sort: { order: DESC, fields: [published_at] }
      filter: { tags: { elemMatch: { slug: { eq: $slug } } } }
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
